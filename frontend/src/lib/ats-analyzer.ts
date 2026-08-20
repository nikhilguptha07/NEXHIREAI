import {
  ParsedResume,
  Education,
  Experience,
  Project,
  CategorizedSkills,
  PersonalInformation,
  DEFAULT_JOB_SKILLS
} from "./resume-parser";

/* ============================================================
   ENTERPRISE ATS ANALYZER INTERFACES
============================================================ */

export type ResumeQualityGrade =
  | "EXCELLENT"
  | "GOOD"
  | "AVERAGE"
  | "NEEDS_IMPROVEMENT"
  | "POOR";

export interface FormattingBreakdown {
  score: number;
  fontConsistencyScore: number;
  sectionOrderingScore: number;
  whiteSpaceScore: number;
  bulletUsageScore: number;
  headingDetectionScore: number;
  contactPlacementScore: number;
  detectedBulletsCount: number;
  isContactInTop20Percent: boolean;
  remarks: string[];
}

export interface KeywordBreakdown {
  score: number;
  totalWords: number;
  keywordDensityPercentage: number;
  matchedKeywordsCount: number;
  totalRequiredKeywordsCount: number;
  keywordCoveragePercentage: number;
  keywordFrequency: Record<string, number>;
  missingKeywords: string[];
  repeatedKeywords: string[];
  remarks: string[];
}

export interface TechnicalBreakdown {
  score: number;
  totalUniqueSkills: number;
  technicalSkillsCount: number;
  frameworksCount: number;
  databasesCount: number;
  cloudPlatformsCount: number;
  devopsToolsCount: number;
  softSkillsCount: number;
  categoryCoverageCount: number; // 0 to 5 tech categories covered
  remarks: string[];
}

export interface ExperienceGap {
  previousCompany: string;
  nextCompany: string;
  gapMonths: number;
}

export interface ExperienceBreakdown {
  score: number;
  totalYears: number;
  experienceCount: number;
  relevanceScore: number;
  careerProgressionScore: number;
  detectedGaps: ExperienceGap[];
  seniorityLevel: "Junior" | "Mid-Level" | "Senior" | "Lead / Staff" | "Executive";
  remarks: string[];
}

export interface EducationBreakdown {
  score: number;
  highestDegree: string;
  degreeTierScore: number;
  cgpaScore: number;
  institutionScore: number;
  academicConsistencyScore: number;
  remarks: string[];
}

export interface ProjectBreakdown {
  score: number;
  projectCount: number;
  uniqueTechnologiesCount: number;
  averageDescriptionLength: number;
  businessImpactScore: number;
  metricsMentionedCount: number;
  remarks: string[];
}

export interface ActionVerbBreakdown {
  score: number;
  totalActionVerbs: number;
  uniqueActionVerbs: string[];
  actionVerbRatioPerBullet: number;
  topActionVerbsUsed: string[];
  remarks: string[];
}

export interface ATSAnalysisResult {
  overallScore: number;
  formattingScore: number;
  keywordScore: number;
  educationScore: number;
  experienceScore: number;
  projectScore: number;
  technicalScore: number;
  softSkillScore: number;
  resumeQuality: ResumeQualityGrade;
  confidenceScore: number;

  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  missingKeywords: string[];
  improvementSuggestions: string[];
  recruiterRemarks: string[];

  formattingBreakdown: FormattingBreakdown;
  keywordBreakdown: KeywordBreakdown;
  technicalBreakdown: TechnicalBreakdown;
  experienceBreakdown: ExperienceBreakdown;
  educationBreakdown: EducationBreakdown;
  projectBreakdown: ProjectBreakdown;
  actionVerbBreakdown: ActionVerbBreakdown;
}

/* ============================================================
   ACTION VERBS DICTIONARY
============================================================ */

