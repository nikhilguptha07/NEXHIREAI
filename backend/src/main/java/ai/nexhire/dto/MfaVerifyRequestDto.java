package ai.nexhire.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequestDto {
    private String email;
    @NotBlank(message = "Verification code is required")
    private String code;
    private String secret;
    private String password;
}
