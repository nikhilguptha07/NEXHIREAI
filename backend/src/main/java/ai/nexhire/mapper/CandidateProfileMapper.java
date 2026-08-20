package ai.nexhire.mapper;

import ai.nexhire.dto.CandidateProfileDto;
import ai.nexhire.dto.EducationDto;
import ai.nexhire.dto.SkillDto;
import ai.nexhire.dto.WorkExperienceDto;
import ai.nexhire.entity.CandidateProfile;
import ai.nexhire.entity.CandidateSkill;
import ai.nexhire.entity.Education;
import ai.nexhire.entity.WorkExperience;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CandidateProfileMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "name", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    @Mapping(target = "role", source = "headline")
    CandidateProfileDto toDto(CandidateProfile profile);

    SkillDto toSkillDto(CandidateSkill skill);

    WorkExperienceDto toExperienceDto(WorkExperience experience);

    EducationDto toEducationDto(Education education);
}
