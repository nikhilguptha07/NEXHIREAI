package ai.nexhire.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.UUID;

/**
 * Resilient UUID Converter that seamlessly handles:
 * - Standard 36-character hyphenated UUIDs (e.g. 6fec2125-a926-4c9c-ac79-dc5b56f9c68c)
 * - Oracle 32-character RAW / SYS_GUID hex strings (e.g. 6FEC2125A9264C9CAC79DC5B56F9C68C)
 */
@Converter(autoApply = true)
public class ResilientUuidConverter implements AttributeConverter<UUID, String> {

    @Override
    public String convertToDatabaseColumn(UUID attribute) {
        return attribute != null ? attribute.toString() : null;
    }

    @Override
    public UUID convertToEntityAttribute(String dbData) {
        return parse(dbData);
    }

    public static UUID parse(String val) {
        if (val == null || val.isBlank()) {
            return null;
        }
        String clean = val.trim();
        if (clean.length() == 32) {
            String formatted = String.format("%s-%s-%s-%s-%s",
                    clean.substring(0, 8),
                    clean.substring(8, 12),
                    clean.substring(12, 16),
                    clean.substring(16, 20),
                    clean.substring(20, 32));
            return UUID.fromString(formatted);
        }
        return UUID.fromString(clean);
    }
}
