package ai.nexhire.mapper;

import ai.nexhire.dto.RegisterRequestDto;
import ai.nexhire.dto.UserDto;
import ai.nexhire.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    UserDto toDto(User user);

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toEntity(RegisterRequestDto dto);
}
