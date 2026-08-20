package ai.nexhire.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ErrorCodeTest {

    @Test
    void returnsConfiguredDefaultMessage() {
        assertEquals("Invalid email or password.", ErrorCode.AUTH_INVALID_CREDENTIALS.defaultMessage());
    }

    @Test
    void exposesSystemErrorMessages() {
        assertEquals("An unexpected internal error occurred.", ErrorCode.SYS_INTERNAL.defaultMessage());
    }
}