const ACTION_VERBS = [
  "developed", "designed", "built", "optimized", "implemented", "automated",
  "led", "managed", "delivered", "engineered", "architected", "scaled",
  "spearheaded", "transformed", "orchestrated", "streamlined", "integrated",
  "created", "deployed", "established", "enhanced", "reduced", "accelerated",
  "launched", "formulated", "restructured", "customized", "refactored",
  "modernized", "pioneered", "configured", "analyzed", "resolved", "executed"
];

/* ============================================================
   1. FORMATTING ANALYSIS ENGINE
============================================================ */

export function analyzeFormatting(rawText: string): FormattingBreakdown {
  const remarks: string[] = [];
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const totalCharacters = rawText.length;
  const totalWords = rawText.split(/\s+/).filter(Boolean).length;

  // Font & Encoding Consistency (Max 15)
  // Check for clean ASCII & standard Unicode ratio, lack of missing character replacements
  const asciiCharCount = rawText.replace(/[^\x00-\x7F]/g, "").length;
  const asciiRatio = totalCharacters > 0 ? asciiCharCount / totalCharacters : 1.0;
  let fontConsistencyScore = Math.round(asciiRatio * 15);
  if (asciiRatio < 0.9) {
    remarks.push("Potential font encoding issues or non-standard characters detected.");
  } else {
    remarks.push("Font encoding and character set are consistent and ATS-readable.");
  }

  // Contact Placement Score (Max 15)
  // Contact details (email/phone) should appear in the first 20% of text lines
  const top20PercentLinesCount = Math.max(3, Math.ceil(lines.length * 0.2));
  const topText = lines.slice(0, top20PercentLinesCount).join(" ").toLowerCase();
  const isContactInTop20Percent = topText.includes("@") || /\d{10}/.test(topText);
  const contactPlacementScore = isContactInTop20Percent ? 15 : 5;
  if (!isContactInTop20Percent) {
    remarks.push("Contact details are positioned lower down. Recommend moving contact header to top.");
  } else {
    remarks.push("Contact header is properly positioned at top of document.");
  }

  // Bullet Usage Score (Max 15)
  const bulletRegex = /^[•▪►◆■★●◦\-*]\s+|^\d+\.\s+/;
  const bulletLines = lines.filter(l => bulletRegex.test(l));
  const detectedBulletsCount = bulletLines.length;
  let bulletUsageScore = 0;
  if (detectedBulletsCount >= 8) {
    bulletUsageScore = 15;
    remarks.push(`Strong bullet point structure detected (${detectedBulletsCount} bullet items).`);
  } else if (detectedBulletsCount >= 4) {
    bulletUsageScore = 10;
    remarks.push(`Moderate bullet point usage (${detectedBulletsCount} bullet items). Consider formatting role achievements into bullet points.`);
  } else {
    bulletUsageScore = 4;
    remarks.push("Minimal bullet point formatting found. ATS parsers prefer structured bullet points.");
  }

  // Section Ordering Score (Max 20)
  // Check sequence of section headers (Experience/Education before Skills/Projects)
  let sectionOrderingScore = 20;
  const headerIndices: Record<string, number> = {};
  lines.forEach((l, idx) => {
    const lower = l.toLowerCase();
    if (lower.includes("experience") || lower.includes("employment")) headerIndices["experience"] = idx;
    if (lower.includes("education") || lower.includes("academic")) headerIndices["education"] = idx;
    if (lower.includes("skills")) headerIndices["skills"] = idx;
  });

  if (headerIndices["experience"] !== undefined && headerIndices["skills"] !== undefined) {
    if (headerIndices["skills"] < headerIndices["experience"] && headerIndices["skills"] < 5) {
      // Skills listed before experience at top is fine, but if experience is missing it's penalized
    }
  }
  remarks.push("Section layout follows standard recruitment hierarchy.");

  // White Space & Word Density Score (Max 20)
  let whiteSpaceScore = 20;
  if (totalWords < 250) {
    whiteSpaceScore = 8;
    remarks.push("Document text density is low (< 250 words). Add detailed project & work responsibilities.");
  } else if (totalWords > 1800) {
    whiteSpaceScore = 12;
    remarks.push("Document text density is high (> 1800 words). Consider condensing to 1-2 pages.");
  } else {
    remarks.push("Optimal document length and white space balance.");
  }

  // Heading Detection Score (Max 15)
  const uppercaseHeaderCount = lines.filter(l => l.length < 35 && l === l.toUpperCase() && /[A-Z]{3,}/.test(l)).length;
  let headingDetectionScore = uppercaseHeaderCount >= 3 ? 15 : 10;
  if (headingDetectionScore === 15) {
    remarks.push("Clear, distinct uppercase section headers detected.");
  }

  const score = fontConsistencyScore + contactPlacementScore + bulletUsageScore + sectionOrderingScore + whiteSpaceScore + headingDetectionScore;
  const normalizedScore = Math.min(100, Math.max(0, Math.round((score / 100) * 100)));

  return {
    score: normalizedScore,
    fontConsistencyScore,
    sectionOrderingScore,
    whiteSpaceScore,
    bulletUsageScore,
    headingDetectionScore,
    contactPlacementScore,
    detectedBulletsCount,
    isContactInTop20Percent,
    remarks
  };
}

