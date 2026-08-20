package ai.nexhire.repository;

import ai.nexhire.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {
    List<Interview> findByApplicationId(UUID applicationId);
    List<Interview> findByInterviewerId(UUID interviewerId);
}
