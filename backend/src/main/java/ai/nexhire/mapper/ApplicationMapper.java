package ai.nexhire.mapper;

import ai.nexhire.dto.ApplicationDto;
import ai.nexhire.entity.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ApplicationMapper {

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "department", source = "job.department")
    @Mapping(target = "candidateId", source = "candidate.id")
    @Mapping(target = "candidateName", expression = "java(application.getCandidate() != null ? application.getCandidate().getFullName() : null)")
    @Mapping(target = "candidateEmail", expression = "java(application.getCandidate() != null ? application.getCandidate().getEmail() : null)")
    @Mapping(target = "recruiterId", expression = "java(application.getJob() != null && application.getJob().getPostedBy() != null ? application.getJob().getPostedBy().getId() : null)")
    @Mapping(target = "recruiterName", expression = "java(application.getJob() != null && application.getJob().getPostedBy() != null ? application.getJob().getPostedBy().getFullName() : null)")
    @Mapping(target = "status", expression = "java(application.getStatus() != null ? application.getStatus().name() : null)")
    ApplicationDto toDto(Application application);
}

