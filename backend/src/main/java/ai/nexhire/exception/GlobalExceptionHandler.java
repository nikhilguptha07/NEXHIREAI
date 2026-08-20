package ai.nexhire.exception;

import ai.nexhire.dto.ApiErrorDto;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorDto> handleApiException(
            ApiException ex,
            HttpServletRequest request) {

        log.warn("API Exception [{}]: {}", ex.getErrorCode(), ex.getMessage());

        Map<String, List<String>> convertedFieldErrors = null;

        if (ex.getFieldErrors() != null) {
            convertedFieldErrors = new HashMap<>();

            for (Map.Entry<String, String[]> entry : ex.getFieldErrors().entrySet()) {
                convertedFieldErrors.put(entry.getKey(), List.of(entry.getValue()));
            }
        }

        ApiErrorDto errorDto = ApiErrorDto.of(
                ex.getStatus().value(),
                ex.getErrorCode().name(),
                ex.getMessage(),
                convertedFieldErrors,
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorDto, ex.getStatus());
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiErrorDto> handleValidationException(
        MethodArgumentNotValidException ex,
        HttpServletRequest request) {

    Map<String, List<String>> fieldErrors = new HashMap<>();

    for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
        fieldErrors
                .computeIfAbsent(fieldError.getField(), k -> new ArrayList<>())
                .add(fieldError.getDefaultMessage());

        log.error(
                "Validation Error -> Field: {} | Message: {} | Rejected Value: {}",
                fieldError.getField(),
                fieldError.getDefaultMessage(),
                fieldError.getRejectedValue()
        );
    }

    ApiErrorDto errorDto = ApiErrorDto.of(
            HttpStatus.BAD_REQUEST.value(),
            ErrorCode.VAL_INVALID_PAYLOAD.name(),
            "Validation failed.",
            fieldErrors,
            request.getRequestURI()
    );

    return ResponseEntity.badRequest().body(errorDto);
}
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorDto> handleBadCredentialsException(
            BadCredentialsException ex,
            HttpServletRequest request) {

        ApiErrorDto errorDto = ApiErrorDto.of(
                HttpStatus.UNAUTHORIZED.value(),
                ErrorCode.AUTH_INVALID_CREDENTIALS.name(),
                ErrorCode.AUTH_INVALID_CREDENTIALS.defaultMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDto);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorDto> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {

        ApiErrorDto errorDto = ApiErrorDto.of(
                HttpStatus.UNAUTHORIZED.value(),
                ErrorCode.AUTH_TOKEN_INVALID.name(),
                ex.getMessage() != null
                        ? ex.getMessage()
                        : "Authentication failed.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDto);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorDto> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request) {

        ApiErrorDto errorDto = ApiErrorDto.of(
                HttpStatus.FORBIDDEN.value(),
                ErrorCode.AUTHZ_DENIED.name(),
                ErrorCode.AUTHZ_DENIED.defaultMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorDto);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorDto> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {

        ApiErrorDto errorDto = ApiErrorDto.of(
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                "METHOD_NOT_ALLOWED",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(errorDto);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorDto> handleNotFound(
            NoHandlerFoundException ex,
            HttpServletRequest request) {

        ApiErrorDto errorDto = ApiErrorDto.of(
                HttpStatus.NOT_FOUND.value(),
                "NOT_FOUND",
                "Requested resource not found.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDto);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDto> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled Exception at {}", request.getRequestURI(), ex);

        String message = ex.getMessage();

        if (message == null || message.isBlank()) {
            Throwable cause = ex.getCause();
            if (cause != null && cause.getMessage() != null) {
                message = cause.getMessage();
            } else {
                message = "No exception message available.";
            }
        }

        ApiErrorDto errorDto = ApiErrorDto.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getClass().getSimpleName(),
                message,
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDto);
    }
}