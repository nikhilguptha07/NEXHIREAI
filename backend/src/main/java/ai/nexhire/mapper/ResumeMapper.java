package ai.nexhire.mapper;

import ai.nexhire.dto.ResumeDto;
import ai.nexhire.entity.Resume;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResumeMapper {

    @Mapping(target = "userId", source = "user.id")
    ResumeDto toDto(Resume resume);
}
