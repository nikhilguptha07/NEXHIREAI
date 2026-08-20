package ai.nexhire.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;
import org.springframework.web.filter.ForwardedHeaderFilter;

import java.util.concurrent.Executor;

/**
 * Cross-cutting Spring beans: Jackson, async executor (security-aware),
 * forwarded-header filter for reverse proxy support.
 */
@Configuration
@EnableAsync
public class BeansConfig {

    /**
     * Tunes Jackson: ISO-8601 timestamps, ISO-8601 durations, lowercase enums.
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> builder
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Async executor used by {@code @Async} services. Propagates the
     * Spring Security context across threads.
     */
    @Bean("nexhireAsyncExecutor")
    public Executor nexhireAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("nexhire-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return new DelegatingSecurityContextAsyncTaskExecutor(executor);
    }

    /**
     * Forwards {@code X-Forwarded-*} headers from Nginx / load balancer.
     */
    @Bean
    public ForwardedHeaderFilter forwardedHeaderFilter() {
        return new ForwardedHeaderFilter();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
