package ai.nexhire.repository;

import ai.nexhire.entity.EmploymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmploymentRecordRepository extends JpaRepository<EmploymentRecord, UUID> {
    List<EmploymentRecord> findByCandidateId(UUID candidateId);
    List<EmploymentRecord> findByRecruiterId(UUID recruiterId);
    Optional<EmploymentRecord> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
}
