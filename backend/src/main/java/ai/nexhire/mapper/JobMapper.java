package ai.nexhire.mapper;

import ai.nexhire.dto.JobDto;
import ai.nexhire.dto.JobSkillDto;
import ai.nexhire.entity.Job;
import ai.nexhire.entity.JobSkill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JobMapper {

    @Mapping(target = "companyId", source = "company.id")
    @Mapping(target = "companyName", source = "company.name")
    @Mapping(target = "postedById", source = "postedBy.id")
    @Mapping(target = "postedByName", expression = "java(job.getPostedBy() != null ? job.getPostedBy().getFullName() : null)")
    @Mapping(target = "status", expression = "java(job.getStatus() != null ? job.getStatus().name() : null)")
    JobDto toDto(Job job);

    JobSkillDto toSkillDto(JobSkill skill);
}
