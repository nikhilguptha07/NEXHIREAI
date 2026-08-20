package ai.nexhire.service;

import java.io.InputStream;

public interface StorageService {
    String store(String bucket, String filename, InputStream inputStream, String contentType, long size);
    InputStream load(String bucket, String filename);
    void delete(String bucket, String filename);
    String getPublicUrl(String bucket, String filename);
}
