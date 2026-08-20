package ai.nexhire.service.impl;

import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service("localStorageService")
@Primary
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);
    private final Path baseStorageLocation = Paths.get("data/storage").toAbsolutePath().normalize();

    public LocalStorageService() {
        try {
            Files.createDirectories(baseStorageLocation);
        } catch (Exception e) {
            log.error("Could not create storage directory: ", e);
        }
    }

    @Override
    public String store(String bucket, String filename, InputStream inputStream, String contentType, long size) {
        try {
            Path bucketPath = baseStorageLocation.resolve(bucket);
            Files.createDirectories(bucketPath);

            Path targetPath = bucketPath.resolve(filename).normalize();
            if (!targetPath.startsWith(bucketPath)) {
                throw ApiException.badRequest(ErrorCode.VAL_INVALID_PARAMETER, "Invalid path traversal sequence");
            }

            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file locally: {}/{}", bucket, filename);
            return getPublicUrl(bucket, filename);
        } catch (Exception e) {
            log.error("Failed to store file locally: ", e);
            throw ApiException.internal(ErrorCode.SYS_STORAGE_ERROR, "Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public InputStream load(String bucket, String filename) {
        try {
            Path targetPath = baseStorageLocation.resolve(bucket).resolve(filename).normalize();
            if (!Files.exists(targetPath)) {
                throw ApiException.notFound(ErrorCode.RES_NOT_FOUND, "File not found: " + filename);
            }
            return Files.newInputStream(targetPath);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw ApiException.internal(ErrorCode.SYS_STORAGE_ERROR, "Could not load file: " + e.getMessage());
        }
    }

    @Override
    public void delete(String bucket, String filename) {
        try {
            Path targetPath = baseStorageLocation.resolve(bucket).resolve(filename).normalize();
            Files.deleteIfExists(targetPath);
            log.info("Deleted file locally: {}/{}", bucket, filename);
        } catch (Exception e) {
            log.error("Failed to delete file locally: ", e);
        }
    }

    @Override
    public String getPublicUrl(String bucket, String filename) {
        return "/api/files/" + bucket + "/" + filename;
    }
}