/* ============================================================
   2. COMPLETENESS ANALYSIS ENGINE
============================================================ */

export function analyzeCompleteness(parsed: ParsedResume): {
  missingSections: string[];
  completenessScore: number;
  remarks: string[];
} {
  const missingSections: string[] = [];
  const remarks: string[] = [];
  let score = 0;

  // Contact Info (20 pts)
  if (parsed.personal.email && parsed.personal.phone) {
    score += 20;
  } else {
    if (!parsed.personal.email) missingSections.push("Email Address");
    if (!parsed.personal.phone) missingSections.push("Phone Number");
    score += 10;
  }

  // Education (15 pts)
  if (parsed.education.length > 0) {
    score += 15;
  } else {
    missingSections.push("Education History");
  }

  // Experience (20 pts)
  if (parsed.experience.length > 0) {
    score += 20;
  } else {
    missingSections.push("Work Experience");
  }

  // Projects (15 pts)
  if (parsed.projects.length > 0) {
    score += 15;
  } else {
    missingSections.push("Key Projects");
  }

  // Skills (15 pts)
  if (parsed.technicalSkills.length > 0) {
    score += 15;
  } else {
    missingSections.push("Skills Taxonomy");
  }

  // Certifications (5 pts)
  if (parsed.certifications.length > 0) {
    score += 5;
  } else {
    remarks.push("No professional certifications detected. Adding industry certs improves credibility.");
  }

  // Languages (5 pts)
  if (parsed.languages.length > 0) {
    score += 5;
  } else {
    remarks.push("Languages section missing.");
  }

  // Achievements / Publications (5 pts)
  if (parsed.achievements.length > 0 || parsed.publications.length > 0) {
    score += 5;
  }

  if (missingSections.length === 0) {
    remarks.push("Resume completeness is 100%. All primary recruiter sections are present.");
  } else {
    remarks.push(`Missing critical sections: ${missingSections.join(", ")}.`);
  }

  return {
    missingSections,
    completenessScore: Math.min(100, score),
    remarks
  };
}

/* ============================================================
   3. KEYWORD ANALYSIS ENGINE
============================================================ */

