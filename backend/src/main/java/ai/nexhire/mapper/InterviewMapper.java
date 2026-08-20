package ai.nexhire.mapper;

import ai.nexhire.dto.InterviewDto;
import ai.nexhire.entity.Interview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InterviewMapper {

    @Mapping(target = "applicationId", source = "application.id")
    @Mapping(target = "jobTitle", expression = "java(interview.getApplication() != null && interview.getApplication().getJob() != null ? interview.getApplication().getJob().getTitle() : null)")
    @Mapping(target = "interviewerId", source = "interviewer.id")
    @Mapping(target = "interviewerName", expression = "java(interview.getInterviewer() != null ? interview.getInterviewer().getFullName() : null)")
    @Mapping(target = "candidateId", expression = "java(interview.getCandidate() != null ? interview.getCandidate().getId() : (interview.getApplication() != null && interview.getApplication().getCandidate() != null ? interview.getApplication().getCandidate().getId() : null))")
    @Mapping(target = "candidateName", expression = "java(interview.getCandidate() != null ? interview.getCandidate().getFullName() : (interview.getApplication() != null && interview.getApplication().getCandidate() != null ? interview.getApplication().getCandidate().getFullName() : null))")
    @Mapping(target = "candidateEmail", expression = "java(interview.getCandidate() != null ? interview.getCandidate().getEmail() : (interview.getApplication() != null && interview.getApplication().getCandidate() != null ? interview.getApplication().getCandidate().getEmail() : null))")
    @Mapping(target = "status", expression = "java(interview.getStatus() != null ? interview.getStatus().name() : null)")
    InterviewDto toDto(Interview interview);
}
