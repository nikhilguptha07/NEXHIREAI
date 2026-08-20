package ai.nexhire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;

/**
 * NEXHIRE AI — application entrypoint.
 *
 * <p>Enterprise AI-powered hiring platform backend. Built on Spring Boot 3,
 * Java 25, and Oracle Database 26ai (vector search, JSON duality views,
 * PL/SQL packages, scheduler, AQ).
 */
@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "ai.nexhire")
@EnableAsync
@EnableScheduling
@OpenAPIDefinition(
        info = @Info(
                title = "NEXHIRE AI API",
                version = "1.0.0",
                description = "Enterprise AI-powered hiring platform API.",
                contact = @Contact(name = "NEXHIRE AI", email = "engineering@nexhire.ai"),
                license = @License(name = "Proprietary")
        ))
public class NexhireApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexhireApplication.class, args);
    }
}