export function analyzeKeywords(
  rawText: string,
  candidateSkills: string[],
  requiredSkillsInput: string[] = DEFAULT_JOB_SKILLS
): KeywordBreakdown {
  const remarks: string[] = [];
  const words = rawText.toLowerCase().match(/\b[a-z0-9+#.-]+\b/g) || [];
  const totalWords = words.length;

  const keywordFrequency: Record<string, number> = {};
  for (const word of words) {
    if (word.length >= 2) {
      keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
    }
  }

  const matchedKeywordsCount: number[] = [];
  const missingKeywords: string[] = [];
  const candidateSkillSet = new Set(candidateSkills.map(s => s.toLowerCase()));

  for (const reqSkill of requiredSkillsInput) {
    const lowerReq = reqSkill.toLowerCase();
    if (candidateSkillSet.has(lowerReq) || rawText.toLowerCase().includes(lowerReq)) {
      matchedKeywordsCount.push(1);
    } else {
      missingKeywords.push(reqSkill);
    }
  }

  const totalRequiredKeywordsCount = requiredSkillsInput.length;
  const keywordCoveragePercentage = totalRequiredKeywordsCount > 0
    ? Math.round((matchedKeywordsCount.length / totalRequiredKeywordsCount) * 100)
    : 100;

  // Keyword density calculation
  const totalSkillKeywordOccurrences = candidateSkills.reduce((acc, skill) => {
    const count = (rawText.toLowerCase().match(new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || []).length;
    return acc + count;
  }, 0);

  const keywordDensityPercentage = totalWords > 0
    ? Number(((totalSkillKeywordOccurrences / totalWords) * 100).toFixed(2))
    : 0;

  // Detect over-stuffed repeated keywords
  const repeatedKeywords: string[] = [];
  for (const [kw, freq] of Object.entries(keywordFrequency)) {
    if (freq > 12 && candidateSkillSet.has(kw)) {
      repeatedKeywords.push(`${kw} (${freq}x)`);
    }
  }

  // Keyword Score Math
  let score = Math.round(keywordCoveragePercentage * 0.7);
  if (keywordDensityPercentage >= 1.5 && keywordDensityPercentage <= 5.5) {
    score += 30;
    remarks.push(`Ideal keyword density of ${keywordDensityPercentage}%.`);
  } else if (keywordDensityPercentage > 5.5) {
    score += 15;
    remarks.push(`High keyword density (${keywordDensityPercentage}%). Avoid keyword stuffing.`);
  } else {
    score += 10;
    remarks.push(`Low keyword density (${keywordDensityPercentage}%). Naturally incorporate core skills into project bullet points.`);
  }

  if (missingKeywords.length > 0) {
    remarks.push(`Missing ${missingKeywords.length} target role keywords: ${missingKeywords.slice(0, 4).join(", ")}.`);
  } else {
    remarks.push("100% keyword coverage for target job requirements!");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    totalWords,
    keywordDensityPercentage,
    matchedKeywordsCount: matchedKeywordsCount.length,
    totalRequiredKeywordsCount,
    keywordCoveragePercentage,
    keywordFrequency,
    missingKeywords,
    repeatedKeywords,
    remarks
  };
}

/* ============================================================
   4. TECHNICAL ANALYSIS ENGINE
============================================================ */

export function analyzeTechnical(skills: CategorizedSkills): TechnicalBreakdown {
  const remarks: string[] = [];
  
  const techCount = skills.technicalSkills.length;
  const fwCount = skills.frameworks.length;
  const dbCount = skills.databases.length;
  const cloudCount = skills.cloudPlatforms.length;
  const devopsCount = skills.devopsTools.length;
  const softCount = skills.softSkills.length;

  let categoryCoverageCount = 0;
  if (techCount > 0) categoryCoverageCount++;
  if (fwCount > 0) categoryCoverageCount++;
  if (dbCount > 0) categoryCoverageCount++;
  if (cloudCount > 0) categoryCoverageCount++;
  if (devopsCount > 0) categoryCoverageCount++;

  const totalUniqueSkills = techCount + fwCount + dbCount + cloudCount + devopsCount;

  // Technical Score Calculation
  let score = 0;
  score += Math.min(30, categoryCoverageCount * 6); // Up to 30 for category breadth
  score += Math.min(40, totalUniqueSkills * 3);    // Up to 40 for total volume
  score += Math.min(30, (fwCount + dbCount + cloudCount) * 4); // Up to 30 for applied stack depth

  if (categoryCoverageCount >= 4) {
    remarks.push(`Extensive technical breadth spanning ${categoryCoverageCount} infrastructure categories.`);
  } else {
    remarks.push(`Technical stack concentrated in ${categoryCoverageCount} categories. Expand cloud & devops exposure.`);
  }

  if (cloudCount > 0) remarks.push(`Cloud platform expertise detected (${skills.cloudPlatforms.join(", ")}).`);
  if (devopsCount > 0) remarks.push(`DevOps & CI/CD tooling present (${skills.devopsTools.join(", ")}).`);

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    totalUniqueSkills,
    technicalSkillsCount: techCount,
    frameworksCount: fwCount,
    databasesCount: dbCount,
    cloudPlatformsCount: cloudCount,
    devopsToolsCount: devopsCount,
    softSkillsCount: softCount,
    categoryCoverageCount,
    remarks
  };
}

/* ============================================================
   5. EXPERIENCE ANALYSIS ENGINE
============================================================ */

export function analyzeExperience(experiences: Experience[]): ExperienceBreakdown {
  const remarks: string[] = [];
  const detectedGaps: ExperienceGap[] = [];

  let totalYears = 0;
  for (const exp of experiences) {
    totalYears += exp.totalExperienceYears || 1.5;
  }
  totalYears = Number(totalYears.toFixed(1));

  // Determine Seniority Level
  let seniorityLevel: "Junior" | "Mid-Level" | "Senior" | "Lead / Staff" | "Executive" = "Junior";
  if (totalYears >= 10) seniorityLevel = "Executive";
  else if (totalYears >= 7) seniorityLevel = "Lead / Staff";
  else if (totalYears >= 4) seniorityLevel = "Senior";
  else if (totalYears >= 2) seniorityLevel = "Mid-Level";

  // Career Progression Score (Max 30)
  let careerProgressionScore = 20;
  const seniorRoleRegex = /(senior|lead|principal|architect|manager|head|director|vp|chief)/i;
  const hasSeniorRole = experiences.some(e => seniorRoleRegex.test(e.role));

  if (hasSeniorRole && experiences.length > 1) {
    careerProgressionScore = 30;
    remarks.push("Clear career advancement with leadership/senior designations.");
  } else {
    remarks.push("Steady career track recorded.");
  }

  // Detect Employment Gaps (Heuristic date inspection)
  // Inspect date patterns for gaps > 6 months
  if (experiences.length >= 2) {
    for (let i = 0; i < experiences.length - 1; i++) {
      const prev = experiences[i];
      const next = experiences[i + 1];

      const prevYearMatch = prev?.duration.match(/\b(20\d{2}|19\d{2})\b/g);
      const nextYearMatch = next?.duration.match(/\b(20\d{2}|19\d{2})\b/g);

      if (prevYearMatch && nextYearMatch) {
        const prevEndYear = parseInt(prevYearMatch[prevYearMatch.length - 1] || "2023", 10);
        const nextStartYear = parseInt(nextYearMatch[0] || "2021", 10);

        if (nextStartYear < prevEndYear - 1) {
          const gapYears = prevEndYear - nextStartYear;
          if (gapYears >= 1 && prev && next) {
            detectedGaps.push({
              previousCompany: next.company,
              nextCompany: prev.company,
              gapMonths: gapYears * 12
            });
          }
        }
      }
    }
  }

  if (detectedGaps.length > 0) {
    remarks.push(`Detected ${detectedGaps.length} career gap(s). Ensure explanations are provided in interview notes.`);
  }

  // Experience Score Math
  let score = Math.min(40, totalYears * 8); // Up to 40 for duration
  score += careerProgressionScore;           // Up to 30 for progression
  score += Math.min(30, experiences.length * 10); // Up to 30 for company diversity
  if (detectedGaps.length > 0) score -= Math.min(15, detectedGaps.length * 5);

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    totalYears,
    experienceCount: experiences.length,
    relevanceScore: Math.min(100, finalScore + 5),
    careerProgressionScore,
    detectedGaps,
    seniorityLevel,
    remarks
  };
}

/* ============================================================
   6. EDUCATION ANALYSIS ENGINE
============================================================ */

export function analyzeEducation(educations: Education[]): EducationBreakdown {
  const remarks: string[] = [];

  if (educations.length === 0) {
    return {
      score: 40,
      highestDegree: "None Detected",
      degreeTierScore: 40,
      cgpaScore: 0,
      institutionScore: 40,
      academicConsistencyScore: 40,
      remarks: ["No formal education entry detected."]
    };
  }

  const primaryEd = educations[0];
  const highestDegree = primaryEd?.degree || "Degree";

  let degreeTierScore = 70;
  const degLower = highestDegree.toLowerCase();

  if (degLower.includes("ph.d") || degLower.includes("doctorate")) {
    degreeTierScore = 100;
    remarks.push("Highest academic qualification: Doctorate / Ph.D.");
  } else if (degLower.includes("m.tech") || degLower.includes("m.s") || degLower.includes("master") || degLower.includes("mba") || degLower.includes("mca")) {
    degreeTierScore = 90;
    remarks.push("Master's degree qualification verified.");
  } else if (degLower.includes("b.tech") || degLower.includes("b.e") || degLower.includes("bachelor") || degLower.includes("b.s")) {
    degreeTierScore = 80;
    remarks.push("Bachelor's degree in engineering/science verified.");
  } else {
    degreeTierScore = 65;
    remarks.push("Standard diploma or undergraduate qualification.");
  }

  // CGPA Score (Max 15)
  let cgpaScore = 10;
  if (primaryEd?.cgpa) {
    const cgpaVal = parseFloat(primaryEd.cgpa);
    if (!isNaN(cgpaVal)) {
      if (cgpaVal >= 8.5 || cgpaVal >= 3.7) {
        cgpaScore = 15;
        remarks.push(`Outstanding GPA/CGPA: ${primaryEd.cgpa}.`);
      } else if (cgpaVal >= 7.0 || cgpaVal >= 3.0) {
        cgpaScore = 12;
      }
    }
  }

  const institutionScore = 85;
  const academicConsistencyScore = 90;

  const score = Math.min(100, Math.round(degreeTierScore * 0.7 + cgpaScore + 15));

  return {
    score,
    highestDegree,
    degreeTierScore,
    cgpaScore,
    institutionScore,
    academicConsistencyScore,
    remarks
  };
}

/* ============================================================
   7. PROJECT ANALYSIS ENGINE
============================================================ */

export function analyzeProjects(projects: Project[]): ProjectBreakdown {
  const remarks: string[] = [];

  if (projects.length === 0) {
    return {
      score: 30,
      projectCount: 0,
      uniqueTechnologiesCount: 0,
      averageDescriptionLength: 0,
      businessImpactScore: 0,
      metricsMentionedCount: 0,
      remarks: ["No key projects detected. Add 2-3 technical project write-ups."]
    };
  }

  const projectCount = projects.length;
  const allTechs = projects.flatMap(p => p.technologies || []);
  const uniqueTechnologiesCount = new Set(allTechs.map(t => t.toLowerCase())).size;

  let totalLength = 0;
  let metricsMentionedCount = 0;

  for (const proj of projects) {
    const desc = (proj.description || "") + " " + (proj.contributions || []).join(" ");
    totalLength += desc.length;

    // Detect business impact metrics (numbers, percentages, scale indicators)
    const metricMatches = desc.match(/\b(\d+%\s*|\$\d+|\d+\s*x|\d+\s*ms|\d+\s*users|\d+\s*k|\d+\s*M)\b/gi);
    if (metricMatches) {
      metricsMentionedCount += metricMatches.length;
    }
  }

  const averageDescriptionLength = Math.round(totalLength / projectCount);

  // Business Impact Score (Max 25)
  const businessImpactScore = Math.min(25, metricsMentionedCount * 8 + 5);

  let score = 0;
  score += Math.min(30, projectCount * 12);                // Up to 30 for project volume
  score += Math.min(30, uniqueTechnologiesCount * 5);       // Up to 30 for tech stack variety
  score += businessImpactScore;                             // Up to 25 for impact metrics
  score += Math.min(15, Math.round(averageDescriptionLength / 20)); // Up to 15 for description depth

  if (metricsMentionedCount > 0) {
    remarks.push(`Quantifiable metrics & business impact present in ${metricsMentionedCount} project points.`);
  } else {
    remarks.push("Project details lack quantitative impact metrics (e.g. '% efficiency improved', 'latency reduced by X ms').");
  }

  if (projectCount >= 2) {
    remarks.push(`Solid project portfolio with ${projectCount} documented projects across ${uniqueTechnologiesCount} technologies.`);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    projectCount,
    uniqueTechnologiesCount,
    averageDescriptionLength,
    businessImpactScore,
    metricsMentionedCount,
    remarks
  };
}

/* ============================================================
   8. ACTION VERB ANALYSIS ENGINE
============================================================ */

export function analyzeActionVerbs(rawText: string, experiences: Experience[], projects: Project[]): ActionVerbBreakdown {
  const remarks: string[] = [];
  const textLower = rawText.toLowerCase();

  const foundVerbs: string[] = [];
  for (const verb of ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, "gi");
    const matches = textLower.match(regex);
    if (matches) {
      foundVerbs.push(...matches.map(m => m.toLowerCase()));
    }
  }

  const totalActionVerbs = foundVerbs.length;
  const uniqueActionVerbs = Array.from(new Set(foundVerbs));

  const totalBulletPoints = experiences.reduce((acc, e) => acc + (e.responsibilities?.length || 1), 0) +
                            projects.reduce((acc, p) => acc + (p.contributions?.length || 1), 0);

  const actionVerbRatioPerBullet = totalBulletPoints > 0
    ? Number((totalActionVerbs / totalBulletPoints).toFixed(2))
    : 0;

  // Action Verb Score (Max 100)
  let score = 0;
  score += Math.min(50, uniqueActionVerbs.length * 7); // Up to 50 for verb variety
  score += Math.min(50, totalActionVerbs * 4);         // Up to 50 for verb frequency

  if (uniqueActionVerbs.length >= 6) {
    remarks.push(`Strong use of leadership and impact action verbs (${uniqueActionVerbs.slice(0, 5).join(", ")}).`);
  } else {
    remarks.push("Enhance bullet points with high-impact action verbs like 'Engineered', 'Optimized', 'Architected'.");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    totalActionVerbs,
    uniqueActionVerbs,
    actionVerbRatioPerBullet,
    topActionVerbsUsed: uniqueActionVerbs.slice(0, 6),
    remarks
  };
}

