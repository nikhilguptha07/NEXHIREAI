import {
  ParsedResume,
  Education,
  Experience,
  Project,
  CategorizedSkills
} from "./resume-parser";

import {
  JobDescription,
  normalizeSkill
} from "./job-parser";

/* ============================================================
   ENTERPRISE SEMANTIC MATCHER INTERFACES
============================================================ */

export type RecommendationStatus = "STRONG_HIRE" | "HIRE" | "POSSIBLE_HIRE" | "REJECT";

export interface SkillCategoryBreakdown {
  category: string;
  matched: string[];
  missing: string[];
  matchPercentage: number;
}

export interface DetailedSkillMatch {
  matchedSkills: string[];
  missingSkills: string[];
  weakSkills: string[];
  optionalSkillsMissing: string[];
  criticalSkillsMissing: string[];
  extraSkills: string[];
  categories: SkillCategoryBreakdown[];
  score: number;
}

export interface DetailedExperienceMatch {
  requiredYears: number;
  candidateYears: number;
  yearsMatchRatio: number;
  relevanceScore: number;
  careerProgressionScore: number;
  hasGaps: boolean;
  score: number;
}

export interface DetailedEducationMatch {
  requiredDegree: string;
  candidateDegree: string;
  degreeMatch: boolean;
  branchMatch: boolean;
  cgpaBonus: number;
  score: number;
}

export interface DetailedProjectMatch {
  projectCount: number;
  matchedProjectTechs: string[];
  businessImpactScore: number;
  techDiversityScore: number;
  score: number;
}

export interface DetailedKeywordMatch {
  coveragePercentage: number;
  primaryMatchPercentage: number;
  secondaryMatchPercentage: number;
  mandatoryMatchPercentage: number;
  densityScore: number;
  penalty: number;
  score: number;
}

export interface SemanticMatchResult {
  overallMatch: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  projectMatch: number;
  certificationMatch: number;
  keywordMatch: number;

  matchedSkills: string[];
  missingSkills: string[];
  weakSkills: string[];
  optionalSkillsMissing: string[];
  criticalSkillsMissing: string[];
  extraSkills: string[];

  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];

  candidateSummary: string;
  recruiterSummary: string;
  interviewRecommendation: string;
  hiringRecommendation: string;

  hiringProbability: number;
  interviewProbability: number;
  resumeRelevance: number;
  rankingScore: number;
  recommendation: RecommendationStatus;
}

/* ============================================================
   1. SKILL MATCHING ENGINE
============================================================ */

