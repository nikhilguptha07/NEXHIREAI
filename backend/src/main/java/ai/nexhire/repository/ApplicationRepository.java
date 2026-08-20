package ai.nexhire.repository;

import ai.nexhire.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByCandidateId(UUID candidateId);
    List<Application> findByJobId(UUID jobId);
    List<Application> findByJobPostedById(UUID recruiterId);
    Optional<Application> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    long countByJobId(UUID jobId);
    long countByJobPostedById(UUID recruiterId);
}

