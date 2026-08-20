package ai.nexhire.mapper;

import ai.nexhire.dto.RecruiterProfileDto;
import ai.nexhire.entity.RecruiterProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RecruiterProfileMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "companyId", source = "company.id")
    RecruiterProfileDto toDto(RecruiterProfile profile);
}
