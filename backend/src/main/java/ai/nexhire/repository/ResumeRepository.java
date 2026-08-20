package ai.nexhire.repository;

import ai.nexhire.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByUserIdOrderByCreatedAtDesc(UUID userId);
    java.util.Optional<Resume> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}