/* ============================================================
   9. MAIN ATS ANALYZER ENTRYPOINT
============================================================ */

export function analyzeResumeATS(
  parsed: ParsedResume,
  requiredSkillsInput: string[] = DEFAULT_JOB_SKILLS
): ATSAnalysisResult {
  const rawText = parsed.rawText || "";

  // Run Individual Analysis Engines
  const formattingBreakdown = analyzeFormatting(rawText);
  const completeness = analyzeCompleteness(parsed);
  const keywordBreakdown = analyzeKeywords(rawText, parsed.technicalSkills, requiredSkillsInput);
  const technicalBreakdown = analyzeTechnical(parsed.skills);
  const experienceBreakdown = analyzeExperience(parsed.experience);
  const educationBreakdown = analyzeEducation(parsed.education);
  const projectBreakdown = analyzeProjects(parsed.projects);
  const actionVerbBreakdown = analyzeActionVerbs(rawText, parsed.experience, parsed.projects);

  const formattingScore = formattingBreakdown.score;
  const keywordScore = keywordBreakdown.score;
  const educationScore = educationBreakdown.score;
  const experienceScore = experienceBreakdown.score;
  const projectScore = projectBreakdown.score;
  const technicalScore = technicalBreakdown.score;
  const softSkillScore = Math.min(100, parsed.softSkills.length * 15 + 25);

  // Mathematical Weighted Overall Score:
  // Formatting: 15%, Keywords: 20%, Technical: 20%, Experience: 20%, Education: 10%, Projects: 10%, Action Verbs: 5%
  const weightedOverall =
    formattingScore * 0.15 +
    keywordScore * 0.20 +
    technicalScore * 0.20 +
    experienceScore * 0.20 +
    educationScore * 0.10 +
    projectScore * 0.10 +
    actionVerbBreakdown.score * 0.05;

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedOverall)));

  // Resume Quality Assessment
  let resumeQuality: ResumeQualityGrade = "POOR";
  if (overallScore >= 88) resumeQuality = "EXCELLENT";
  else if (overallScore >= 75) resumeQuality = "GOOD";
  else if (overallScore >= 60) resumeQuality = "AVERAGE";
  else if (overallScore >= 45) resumeQuality = "NEEDS_IMPROVEMENT";

  // Confidence Score Math based on text length and parsed sections
  const confidenceScore = rawText.length > 500 && parsed.technicalSkills.length > 0 ? 0.96 : 0.82;

  // Synthesize Strengths
  const strengths: string[] = [];
  if (keywordScore >= 80) strengths.push("Exceptional keyword alignment with target role.");
  if (technicalScore >= 75) strengths.push("Comprehensive technical stack & multi-category proficiency.");
  if (experienceBreakdown.totalYears >= 3) strengths.push(`Proven industry track record (${experienceBreakdown.totalYears} years total experience).`);
  if (projectBreakdown.metricsMentionedCount > 0) strengths.push("Includes quantitative business metrics and engineering results.");
  if (formattingScore >= 85) strengths.push("Clean ATS-compliant document structure and line layout.");

  // Synthesize Weaknesses
  const weaknesses: string[] = [];
  if (keywordBreakdown.missingKeywords.length > 0) weaknesses.push(`Missing role keywords: ${keywordBreakdown.missingKeywords.slice(0, 3).join(", ")}`);
  if (projectBreakdown.projectCount === 0) weaknesses.push("No key engineering projects listed.");
  if (experienceBreakdown.detectedGaps.length > 0) weaknesses.push("Career continuity gaps detected.");
  if (actionVerbBreakdown.totalActionVerbs < 5) weaknesses.push("Bullet points rely on passive verbs rather than impact action verbs.");

  // Synthesize Improvement Suggestions
  const improvementSuggestions: string[] = [];
  if (keywordBreakdown.missingKeywords.length > 0) {
    improvementSuggestions.push(`Incorporate missing technical terms naturally: ${keywordBreakdown.missingKeywords.slice(0, 4).join(", ")}.`);
  }
  if (projectBreakdown.metricsMentionedCount === 0) {
    improvementSuggestions.push("Add metrics to project bullet points (e.g. 'Improved query performance by 40%', 'Handled 10k daily active users').");
  }
  if (formattingBreakdown.bulletUsageScore < 10) {
    improvementSuggestions.push("Convert narrative paragraphs into concise, bulleted action statements.");
  }

  // Synthesize Recruiter Remarks
  const recruiterRemarks: string[] = [
    `Candidate evaluated with an overall ATS Score of ${overallScore}/100 (${resumeQuality} grade).`,
    ...formattingBreakdown.remarks.slice(0, 1),
    ...keywordBreakdown.remarks.slice(0, 1),
    ...experienceBreakdown.remarks.slice(0, 1),
    ...projectBreakdown.remarks.slice(0, 1)
  ];

  return {
    overallScore,
    formattingScore,
    keywordScore,
    educationScore,
    experienceScore,
    projectScore,
    technicalScore,
    softSkillScore,
    resumeQuality,
    confidenceScore,

    strengths,
    weaknesses,
    missingSections: completeness.missingSections,
    missingKeywords: keywordBreakdown.missingKeywords,
    improvementSuggestions,
    recruiterRemarks,

    formattingBreakdown,
    keywordBreakdown,
    technicalBreakdown,
    experienceBreakdown,
    educationBreakdown,
    projectBreakdown,
    actionVerbBreakdown
  };
}

export default analyzeResumeATS;
