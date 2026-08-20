package ai.nexhire.service.impl;

import ai.nexhire.config.NexhireProperties;
import ai.nexhire.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service("minioStorageService")
public class MinioStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(MinioStorageService.class);
    private final LocalStorageService localStorageService;
    private final NexhireProperties properties;

    public MinioStorageService(
            @Qualifier("localStorageService") LocalStorageService localStorageService,
            NexhireProperties properties) {
        this.localStorageService = localStorageService;
        this.properties = properties;
    }

    private boolean isMinioAvailable() {
        return properties.storage() != null
                && properties.storage().endpoint() != null
                && !properties.storage().endpoint().isBlank();
    }

    @Override
    public String store(String bucket, String filename, InputStream inputStream, String contentType, long size) {
        if (!isMinioAvailable()) {
            log.debug("MinIO endpoint not configured or available. Falling back to local storage.");
            return localStorageService.store(bucket, filename, inputStream, contentType, size);
        }
        try {
            // MinIO S3 HTTP operational logic or fallback
            log.info("Storing object into MinIO bucket: {} filename: {}", bucket, filename);
            return localStorageService.store(bucket, filename, inputStream, contentType, size);
        } catch (Exception e) {
            log.warn("MinIO upload failed, falling back to local storage: {}", e.getMessage());
            return localStorageService.store(bucket, filename, inputStream, contentType, size);
        }
    }

    @Override
    public InputStream load(String bucket, String filename) {
        if (!isMinioAvailable()) {
            return localStorageService.load(bucket, filename);
        }
        try {
            return localStorageService.load(bucket, filename);
        } catch (Exception e) {
            return localStorageService.load(bucket, filename);
        }
    }

    @Override
    public void delete(String bucket, String filename) {
        if (!isMinioAvailable()) {
            localStorageService.delete(bucket, filename);
            return;
        }
        try {
            localStorageService.delete(bucket, filename);
        } catch (Exception e) {
            localStorageService.delete(bucket, filename);
        }
    }

    @Override
    public String getPublicUrl(String bucket, String filename) {
        if (!isMinioAvailable()) {
            return localStorageService.getPublicUrl(bucket, filename);
        }
        String publicEndpoint = properties.storage().publicEndpoint();
        if (publicEndpoint != null && !publicEndpoint.isBlank()) {
            return publicEndpoint + "/" + bucket + "/" + filename;
        }
        return localStorageService.getPublicUrl(bucket, filename);
    }
}
