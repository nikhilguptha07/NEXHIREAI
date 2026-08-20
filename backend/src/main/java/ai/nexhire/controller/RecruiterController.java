package ai.nexhire.controller;

import ai.nexhire.dto.RecruiterProfileDto;
import ai.nexhire.service.RecruiterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/recruiters")
public class RecruiterController {

    private final RecruiterService recruiterService;

    public RecruiterController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    @GetMapping("/me")
    public ResponseEntity<RecruiterProfileDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        RecruiterProfileDto profile = recruiterService.getProfileByEmail(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<RecruiterProfileDto> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody RecruiterProfileDto dto) {
        RecruiterProfileDto updated = recruiterService.updateProfile(userDetails.getUsername(), dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN', 'RECRUITER')")
    public ResponseEntity<RecruiterProfileDto> getRecruiterProfileById(@PathVariable UUID id) {
        RecruiterProfileDto profile = recruiterService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }
}
