package ai.nexhire.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "RESUMES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resume extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "FILE_NAME", nullable = false, length = 200)
    private String fileName;

    @Column(name = "FILE_URL", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Column(name = "CONTENT_TYPE", length = 100)
    private String contentType;

    @Column(name = "PARSED_DATA", length = 4000)
    private String parsedData;

    @Column(name = "PARSED", nullable = false)
    @Builder.Default
    private boolean parsed = false;

    public String getParsedData() {
        return parsedData;
    }

    public void setParsedData(String parsedData) {
        this.parsedData = parsedData;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public boolean isParsed() { return parsed; }
    public void setParsed(boolean parsed) { this.parsed = parsed; }
}


