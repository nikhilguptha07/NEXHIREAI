package ai.nexhire.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DataSourceInfo {

    private final DataSource dataSource;

    public DataSourceInfo(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void printDataSource() {
        try (Connection con = dataSource.getConnection()) {

            System.out.println();
            System.out.println("==========================================");
            System.out.println("      NEXHIRE DATABASE INFORMATION");
            System.out.println("==========================================");
            System.out.println("URL      : " + con.getMetaData().getURL());
            System.out.println("User     : " + con.getMetaData().getUserName());
            System.out.println("Product  : " + con.getMetaData().getDatabaseProductName());
            System.out.println("Version  : " + con.getMetaData().getDatabaseProductVersion());
            System.out.println("==========================================");
            System.out.println();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}