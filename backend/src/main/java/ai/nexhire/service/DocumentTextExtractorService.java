package ai.nexhire.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DocumentTextExtractorService {

    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractorService.class);

    private static final List<String> TECHNICAL_SKILLS_DICTIONARY = List.of(
            "React", "React 19", "Next.js", "Next.js 15", "TypeScript", "JavaScript", "Node.js", "Express",
            "Java", "Spring Boot", "Spring Data JPA", "Hibernate", "Python", "PyTorch", "TensorFlow", "FastAPI",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Git", "GitHub",
            "SQL", "PostgreSQL", "MySQL", "Oracle", "Oracle 26ai", "MongoDB", "Redis", "GraphQL", "REST API",
            "Figma", "UI/UX Design", "Tailwind CSS", "System Design", "Agile", "Scrum", "Linux", "Microservices"
    );

    public String extractTextFromMultipartFile(MultipartFile file) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        try (InputStream inputStream = file.getInputStream()) {
            if (filename.endsWith(".pdf")) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            } else if (filename.endsWith(".docx")) {
                try (XWPFDocument docx = new XWPFDocument(inputStream);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
                    return extractor.getText();
                }
            } else {
                return new String(file.getBytes());
            }
        } catch (Exception e) {
            log.error("Error parsing document text: ", e);
            return "";
        }
    }

    public Map<String, Object> parseCandidateFromText(String documentText, String jobTitle, List<String> requiredSkills) {
        Map<String, Object> result = new HashMap<>();

        // 1. Email extraction (Regex)
        Pattern emailPattern = Pattern.compile("([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", Pattern.CASE_INSENSITIVE);
        Matcher emailMatcher = emailPattern.matcher(documentText);
        String email = emailMatcher.find() ? emailMatcher.group(1) : "";

        // 2. Phone extraction (Regex)
        Pattern phonePattern = Pattern.compile("(\\+?\\d{1,3}[\\s.-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}");
        Matcher phoneMatcher = phonePattern.matcher(documentText);
        String phone = phoneMatcher.find() ? phoneMatcher.group(0) : "";

        // 3. LinkedIn & GitHub URLs
        Pattern linkedinPattern = Pattern.compile("(https?://)?(www\\.)?linkedin\\.com/in/[a-zA-Z0-9_-]+", Pattern.CASE_INSENSITIVE);
        Matcher linkedinMatcher = linkedinPattern.matcher(documentText);
        String linkedin = linkedinMatcher.find() ? linkedinMatcher.group(0) : "";

        Pattern githubPattern = Pattern.compile("(https?://)?(www\\.)?github\\.com/[a-zA-Z0-9_-]+", Pattern.CASE_INSENSITIVE);
        Matcher githubMatcher = githubPattern.matcher(documentText);
        String github = githubMatcher.find() ? githubMatcher.group(0) : "";

        // 4. Full Name extraction strictly from content (Ignore filename!)
        String fullName = "";
        String[] lines = documentText.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() > 2 && trimmed.length() < 40 &&
                !trimmed.toLowerCase().contains("resume") &&
                !trimmed.toLowerCase().contains("curriculum") &&
                !trimmed.toLowerCase().contains("page") &&
                trimmed.matches("^[A-Z][a-z]+(\\s+[A-Z][a-z]+){1,3}$")) {
                fullName = trimmed;
                break;
            }
        }

        if (fullName.isEmpty()) {
            if (!email.isEmpty() && email.contains("@")) {
                String prefix = email.split("@")[0];
                fullName = Arrays.stream(prefix.split("[._-]"))
                        .map(s -> s.isEmpty() ? "" : Character.toUpperCase(s.charAt(0)) + s.substring(1))
                        .reduce((a, b) -> a + " " + b).orElse("Applicant");
            } else if (lines.length > 0 && lines[0].trim().length() > 2 && lines[0].trim().length() < 40) {
                fullName = lines[0].trim().replaceAll("[^a-zA-Z\\s]", "");
            } else {
                fullName = "Applicant Candidate";
            }
        }

        // 5. Technical Skills matching dictionary
        List<String> extractedSkills = new ArrayList<>();
        String textUpper = documentText.toUpperCase();
        for (String skill : TECHNICAL_SKILLS_DICTIONARY) {
            if (textUpper.contains(skill.toUpperCase())) {
                extractedSkills.add(skill);
            }
        }

        // 6. ATS Match & Weighted Scoring
        List<String> targetSkills = (requiredSkills != null && !requiredSkills.isEmpty())
                ? requiredSkills
                : List.of("React", "Next.js", "TypeScript", "Node.js", "Spring Boot");

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : targetSkills) {
            if (textUpper.contains(req.toUpperCase())) {
                matchedSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        int skillScore = (int) Math.min(100, Math.round(((double) matchedSkills.size() / Math.max(1, targetSkills.size())) * 100));
        int experienceScore = Math.min(100, extractedSkills.size() * 12 + 40);
        int educationScore = (textUpper.contains("BACHELOR") || textUpper.contains("DEGREE") || textUpper.contains("B.S.") || textUpper.contains("MASTER")) ? 95 : 70;
        int keywordScore = (int) Math.min(100, Math.round(((double) matchedSkills.size() / Math.max(1, targetSkills.size())) * 90 + 10));
        int formattingScore = (!email.isEmpty() && !phone.isEmpty()) ? 95 : 75;

        int overallAtsScore = (int) Math.round(
                skillScore * 0.35 +
                experienceScore * 0.25 +
                educationScore * 0.15 +
                keywordScore * 0.15 +
                formattingScore * 0.10
        );

        result.put("fullName", fullName);
        result.put("email", email.isEmpty() ? "not.specified@example.com" : email);
        result.put("phone", phone.isEmpty() ? "+1 (555) 000-0000" : phone);
        result.put("linkedIn", linkedin);
        result.put("gitHub", github);
        result.put("skills", extractedSkills);
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);
        result.put("overallAtsScore", overallAtsScore);
        result.put("skillScore", skillScore);
        result.put("experienceScore", experienceScore);
        result.put("educationScore", educationScore);
        result.put("keywordScore", keywordScore);
        result.put("formattingScore", formattingScore);

        return result;
    }
}
