package ai.nexhire.config;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ai.nexhire.config.NexhireProperties.CorsProps;
import ai.nexhire.config.NexhireProperties.OracleProps;
import ai.nexhire.config.NexhireProperties.RateLimitProps;
import ai.nexhire.config.NexhireProperties.SecurityProps;
import ai.nexhire.config.NexhireProperties.StorageProps;
import org.junit.jupiter.api.Test;

class NexhirePropertiesTest {

    @Test
    void originsSplitsCommaSeparatedValues() {
        CorsProps props = new CorsProps("https://a.example, https://b.example");

        assertArrayEquals(new String[]{"https://a.example", "https://b.example"}, props.origins());
    }

    @Test
    void originsReturnsEmptyArrayWhenValueIsBlank() {
        CorsProps props = new CorsProps("   ");

        assertArrayEquals(new String[0], props.origins());
    }

    @Test
    void accessTtlUsesDefaultWhenMissing() {
        SecurityProps.JwtProps jwt = new SecurityProps.JwtProps(null, null, null, "issuer", "audience");

        assertEquals(15L, jwt.accessTtl().toMinutes());
    }

    @Test
    void refreshTtlUsesDefaultWhenMissing() {
        SecurityProps.JwtProps jwt = new SecurityProps.JwtProps(null, null, null, "issuer", "audience");

        assertEquals(30L, jwt.refreshTtl().toDays());
    }

    @Test
    void rateLimitEnabledReturnsTrueWhenEnabledIsTrue() {
        RateLimitProps props = new RateLimitProps(true, 100, 10);

        assertTrue(props.isEnabled());
    }

    @Test
    void rateLimitEnabledReturnsFalseWhenEnabledIsNull() {
        RateLimitProps props = new RateLimitProps(null, 100, 10);

        assertFalse(props.isEnabled());
    }

    @Test
    void rootRecordStoresNestedConfiguration() {
        NexhireProperties props = new NexhireProperties(
                new CorsProps("https://app.example"),
                new SecurityProps(
                        new SecurityProps.JwtProps("secret", 60, 7, "issuer", "audience"),
                        new SecurityProps.Argon2Props(64, 3, 2, 16, 32)),
                new RateLimitProps(true, 100, 10),
                new OracleProps(
                        new OracleProps.Schemas("CORE", "AI", "AUDIT"),
                        new OracleProps.VectorProps(1536, "COSINE", "openai", "text-embedding-3-large")),
                new StorageProps("https://minio.example", "https://public.example", "user", "pass", "us-east-1",
                        new StorageProps.Buckets("resumes", "avatars", "exports")));

        assertEquals("https://app.example", props.cors().allowedOrigins());
        assertEquals("secret", props.security().jwt().secret());
        assertEquals("CORE", props.oracle().schemas().core());
        assertEquals("resumes", props.storage().buckets().resumes());
    }
}
