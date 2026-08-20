package ai.nexhire.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

@Component
public class DatabaseSchemaInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaInitializer.class);
    private final DataSource dataSource;

    public DatabaseSchemaInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void ensureSchemaIntegrity() {
        try (Connection con = dataSource.getConnection(); Statement stmt = con.createStatement()) {
            DatabaseMetaData meta = con.getMetaData();
            String dbType = meta.getDatabaseProductName().toLowerCase();
            log.info("Checking database schema integrity for product: {}", dbType);

            // Check columns on CANDIDATE_PROFILES
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "CURRENT_COMPANY", "VARCHAR2(150)");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "CURRENT_JOB_TITLE", "VARCHAR2(150)");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "EMPLOYMENT_STATUS", "VARCHAR2(50) DEFAULT 'UNEMPLOYED'");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "IS_AVAILABLE", "NUMBER(1, 0) DEFAULT 1");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "JOB_SEEKING_STATUS", "VARCHAR2(50) DEFAULT 'ACTIVELY_LOOKING'");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "HIRED_DATE", "TIMESTAMP");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "CURRENT_EMPLOYER_ID", "VARCHAR2(36)");
            addColumnIfMissing(con, stmt, "CANDIDATE_PROFILES", "AVAILABLE_FOR_WORK", "NUMBER(1, 0) DEFAULT 0");

            // Check columns on APPLICATIONS
            addColumnIfMissing(con, stmt, "APPLICATIONS", "ATS_SCORE", "NUMBER(3, 0)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "AI_RECOMMENDATION", "VARCHAR2(100)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "MATCHED_SKILLS", "VARCHAR2(2000)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "MISSING_SKILLS", "VARCHAR2(2000)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "EXPERIENCE_SCORE", "NUMBER(3, 0)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "EDUCATION_SCORE", "NUMBER(3, 0)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "HIRED_AT", "TIMESTAMP");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "HIRED_BY", "VARCHAR2(36)");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "OFFER_ACCEPTED_AT", "TIMESTAMP");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "JOINING_DATE", "TIMESTAMP");
            addColumnIfMissing(con, stmt, "APPLICATIONS", "SALARY_OFFERED", "NUMBER(12, 2)");

            // Check columns on JOBS
            addColumnIfMissing(con, stmt, "JOBS", "MINIMUM_SCORE", "NUMBER(3, 0) DEFAULT 80");
            addColumnIfMissing(con, stmt, "JOBS", "TOTAL_OPENINGS", "NUMBER(10, 0) DEFAULT 1");
            addColumnIfMissing(con, stmt, "JOBS", "FILLED_POSITIONS", "NUMBER(10, 0) DEFAULT 0");

            // Check columns on INTERVIEWS
            addColumnIfMissing(con, stmt, "INTERVIEWS", "CANDIDATE_ID", "VARCHAR2(36)");
            addColumnIfMissing(con, stmt, "INTERVIEWS", "MEETING_PROVIDER", "VARCHAR2(50)");
            addColumnIfMissing(con, stmt, "INTERVIEWS", "MEETING_ID", "VARCHAR2(100)");

            log.info("Database schema integrity verification completed.");
        } catch (Exception e) {
            log.warn("Database schema integrity warning: {}", e.getMessage());
        }
    }

    private void addColumnIfMissing(Connection con, Statement stmt, String tableName, String columnName, String columnDefinition) {
        try {
            DatabaseMetaData meta = con.getMetaData();
            Set<String> existingColumns = new HashSet<>();
            try (ResultSet rs = meta.getColumns(null, null, tableName.toUpperCase(), null)) {
                while (rs.next()) {
                    existingColumns.add(rs.getString("COLUMN_NAME").toUpperCase());
                }
            }
            // In case lowercase table names were used
            if (existingColumns.isEmpty()) {
                try (ResultSet rs = meta.getColumns(null, null, tableName.toLowerCase(), null)) {
                    while (rs.next()) {
                        existingColumns.add(rs.getString("COLUMN_NAME").toUpperCase());
                    }
                }
            }

            if (!existingColumns.contains(columnName.toUpperCase())) {
                String sql = "ALTER TABLE " + tableName + " ADD (" + columnName + " " + columnDefinition + ")";
                try {
                    stmt.execute(sql);
                    log.info("Successfully added missing column: {}.{}", tableName, columnName);
                } catch (Exception alterEx) {
                    // Try alternative syntax (without parentheses for non-Oracle)
                    try {
                        String altSql = "ALTER TABLE " + tableName + " ADD " + columnName + " " + columnDefinition;
                        stmt.execute(altSql);
                        log.info("Successfully added missing column with alternative syntax: {}.{}", tableName, columnName);
                    } catch (Exception e) {
                        log.debug("Column addition could not be performed: {} (may already exist)", e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error checking column {}.{}: {}", tableName, columnName, e.getMessage());
        }
    }
}
