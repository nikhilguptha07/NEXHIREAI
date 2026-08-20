package ai.nexhire.mapper;

import ai.nexhire.dto.CompanyDto;
import ai.nexhire.dto.CreateCompanyRequestDto;
import ai.nexhire.entity.Company;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CompanyMapper {

    CompanyDto toDto(Company company);

    Company toEntity(CreateCompanyRequestDto dto);
}
