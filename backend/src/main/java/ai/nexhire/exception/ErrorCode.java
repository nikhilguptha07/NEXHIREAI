package ai.nexhire.exception;

/**
 * Canonical NEXHIRE error codes surfaced to clients and metrics.
 *
 * <p>Group prefix convention:
 * <ul>
 *   <li>{@code AUTH_*} — authentication failures</li>
 *   <li>{@code AUTHZ_*} — authorization failures</li>
 *   <li>{@code VAL_*} — validation failures</li>
 *   <li>{@code RES_*} — resource lookup failures</li>
 *   <li>{@code CONFLICT_*} — optimistic / uniqueness conflicts</li>
 *   <li>{@code RATE_*} — rate limiting</li>
 *   <li>{@code SYS_*} — infrastructure / unexpected</li>
 * </ul>
 */
public enum ErrorCode {

    // ── Authentication ─────────────────────────────────────────────
    AUTH_INVALID_CREDENTIALS("Invalid email or password."),
    AUTH_TOKEN_EXPIRED("The access token has expired."),
    AUTH_TOKEN_INVALID("The access token is invalid."),
    AUTH_TOKEN_REVOKED("The token has been revoked."),
    AUTH_REFRESH_INVALID("Refresh token is invalid or expired."),
    AUTH_MFA_REQUIRED("Multi-factor authentication is required."),
    AUTH_MFA_INVALID("The MFA code is incorrect."),
    AUTH_ACCOUNT_LOCKED("Account is temporarily locked."),
    AUTH_ACCOUNT_DISABLED("Account is disabled."),

    // ── Authorization ──────────────────────────────────────────────
    AUTHZ_DENIED("You do not have permission to perform this action."),
    AUTHZ_TENANT_MISMATCH("Resource does not belong to the active tenant."),

    // ── Validation ─────────────────────────────────────────────────
    VAL_INVALID_PAYLOAD("The request payload is invalid."),
    VAL_INVALID_PARAMETER("A request parameter is invalid."),

    // ── Resource ───────────────────────────────────────────────────
    RES_NOT_FOUND("Resource was not found."),
    RES_CONFLICT("Resource already exists or is in a conflicting state."),

    // ── Rate limiting ──────────────────────────────────────────────
    RATE_LIMIT_EXCEEDED("Too many requests. Please slow down."),

    // ── System ─────────────────────────────────────────────────────
    SYS_INTERNAL("An unexpected internal error occurred."),
    SYS_UNAVAILABLE("The service is temporarily unavailable."),
    SYS_STORAGE_ERROR("Object storage operation failed.");

    private final String defaultMessage;

    ErrorCode(String defaultMessage) {
        this.defaultMessage = defaultMessage;
    }

    public String defaultMessage() {
        return defaultMessage;
    }
}
