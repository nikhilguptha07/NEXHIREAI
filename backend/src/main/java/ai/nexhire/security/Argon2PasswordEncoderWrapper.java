package ai.nexhire.security;

import ai.nexhire.config.NexhireProperties;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Primary
public class Argon2PasswordEncoderWrapper implements PasswordEncoder {

    private final PasswordEncoder delegate;

    public Argon2PasswordEncoderWrapper(NexhireProperties properties) {
        NexhireProperties.SecurityProps.Argon2Props props =
                properties.security() != null ? properties.security().argon2() : null;

        int saltLength = (props != null && props.saltLengthBytes() != null) ? props.saltLengthBytes() : 16;
        int hashLength = (props != null && props.hashLengthBytes() != null) ? props.hashLengthBytes() : 32;
        int parallelism = (props != null && props.parallelism() != null) ? props.parallelism() : 1;
        int memory = (props != null && props.memoryKib() != null) ? props.memoryKib() : 65536;
        int iterations = (props != null && props.iterations() != null) ? props.iterations() : 3;

        this.delegate = new Argon2PasswordEncoder(saltLength, hashLength, parallelism, memory, iterations);
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return delegate.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return delegate.matches(rawPassword, encodedPassword);
    }
}
