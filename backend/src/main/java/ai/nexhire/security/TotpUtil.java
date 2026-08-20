package ai.nexhire.security;

import org.apache.commons.codec.binary.Base32;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

/**
 * TOTP (Time-based One-Time Password) RFC 6238 generator and validator.
 */
@Component
public class TotpUtil {

    private static final Logger log = LoggerFactory.getLogger(TotpUtil.class);
    private static final int TIME_STEP_SECONDS = 30;
    private static final int NUM_DIGITS = 6;
    private static final int SECRET_BYTE_LENGTH = 20;

    private final Base32 base32 = new Base32();
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateSecret() {
        byte[] bytes = new byte[SECRET_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
        return base32.encodeToString(bytes).replace("=", "");
    }

    public String getQrCodeUri(String secret, String email, String issuer) {
        String encodedIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                encodedIssuer, encodedEmail, secret, encodedIssuer);
    }

    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.length() != NUM_DIGITS) {
            return false;
        }

        try {
            int targetCode = Integer.parseInt(code.trim());
            long currentWindow = System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;

            // Check current window and +/- 1 window to allow for clock drift
            for (int i = -1; i <= 1; i++) {
                int calculated = generateCodeForWindow(secret, currentWindow + i);
                if (calculated == targetCode) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("Error during TOTP code verification: {}", e.getMessage());
        }
        return false;
    }

    private int generateCodeForWindow(String secret, long window) throws Exception {
        byte[] keyBytes = base32.decode(secret);
        byte[] data = ByteBuffer.allocate(8).putLong(window).array();

        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(keyBytes, "HmacSHA1"));
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0xF;
        int binary = ((hash[offset] & 0x7F) << 24)
                | ((hash[offset + 1] & 0xFF) << 16)
                | ((hash[offset + 2] & 0xFF) << 8)
                | (hash[offset + 3] & 0xFF);

        return binary % 1_000_000;
    }
}
