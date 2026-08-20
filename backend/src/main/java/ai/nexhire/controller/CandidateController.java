package ai.nexhire.controller;

import ai.nexhire.dto.CandidateProfileDto;
import ai.nexhire.dto.CreateCandidateRequest;
import ai.nexhire.service.CandidateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/candidates")
public class CandidateController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CandidateController.class);

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/me")
    public ResponseEntity<CandidateProfileDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        CandidateProfileDto profile = candidateService.getProfileByEmail(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<CandidateProfileDto> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CandidateProfileDto dto) {
        CandidateProfileDto updated = candidateService.updateProfile(userDetails.getUsername(), dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<List<CandidateProfileDto>> getAllCandidates() {
        List<CandidateProfileDto> candidates = candidateService.getAllCandidates();
        log.info("STEP 9 - Candidate returned by GET /candidates: count={}", candidates.size());
        return ResponseEntity.ok(candidates);
    }

    @PostMapping
    public ResponseEntity<CandidateProfileDto> createCandidate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateCandidateRequest request) {
        log.info("STEP 4 - Candidate request received");
        String email = userDetails != null ? userDetails.getUsername() : null;
        CandidateProfileDto created = candidateService.createCandidateProfile(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/ranking")
    public ResponseEntity<java.util.List<CandidateProfileDto>> getCandidateRankings() {
        java.util.List<CandidateProfileDto> rankings = candidateService.getCandidateRankings();
        return ResponseEntity.ok(rankings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER')")
    public ResponseEntity<CandidateProfileDto> getCandidateProfileById(@PathVariable UUID id) {
        CandidateProfileDto profile = candidateService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }
}
