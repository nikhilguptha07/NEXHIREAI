package ai.nexhire.repository;

import ai.nexhire.entity.PasswordResetToken;
import ai.nexhire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    void deleteByUser(User user);
}

