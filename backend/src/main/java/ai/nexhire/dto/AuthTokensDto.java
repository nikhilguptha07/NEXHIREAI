package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthTokensDto {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    @Builder.Default
    private String tokenType = "Bearer";
}
