# ── Build Stage ─────────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies in a separate layer for fast rebuilds
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy backend source code and build production JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create a non-root system user for security
RUN groupadd -r nexhire && useradd -r -g nexhire -u 1001 nexhire

# Copy the executable Spring Boot JAR from build stage
COPY --from=build --chown=nexhire:nexhire /app/target/nexhire-backend.jar app.jar

# Switch to non-root user
USER 1001:nexhire

# Expose backend port
EXPOSE 8080

# Configure production environment variables and container-aware JVM flags
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Launch the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
