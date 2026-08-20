package ai.nexhire.service;

import ai.nexhire.entity.CandidateProfile;
import ai.nexhire.entity.CandidateSkill;
import ai.nexhire.entity.Education;
import ai.nexhire.entity.Job;
import ai.nexhire.entity.JobSkill;
import ai.nexhire.entity.Resume;
import ai.nexhire.entity.User;
import ai.nexhire.entity.WorkExperience;
import ai.nexhire.repository.CandidateProfileRepository;
import ai.nexhire.repository.ResumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ATSService {

    private static final Logger log = LoggerFactory.getLogger(ATSService.class);

    private final ResumeRepository resumeRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final DocumentTextExtractorService documentTextExtractorService;

    public ATSService(
            ResumeRepository resumeRepository,
            CandidateProfileRepository candidateProfileRepository,
            DocumentTextExtractorService documentTextExtractorService) {
        this.resumeRepository = resumeRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.documentTextExtractorService = documentTextExtractorService;
    }

    public record AtsResult(
            int overallScore,
            int skillScore,
            int experienceScore,
            int educationScore,
            int keywordScore,
            String matchedSkills,
            String missingSkills,
            String aiRecommendation
    ) {}

    public AtsResult analyzeApplication(Job job, User candidate, String coverLetter) {
        log.info("Running ATS Analysis for Candidate ID: {} against Job ID: {}", candidate.getId(), job.getId());

        // Gather job required skills
        List<String> jobSkills = job.getRequiredSkills() != null
                ? job.getRequiredSkills().stream().map(JobSkill::getSkillName).collect(Collectors.toList())
                : new ArrayList<>();

        if (jobSkills.isEmpty()) {
            // Default skills if none explicitly defined on job
            jobSkills = List.of("Java", "Spring Boot", "React", "TypeScript", "SQL");
        }

        // Gather candidate text and skills
        String documentText = "";
        Optional<Resume> resumeOpt = resumeRepository.findTopByUserIdOrderByCreatedAtDesc(candidate.getId());
        if (resumeOpt.isPresent() && resumeOpt.get().getParsedData() != null) {
            documentText = resumeOpt.get().getParsedData();
        }

        Optional<CandidateProfile> profileOpt = candidateProfileRepository.findByUserId(candidate.getId());
        List<String> candidateSkills = new ArrayList<>();
        if (profileOpt.isPresent()) {
            CandidateProfile profile = profileOpt.get();
            if (profile.getSkills() != null) {
                candidateSkills.addAll(profile.getSkills().stream().map(CandidateSkill::getName).toList());
            }
            if (profile.getSummary() != null) {
                documentText += " " + profile.getSummary();
            }
            if (profile.getHeadline() != null) {
                documentText += " " + profile.getHeadline();
            }
        }

        if (coverLetter != null) {
            documentText += " " + coverLetter;
        }

        // Perform keyword matching
        List<String> matchedList = new ArrayList<>();
        List<String> missingList = new ArrayList<>();

        String upperText = documentText.toUpperCase();
        for (String reqSkill : jobSkills) {
            boolean found = candidateSkills.stream().anyMatch(cs -> cs.equalsIgnoreCase(reqSkill))
                    || upperText.contains(reqSkill.toUpperCase());
            if (found) {
                matchedList.add(reqSkill);
            } else {
                missingList.add(reqSkill);
            }
        }

        // Calculate Component Scores
        int totalRequired = Math.max(1, jobSkills.size());
        int skillScore = (int) Math.min(100, Math.round(((double) matchedList.size() / totalRequired) * 100));

        // Experience Score
        int experienceScore = 70;
        if (profileOpt.isPresent()) {
            Integer years = profileOpt.get().getYearsOfExperience();
            if (years != null) {
                experienceScore = Math.min(100, Math.max(40, years * 12 + 40));
            }
        }

        // Education Score
        int educationScore = (upperText.contains("DEGREE") || upperText.contains("BACHELOR") || upperText.contains("MASTER") || upperText.contains("B.S."))
                ? 95 : 75;

        // Keyword Score
        int keywordScore = (int) Math.min(100, Math.round(skillScore * 0.9 + (coverLetter != null && coverLetter.length() > 50 ? 10 : 0)));

        // Overall Weighted Score
        int overallScore = (int) Math.round(
                skillScore * 0.40 +
                experienceScore * 0.25 +
                educationScore * 0.20 +
                keywordScore * 0.15
        );

        String aiRecommendation;
        if (overallScore >= 90) {
            aiRecommendation = "VERY_STRONG_HIRE";
        } else if (overallScore >= 80) {
            aiRecommendation = "STRONG_HIRE";
        } else if (overallScore >= 70) {
            aiRecommendation = "HIRE";
        } else if (overallScore >= 60) {
            aiRecommendation = "BORDERLINE";
        } else {
            aiRecommendation = "REJECT";
        }

        String matchedSkillsStr = String.join(", ", matchedList);
        String missingSkillsStr = String.join(", ", missingList);

        return new AtsResult(
                overallScore,
                skillScore,
                experienceScore,
                educationScore,
                keywordScore,
                matchedSkillsStr,
                missingSkillsStr,
                aiRecommendation
        );
    }
}
