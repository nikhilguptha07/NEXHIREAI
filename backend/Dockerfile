# ── Build Stage ─────────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven POM descriptor and source directory
COPY pom.xml .
COPY src ./src

# Build production JAR skipping test execution
RUN mvn clean package -DskipTests

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the executable Spring Boot JAR built in the build stage
COPY --from=build /app/target/nexhire-backend.jar app.jar

# Expose backend port
EXPOSE 8080

# Set default environment variables
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

# Launch the Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
