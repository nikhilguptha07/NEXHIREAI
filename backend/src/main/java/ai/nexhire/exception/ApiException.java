package ai.nexhire.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorCode errorCode;
    private final Map<String, String[]> fieldErrors;

    public ApiException(HttpStatus status, ErrorCode errorCode, String message) {
        super(message != null ? message : errorCode.defaultMessage());
        this.status = status;
        this.errorCode = errorCode;
        this.fieldErrors = null;
    }

    public ApiException(HttpStatus status, ErrorCode errorCode, String message, Map<String, String[]> fieldErrors) {
        super(message != null ? message : errorCode.defaultMessage());
        this.status = status;
        this.errorCode = errorCode;
        this.fieldErrors = fieldErrors;
    }

    public static ApiException badRequest(ErrorCode errorCode, String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, errorCode, message);
    }

    public static ApiException unauthorized(ErrorCode errorCode, String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, errorCode, message);
    }

    public static ApiException forbidden(ErrorCode errorCode, String message) {
        return new ApiException(HttpStatus.FORBIDDEN, errorCode, message);
    }

    public static ApiException notFound(ErrorCode errorCode, String message) {
        return new ApiException(HttpStatus.NOT_FOUND, errorCode, message);
    }

    public static ApiException conflict(ErrorCode errorCode, String message) {
        return new ApiException(HttpStatus.CONFLICT, errorCode, message);
    }

    public static ApiException internal(ErrorCode errorCode, String message) {
        return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
    }
}
