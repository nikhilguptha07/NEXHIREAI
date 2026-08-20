package ai.nexhire.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "COMPANIES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company extends BaseEntity {

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "INDUSTRY", length = 100)
    private String industry;

    @Column(name = "WEBSITE_URL", length = 500)
    private String websiteUrl;

    @Column(name = "COMPANY_EMAIL", length = 150)
    private String companyEmail;

    @Column(name = "REGISTRATION_NUMBER", length = 100)
    private String registrationNumber;

    @Column(name = "LINKEDIN_URL", length = 500)
    private String linkedInUrl;

    @Column(name = "LOGO_URL", length = 500)
    private String logoUrl;

    @Column(name = "LOCATION", length = 150)
    private String location;

    @Column(name = "EMPLOYEE_COUNT")
    private Integer employeeCount;

    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, SUSPENDED
}
