package ai.nexhire.config;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis cache configuration with JSON serialization.
 *
 * <p>Per-cache TTLs are tuned for a hiring domain:
 * <ul>
 *   <li>{@code userRoles} — 5m</li>
 *   <li>{@code jobSnippets} — 10m</li>
 *   <li>{@code lookups} — 60m (reference data)</li>
 * </ul>
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_USER_ROLES = "userRoles";
    public static final String CACHE_JOB_SNIPPETS = "jobSnippets";
    public static final String CACHE_LOOKUPS = "lookups";

    @Bean
    public RedisCacheConfiguration redisCacheConfiguration(ObjectMapper objectMapper) {
        ObjectMapper cacheMapper = objectMapper.copy();
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .computePrefixWith(cacheName -> "nexhire:" + cacheName + ":")
                .serializeKeysWith(
                        SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer(cacheMapper)));
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(
            RedisCacheConfiguration base) {
        return builder -> builder
                .withCacheConfiguration(CACHE_USER_ROLES,
                        base.entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration(CACHE_JOB_SNIPPETS,
                        base.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration(CACHE_LOOKUPS,
                        base.entryTtl(Duration.ofMinutes(60)));
    }
}
