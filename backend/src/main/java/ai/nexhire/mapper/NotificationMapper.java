package ai.nexhire.mapper;

import ai.nexhire.dto.NotificationDto;
import ai.nexhire.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NotificationMapper {

    @Mapping(target = "recipientId", source = "recipient.id")
    NotificationDto toDto(Notification notification);
}
