package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    private UUID id;
    private String name;
    private String description;
    private String industry;
    private String websiteUrl;
    private String logoUrl;
    private String location;
    private Integer employeeCount;
    private Instant createdAt;
    private Instant updatedAt;
}
