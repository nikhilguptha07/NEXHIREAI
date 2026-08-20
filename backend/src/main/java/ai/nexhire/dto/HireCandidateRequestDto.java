package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HireCandidateRequestDto {
    private Instant joiningDate;
    private BigDecimal salaryOffered;
    private String department;
    private Instant offerExpiry;
    private String notes;

    public Instant getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(Instant joiningDate) {
        this.joiningDate = joiningDate;
    }

    public BigDecimal getSalaryOffered() {
        return salaryOffered;
    }

    public void setSalaryOffered(BigDecimal salaryOffered) {
        this.salaryOffered = salaryOffered;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Instant getOfferExpiry() {
        return offerExpiry;
    }

    public void setOfferExpiry(Instant offerExpiry) {
        this.offerExpiry = offerExpiry;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}


