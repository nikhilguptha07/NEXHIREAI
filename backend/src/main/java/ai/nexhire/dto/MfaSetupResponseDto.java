package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaSetupResponseDto {
    private String secret;
    private String qrCodeUri;
    private String manualEntryKey;
}
