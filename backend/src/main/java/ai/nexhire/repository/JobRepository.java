package ai.nexhire.repository;

import ai.nexhire.entity.Job;
import ai.nexhire.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    Page<Job> findByCompanyId(UUID companyId, Pageable pageable);
    Page<Job> findByPostedById(UUID userId, Pageable pageable);
}
