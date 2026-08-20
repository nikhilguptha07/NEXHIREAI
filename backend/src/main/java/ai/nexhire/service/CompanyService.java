package ai.nexhire.service;

import ai.nexhire.dto.CompanyDto;
import ai.nexhire.dto.CreateCompanyRequestDto;
import ai.nexhire.entity.Company;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.CompanyMapper;
import ai.nexhire.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
    }

    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Company not found with id: " + id));
        return companyMapper.toDto(company);
    }

    @Transactional
    public CompanyDto createCompany(CreateCompanyRequestDto dto) {
        if (companyRepository.existsByName(dto.getName())) {
            throw ApiException.conflict(ErrorCode.RES_CONFLICT, "Company with name already exists.");
        }
        Company company = companyMapper.toEntity(dto);
        Company saved = companyRepository.save(company);
        return companyMapper.toDto(saved);
    }
}
