package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponseDto<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;

    public static <T> PageResponseDto<T> from(Page<T> springPage) {
        PageResponseDto<T> dto = new PageResponseDto<>();
        dto.setContent(springPage.getContent());
        dto.setPage(springPage.getNumber());
        dto.setSize(springPage.getSize());
        dto.setTotalElements(springPage.getTotalElements());
        dto.setTotalPages(springPage.getTotalPages());
        dto.setHasNext(springPage.hasNext());
        return dto;
    }

    public static <T, R> PageResponseDto<R> from(Page<T> springPage, List<R> mappedContent) {
        PageResponseDto<R> dto = new PageResponseDto<>();
        dto.setContent(mappedContent);
        dto.setPage(springPage.getNumber());
        dto.setSize(springPage.getSize());
        dto.setTotalElements(springPage.getTotalElements());
        dto.setTotalPages(springPage.getTotalPages());
        dto.setHasNext(springPage.hasNext());
        return dto;
    }

    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public boolean isHasNext() { return hasNext; }
    public void setHasNext(boolean hasNext) { this.hasNext = hasNext; }
}

