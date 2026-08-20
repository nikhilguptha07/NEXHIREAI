package ai.nexhire.controller;

import ai.nexhire.dto.ResumeDto;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.service.ResumeProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/resumes")
public class ResumeController {

    private static final Logger log = LoggerFactory.getLogger(ResumeController.class);

    private final ResumeProcessingService resumeProcessingService;

    public ResumeController(ResumeProcessingService resumeProcessingService) {
        this.resumeProcessingService = resumeProcessingService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeDto> uploadResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "file", required = false) MultipartFile fileParam,
            @RequestParam(value = "resume", required = false) MultipartFile resumeParam) {
        MultipartFile file = fileParam != null ? fileParam : resumeParam;
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest(ErrorCode.VAL_INVALID_PARAMETER, "Resume file is required.");
        }
        log.info("Processing resume upload for user: {}", userDetails.getUsername());
        ResumeDto resume = resumeProcessingService.uploadResume(userDetails.getUsername(), file);
        return ResponseEntity.status(HttpStatus.CREATED).body(resume);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ResumeDto>> getMyResumes(@AuthenticationPrincipal UserDetails userDetails) {
        List<ResumeDto> resumes = resumeProcessingService.getUserResumes(userDetails.getUsername());
        return ResponseEntity.ok(resumes);
    }

    @PostMapping("/{id}/parse")
    public ResponseEntity<ResumeDto> parseResume(@PathVariable UUID id) {
        ResumeDto parsed = resumeProcessingService.parseResume(id);
        return ResponseEntity.ok(parsed);
    }
}
