package ai.nexhire.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorDto {
    private int status;
    private String code;
    private String message;
    private Map<String, List<String>> fieldErrors;
    private String timestamp;
    private String path;

    public static ApiErrorDto of(int status, String code, String message, String path) {
        return ApiErrorDto.builder()
                .status(status)
                .code(code)
                .message(message)
                .timestamp(Instant.now().toString())
                .path(path)
                .build();
    }

    public static ApiErrorDto of(int status, String code, String message, Map<String, List<String>> fieldErrors, String path) {
        return ApiErrorDto.builder()
                .status(status)
                .code(code)
                .message(message)
                .fieldErrors(fieldErrors)
                .timestamp(Instant.now().toString())
                .path(path)
                .build();
    }
}
