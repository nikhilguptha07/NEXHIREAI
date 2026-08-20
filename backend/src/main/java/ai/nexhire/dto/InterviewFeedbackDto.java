package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackDto {
    private String feedback;
    private Integer rating;
    private String decision; // SELECTED, REJECTED, COMPLETED
}
