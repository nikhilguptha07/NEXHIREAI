package ai.nexhire.config;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.catalina.Host;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.startup.Tomcat;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Automatically redirects requests from the server root ("/") to the API Swagger documentation ("/api/swagger-ui/index.html").
 * This prevents Tomcat from showing a raw "HTTP Status 404 - Not Found" when someone visits the service base URL in a browser.
 */
@Configuration
public class TomcatRootRedirectConfig {

    @Bean
    public TomcatServletWebServerFactory servletContainer() {
        return new TomcatServletWebServerFactory() {
            @Override
            protected void prepareContext(Host host, ServletContextInitializer[] initializers) {
                super.prepareContext(host, initializers);

                StandardContext rootContext = new StandardContext();
                rootContext.setPath("");
                rootContext.addLifecycleListener(new Tomcat.FixContextListener());

                Tomcat.addServlet(rootContext, "rootRedirectServlet", new HttpServlet() {
                    @Override
                    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
                        resp.sendRedirect("/api/swagger-ui/index.html");
                    }
                });

                rootContext.addServletMappingDecoded("/*", "rootRedirectServlet");
                host.addChild(rootContext);
            }
        };
    }
}