export function matchSkills(
  resume: ParsedResume,
  job: JobDescription
): DetailedSkillMatch {
  const normCandidateSkills = new Set(
    resume.technicalSkills.map(s => normalizeSkill(s).toLowerCase())
  );

  const jobReqTechs = job.technicalSkills.allTechnicalSkills;
  const criticalList = job.criticalSkills.map(s => normalizeSkill(s));
  const optionalList = job.optionalSkills.map(s => normalizeSkill(s));

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const weakSkills: string[] = [];
  const criticalSkillsMissing: string[] = [];
  const optionalSkillsMissing: string[] = [];

  // Evaluate Job Required Skills against Candidate Skills
  for (const skill of jobReqTechs) {
    const norm = normalizeSkill(skill);
    const lower = norm.toLowerCase();

    if (normCandidateSkills.has(lower)) {
      matchedSkills.push(norm);
    } else {
      missingSkills.push(norm);
      if (criticalList.some(c => c.toLowerCase() === lower)) {
        criticalSkillsMissing.push(norm);
      }
      if (optionalList.some(o => o.toLowerCase() === lower)) {
        optionalSkillsMissing.push(norm);
      }
    }
  }

  // Detect Weak Skills (Candidate has skill in text but not categorized heavily)
  for (const missing of missingSkills) {
    if (resume.rawText.toLowerCase().includes(missing.toLowerCase())) {
      weakSkills.push(missing);
    }
  }

  // Detect Extra Skills (Candidate skills not explicitly required by Job Description)
  const jobTechSet = new Set(jobReqTechs.map(s => normalizeSkill(s).toLowerCase()));
  const extraSkills: string[] = [];
  for (const candidateSkill of resume.technicalSkills) {
    const norm = normalizeSkill(candidateSkill);
    if (!jobTechSet.has(norm.toLowerCase())) {
      extraSkills.push(norm);
    }
  }

  // Category Breakdown Analysis across taxonomies
  const categories: SkillCategoryBreakdown[] = [
    {
      category: "Languages",
      matched: job.technicalSkills.languages.filter(s => normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      missing: job.technicalSkills.languages.filter(s => !normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      matchPercentage: 0
    },
    {
      category: "Frameworks & Libraries",
      matched: job.technicalSkills.frameworks.filter(s => normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      missing: job.technicalSkills.frameworks.filter(s => !normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      matchPercentage: 0
    },
    {
      category: "Databases & Cloud",
      matched: [...job.technicalSkills.databases, ...job.technicalSkills.cloudPlatforms].filter(s => normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      missing: [...job.technicalSkills.databases, ...job.technicalSkills.cloudPlatforms].filter(s => !normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      matchPercentage: 0
    },
    {
      category: "DevOps & Infrastructure",
      matched: job.technicalSkills.devops.filter(s => normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      missing: job.technicalSkills.devops.filter(s => !normCandidateSkills.has(normalizeSkill(s).toLowerCase())),
      matchPercentage: 0
    }
  ];

  categories.forEach(cat => {
    const total = cat.matched.length + cat.missing.length;
    cat.matchPercentage = total > 0 ? Math.round((cat.matched.length / total) * 100) : 100;
  });

  // Calculate Skill Score Math
  const totalRequired = jobReqTechs.length;
  let score = totalRequired > 0
    ? (matchedSkills.length / totalRequired) * 100
    : 100;

  // Penalize missing critical skills heavily
  if (criticalSkillsMissing.length > 0) {
    score -= criticalSkillsMissing.length * 8;
  }

  // Bonus for extra relevant skills
  if (extraSkills.length > 0) {
    score += Math.min(10, extraSkills.length * 1.5);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    matchedSkills: Array.from(new Set(matchedSkills)),
    missingSkills: Array.from(new Set(missingSkills)),
    weakSkills: Array.from(new Set(weakSkills)),
    optionalSkillsMissing: Array.from(new Set(optionalSkillsMissing)),
    criticalSkillsMissing: Array.from(new Set(criticalSkillsMissing)),
    extraSkills: Array.from(new Set(extraSkills)),
    categories,
    score: finalScore
  };
}

/* ============================================================
   2. EXPERIENCE MATCHING ENGINE
============================================================ */

export function matchExperience(
  resume: ParsedResume,
  job: JobDescription
): DetailedExperienceMatch {
  const requiredYears = job.experience.minimumYears;
  const candidateYears = resume.totalExperienceYears || 0;

  // Match Ratio
  const yearsMatchRatio = requiredYears > 0
    ? Number((candidateYears / requiredYears).toFixed(2))
    : 1.0;

  let score = 0;
  if (candidateYears >= requiredYears) {
    score = 70 + Math.min(30, (candidateYears - requiredYears) * 5);
  } else {
    score = Math.max(20, Math.round((candidateYears / requiredYears) * 70));
  }

  // Role Similarity / Keyword Check in Experience Responsibilities
  const roleKeywords = job.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const expText = resume.experience.map(e => (e.role + " " + (e.description || "")).toLowerCase()).join(" ");
  
  let roleMatchCount = 0;
  for (const kw of roleKeywords) {
    if (expText.includes(kw)) roleMatchCount++;
  }
  const relevanceScore = roleKeywords.length > 0
    ? Math.round((roleMatchCount / roleKeywords.length) * 100)
    : 80;

  // Career Progression
  const hasLeadRole = resume.experience.some(e => /(lead|senior|principal|architect|manager)/i.test(e.role));
  const careerProgressionScore = hasLeadRole ? 90 : 75;

  // Employment Gaps Check
  const hasGaps = resume.experience.length > 1 && candidateYears < resume.experience.length * 1.2;

  const finalScore = Math.min(100, Math.max(0, Math.round(score * 0.6 + relevanceScore * 0.4)));

  return {
    requiredYears,
    candidateYears,
    yearsMatchRatio,
    relevanceScore,
    careerProgressionScore,
    hasGaps,
    score: finalScore
  };
}

/* ============================================================
   3. EDUCATION MATCHING ENGINE
============================================================ */

export function matchEducation(
  resume: ParsedResume,
  job: JobDescription
): DetailedEducationMatch {
  const reqDeg = job.education.requiredDegree.toLowerCase();
  const prefDeg = job.education.preferredDegree.toLowerCase();

  const candidateEd = resume.education[0];
  const candidateDegree = candidateEd?.degree || "Degree";

  let degreeMatch = false;
  let score = 60;

  for (const ed of resume.education) {
    const degLower = ed.degree.toLowerCase();
    if (degLower.includes("b.tech") || degLower.includes("bachelor") || degLower.includes("b.e")) {
      degreeMatch = true;
      score = 80;
    }
    if (degLower.includes("master") || degLower.includes("m.tech") || degLower.includes("m.s") || degLower.includes("phd")) {
      degreeMatch = true;
      score = 95;
    }
  }

  // Branch / Specialization Match
  let branchMatch = false;
  const branchLower = (candidateEd?.branch || "").toLowerCase();
  if (branchLower.includes("computer science") || branchLower.includes("engineering") || branchLower.includes("it")) {
    branchMatch = true;
    score += 5;
  }

  // CGPA Bonus
  let cgpaBonus = 0;
  if (candidateEd?.cgpa) {
    const val = parseFloat(candidateEd.cgpa);
    if (!isNaN(val) && (val >= 8.0 || val >= 3.5)) {
      cgpaBonus = 5;
      score += 5;
    }
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    requiredDegree: job.education.requiredDegree,
    candidateDegree,
    degreeMatch,
    branchMatch,
    cgpaBonus,
    score: finalScore
  };
}

/* ============================================================
   4. KEYWORD MATCHING ENGINE
============================================================ */

export function matchKeywords(
  resume: ParsedResume,
  job: JobDescription
): DetailedKeywordMatch {
  const rawLower = resume.rawText.toLowerCase();

  // Primary Keywords Match
  const primaryMatched = job.primaryKeywords.filter(kw => rawLower.includes(kw.toLowerCase()));
  const primaryMatchPercentage = job.primaryKeywords.length > 0
    ? Math.round((primaryMatched.length / job.primaryKeywords.length) * 100)
    : 100;

  // Secondary Keywords Match
  const secondaryMatched = job.secondaryKeywords.filter(kw => rawLower.includes(kw.toLowerCase()));
  const secondaryMatchPercentage = job.secondaryKeywords.length > 0
    ? Math.round((secondaryMatched.length / job.secondaryKeywords.length) * 100)
    : 100;

  // Mandatory Skills Match
  const mandatoryMatched = job.mandatorySkills.filter(kw => rawLower.includes(kw.toLowerCase()));
  const mandatoryMatchPercentage = job.mandatorySkills.length > 0
    ? Math.round((mandatoryMatched.length / job.mandatorySkills.length) * 100)
    : 100;

  // Coverage Percentage
  const allJobKeywords = [...job.primaryKeywords, ...job.secondaryKeywords];
  const coveragePercentage = Math.round((primaryMatchPercentage + secondaryMatchPercentage) / 2);

  // Density Score & Penalty
  const words = rawLower.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  let totalKwOccurrences = 0;
  for (const kw of job.primaryKeywords) {
    const matches = rawLower.match(new RegExp(`\\b${kw.toLowerCase()}\\b`, "g"));
    if (matches) totalKwOccurrences += matches.length;
  }

  const density = totalWords > 0 ? (totalKwOccurrences / totalWords) * 100 : 0;
  let densityScore = 20;
  let penalty = 0;

  if (density > 8.0) {
    penalty = 15; // Keyword stuffing penalty
  }

  const score = Math.min(100, Math.max(0, Math.round(mandatoryMatchPercentage * 0.5 + primaryMatchPercentage * 0.3 + secondaryMatchPercentage * 0.2 - penalty)));

  return {
    coveragePercentage,
    primaryMatchPercentage,
    secondaryMatchPercentage,
    mandatoryMatchPercentage,
    densityScore,
    penalty,
    score
  };
}

/* ============================================================
   5. PROJECT MATCHING ENGINE
============================================================ */

export function matchProjects(
  resume: ParsedResume,
  job: JobDescription
): DetailedProjectMatch {
  const projectCount = resume.projects.length;

  if (projectCount === 0) {
    return {
      projectCount: 0,
      matchedProjectTechs: [],
      businessImpactScore: 0,
      techDiversityScore: 0,
      score: 30
    };
  }

  const projTechs = resume.projects.flatMap(p => p.technologies || []).map(t => normalizeSkill(t));
  const jobTechSet = new Set(job.technicalSkills.allTechnicalSkills.map(s => s.toLowerCase()));

  const matchedProjectTechs = Array.from(new Set(
    projTechs.filter(t => jobTechSet.has(t.toLowerCase()))
  ));

  // Business Impact Detection (metrics present in project descriptions)
  let metricsCount = 0;
  for (const proj of resume.projects) {
    const desc = proj.description + " " + proj.contributions.join(" ");
    const matches = desc.match(/\b(\d+%\s*|\$\d+|\d+\s*ms|\d+\s*x|\d+\s*users)\b/gi);
    if (matches) metricsCount += matches.length;
  }

  const businessImpactScore = Math.min(30, metricsCount * 10 + 10);
  const techDiversityScore = Math.min(30, matchedProjectTechs.length * 8);

  let score = Math.min(40, projectCount * 15) + businessImpactScore + techDiversityScore;
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    projectCount,
    matchedProjectTechs,
    businessImpactScore,
    techDiversityScore,
    score: finalScore
  };
}

/* ============================================================
   6. CERTIFICATION MATCHING ENGINE
============================================================ */

export function matchCertifications(
  resume: ParsedResume,
  job: JobDescription
): number {
  if (resume.certifications.length === 0) return 60;

  const certText = resume.certifications.join(" ").toLowerCase();
  const reqTechs = job.mandatorySkills.map(s => s.toLowerCase());

  let certMatches = 0;
  for (const skill of reqTechs) {
    if (certText.includes(skill)) certMatches++;
  }

  return Math.min(100, 70 + certMatches * 10 + resume.certifications.length * 5);
}

/* ============================================================
   7. MAIN SEMANTIC MATCHER ENTRYPOINT
============================================================ */

export function evaluateSemanticMatch(
  resume: ParsedResume,
  job: JobDescription
): SemanticMatchResult {
  // Run Sub-Matching Modules
  const skillMatchDetails = matchSkills(resume, job);
  const expMatchDetails = matchExperience(resume, job);
  const eduMatchDetails = matchEducation(resume, job);
  const keywordMatchDetails = matchKeywords(resume, job);
  const projMatchDetails = matchProjects(resume, job);
  const certScore = matchCertifications(resume, job);

  const skillMatch = skillMatchDetails.score;
  const experienceMatch = expMatchDetails.score;
  const educationMatch = eduMatchDetails.score;
  const projectMatch = projMatchDetails.score;
  const keywordMatch = keywordMatchDetails.score;
  const certificationMatch = certScore;

  // Mathematical Overall Match Formula:
  // Skills: 35%, Experience: 25%, Keywords: 15%, Projects: 12.5%, Education: 7.5%, Certifications: 5%
  const weightedMatch =
    skillMatch * 0.35 +
    experienceMatch * 0.25 +
    keywordMatch * 0.15 +
    projectMatch * 0.125 +
    educationMatch * 0.075 +
    certificationMatch * 0.05;

  const overallMatch = Math.min(100, Math.max(0, Math.round(weightedMatch)));

  // Determine Recommendation Status
  let recommendation: RecommendationStatus = "REJECT";
  if (overallMatch >= 84) recommendation = "STRONG_HIRE";
  else if (overallMatch >= 72) recommendation = "HIRE";
  else if (overallMatch >= 55) recommendation = "POSSIBLE_HIRE";

  // Calculate Hiring & Interview Probabilities Mathematically
  const hiringProbability = Math.min(98, Math.max(10, Math.round(overallMatch * 0.92 + (expMatchDetails.candidateYears >= job.experience.minimumYears ? 6 : -10))));
  const interviewProbability = Math.min(99, Math.max(15, Math.round(overallMatch * 0.95 + 4)));
  const resumeRelevance = overallMatch;

  // Ranking Score (0 to 1000 scale for ATS sorting algorithms)
  const rankingScore = Math.min(1000, Math.round(overallMatch * 9.5 + skillMatchDetails.matchedSkills.length * 5 + expMatchDetails.candidateYears * 10));

  // Synthesize Strengths
  const strengths: string[] = [];
  if (skillMatch >= 80) strengths.push(`High skill compatibility (${skillMatchDetails.matchedSkills.length} key required technologies matched).`);
  if (expMatchDetails.candidateYears >= job.experience.minimumYears) {
    strengths.push(`Meets experience bar (${expMatchDetails.candidateYears} years vs. ${job.experience.minimumYears} years required).`);
  }
  if (projMatchDetails.businessImpactScore >= 20) strengths.push("Strong engineering projects with verified business metrics.");
  if (keywordMatchDetails.mandatoryMatchPercentage >= 90) strengths.push("Excellent keyword alignment for mandatory role skills.");

  // Synthesize Weaknesses
  const weaknesses: string[] = [];
  if (skillMatchDetails.criticalSkillsMissing.length > 0) {
    weaknesses.push(`Missing critical role skills: ${skillMatchDetails.criticalSkillsMissing.join(", ")}`);
  }
  if (expMatchDetails.candidateYears < job.experience.minimumYears) {
    weaknesses.push(`Experience shortfall (${expMatchDetails.candidateYears} years candidate vs. ${job.experience.minimumYears} years required).`);
  }
  if (projMatchDetails.projectCount === 0) {
    weaknesses.push("No technical project entries found.");
  }

  // Synthesize Improvement Suggestions
  const improvementSuggestions: string[] = [];
  if (skillMatchDetails.missingSkills.length > 0) {
    improvementSuggestions.push(`Add hands-on experience or project context for: ${skillMatchDetails.missingSkills.slice(0, 4).join(", ")}.`);
  }
  if (projMatchDetails.businessImpactScore < 15) {
    improvementSuggestions.push("Highlight quantitative metrics in project descriptions (e.g., performance improvements, scale).");
  }

  // Candidate & Recruiter Summaries
  const candidateSummary = `Candidate ${resume.personal.fullName} demonstrates a ${overallMatch}% semantic fit for ${job.title} at ${job.company}. Matched ${skillMatchDetails.matchedSkills.length} required technologies with ${expMatchDetails.candidateYears} years of total experience.`;

  const recruiterSummary = `ATS Semantic Match Engine evaluated candidate with an overall score of ${overallMatch}/100. Skill Match: ${skillMatch}%, Experience Match: ${experienceMatch}%, Keyword Coverage: ${keywordMatchDetails.coveragePercentage}%. Recommendation: ${recommendation.replace("_", " ")}.`;

  const interviewRecommendation = overallMatch >= 70
    ? "Fast-track candidate for technical interview round. Focus on verifying missing skills."
    : "Review candidate manual portfolio before scheduling interview.";

  const hiringRecommendation = recommendation === "STRONG_HIRE" || recommendation === "HIRE"
    ? "Strong alignment with engineering requirement. Highly recommended for offer pipeline."
    : "Conditional pipeline candidate. Skill gaps require upskilling or further evaluation.";

  return {
    overallMatch,
    skillMatch,
    experienceMatch,
    educationMatch,
    projectMatch,
    certificationMatch,
    keywordMatch,

    matchedSkills: skillMatchDetails.matchedSkills,
    missingSkills: skillMatchDetails.missingSkills,
    weakSkills: skillMatchDetails.weakSkills,
    optionalSkillsMissing: skillMatchDetails.optionalSkillsMissing,
    criticalSkillsMissing: skillMatchDetails.criticalSkillsMissing,
    extraSkills: skillMatchDetails.extraSkills,

    strengths,
    weaknesses,
    improvementSuggestions,

    candidateSummary,
    recruiterSummary,
    interviewRecommendation,
    hiringRecommendation,

    hiringProbability,
    interviewProbability,
    resumeRelevance,
    rankingScore,
    recommendation
  };
}

export default evaluateSemanticMatch;
