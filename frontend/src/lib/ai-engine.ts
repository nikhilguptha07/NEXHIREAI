import { ParsedResume } from "./resume-parser";
import { JobDescription } from "./job-parser";
import { ATSAnalysisResult, analyzeResumeATS } from "./ats-analyzer";
import { SemanticMatchResult, evaluateSemanticMatch } from "./semantic-matcher";
import { RankedCandidate, calculateCandidateScore } from "./resume-ranker";

/* ============================================================
   ENTERPRISE AI RECRUITER ENGINE INTERFACES (ai-engine.ts)
============================================================ */

export type AIRecommendationDecision =
  | "Strong Hire"
  | "Hire"
  | "Consider"
  | "Hold"
  | "Reject";

export interface AISalaryIntelligence {
  min: number;
  max: number;
  currency: string;
  formatted: string;
  marketPosition: "Above Market Rate" | "Market Rate" | "Below Market Rate";
}

export interface AISkillIntelligence {
  primarySkills: string[];
  secondarySkills: string[];
  coreCompetencies: string[];
  emergingSkills: string[];
  skillDiversity: number;
  skillStrengthIndex: number;
  skillCoverageRatio: number;
  skillMaturity: "Junior" | "Intermediate" | "Advanced" | "Expert";
}

export interface AIRecruiterReport {
  executiveSummary: string;
  candidateSummary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  skillGapAnalysis: string[];
  improvementSuggestions: string[];
  careerRecommendations: string[];
  learningRecommendations: string[];
  resumeRecommendations: string[];

  recruiterNotes: string[];
  interviewFocusAreas: string[];
  technicalTopics: string[];
  behavioralTopics: string[];
  leadershipTopics: string[];
  riskFactors: string[];
  positiveIndicators: string[];

  salaryRange: AISalaryIntelligence;
  expectedDesignation: string;
  seniorityLevel: string;
  jobLevel: string;
  marketPosition: string;

  candidateQuality: "TOP_TIER" | "HIGH_POTENTIAL" | "QUALIFIED" | "NEEDS_UP_SKILLING" | "UNQUALIFIED";
  resumeQuality: string;
  hiringProbability: number;
  interviewProbability: number;
  offerProbability: number;
  confidenceScore: number;
  riskScore: number;
  recommendation: AIRecommendationDecision;

  skillIntelligence: AISkillIntelligence;
}

/* ============================================================
   1. SKILL INTELLIGENCE ANALYZER
============================================================ */

export function analyzeSkillIntelligence(
  resume: ParsedResume,
  job: JobDescription
): AISkillIntelligence {
  const techSkills = resume.technicalSkills;
  const frameworks = resume.frameworks;
  const databases = resume.databases;
  const cloud = resume.cloudPlatforms;
  const devops = resume.devopsTools;

  const primarySkills = techSkills.slice(0, 5);
  const secondarySkills = [...frameworks, ...databases].slice(0, 5);
  const coreCompetencies = [...techSkills.slice(0, 4), ...frameworks.slice(0, 3)];

  const emergingSkillsList = ["Oracle Database 23ai", "LangChain", "PyTorch", "Kubernetes", "Rust", "Go", "GraphQL"];
  const emergingSkills = techSkills.filter(s =>
    emergingSkillsList.some(e => e.toLowerCase() === s.toLowerCase())
  );

  const skillDiversity = new Set([...techSkills, ...frameworks, ...databases, ...cloud, ...devops]).size;
  const matchedCount = matchSkillOverlapCount(resume, job);
  const totalRequired = job.technicalSkills.allTechnicalSkills.length;
  
  const skillCoverageRatio = totalRequired > 0 ? Number((matchedCount / totalRequired).toFixed(2)) : 1.0;
  const skillStrengthIndex = Math.min(100, Math.round(skillCoverageRatio * 70 + skillDiversity * 2));

  let skillMaturity: "Junior" | "Intermediate" | "Advanced" | "Expert" = "Junior";
  if (skillStrengthIndex >= 85 && resume.totalExperienceYears >= 5) skillMaturity = "Expert";
  else if (skillStrengthIndex >= 70) skillMaturity = "Advanced";
  else if (skillStrengthIndex >= 50) skillMaturity = "Intermediate";

  return {
    primarySkills,
    secondarySkills,
    coreCompetencies,
    emergingSkills,
    skillDiversity,
    skillStrengthIndex,
    skillCoverageRatio,
    skillMaturity
  };
}

function matchSkillOverlapCount(resume: ParsedResume, job: JobDescription): number {
  const candidateSet = new Set(resume.technicalSkills.map(s => s.toLowerCase()));
  return job.technicalSkills.allTechnicalSkills.filter(req => candidateSet.has(req.toLowerCase())).length;
}

/* ============================================================
   2. SALARY INTELLIGENCE & COMPENSATION ESTIMATOR
============================================================ */

export function calculateSalaryIntelligence(
  resume: ParsedResume,
  job: JobDescription
): { salaryRange: AISalaryIntelligence; expectedDesignation: string; seniorityLevel: string; jobLevel: string } {
  const expYears = resume.totalExperienceYears;
  const baseSalaryMin = job.salary.min > 0 ? job.salary.min : 100000;
  const baseSalaryMax = job.salary.max > 0 ? job.salary.max : 160000;

  // Seniority Math
  let seniorityLevel = "Mid Level";
  let jobLevel = "L4 / IC3";
  let multiplier = 1.0;

  if (expYears >= 10) {
    seniorityLevel = "Executive / Staff";
    jobLevel = "L7 / Principal";
    multiplier = 1.45;
  } else if (expYears >= 7) {
    seniorityLevel = "Lead / Architect";
    jobLevel = "L6 / Staff";
    multiplier = 1.30;
  } else if (expYears >= 4) {
    seniorityLevel = "Senior";
    jobLevel = "L5 / Senior";
    multiplier = 1.15;
  } else if (expYears < 2) {
    seniorityLevel = "Junior";
    jobLevel = "L3 / Junior";
    multiplier = 0.85;
  }

  const estimatedMin = Math.round((baseSalaryMin * multiplier) / 1000) * 1000;
  const estimatedMax = Math.round((baseSalaryMax * multiplier) / 1000) * 1000;

  const currency = job.currency || "USD";
  const formatted = currency === "INR"
    ? `₹${(estimatedMin / 100000).toFixed(1)} LPA - ₹${(estimatedMax / 100000).toFixed(1)} LPA`
    : `$${(estimatedMin / 1000).toFixed(0)}k - $${(estimatedMax / 1000).toFixed(0)}k per year`;

  let marketPosition: "Above Market Rate" | "Market Rate" | "Below Market Rate" = "Market Rate";
  if (multiplier > 1.2) marketPosition = "Above Market Rate";
  else if (multiplier < 0.9) marketPosition = "Below Market Rate";

  const expectedDesignation = `${seniorityLevel} ${job.title.replace(/senior|junior|lead/i, "").trim()}`;

  return {
    salaryRange: {
      min: estimatedMin,
      max: estimatedMax,
      currency,
      formatted,
      marketPosition
    },
    expectedDesignation,
    seniorityLevel,
    jobLevel
  };
}

/* ============================================================
   3. PROBABILITY & RISK MATHEMATICAL ENGINE
============================================================ */

export function calculateHiringProbabilities(
  ats: ATSAnalysisResult,
  semantic: SemanticMatchResult,
  rank: RankedCandidate
): {
  hiringProbability: number;
  interviewProbability: number;
  offerProbability: number;
  confidenceScore: number;
  riskScore: number;
  candidateQuality: "TOP_TIER" | "HIGH_POTENTIAL" | "QUALIFIED" | "NEEDS_UP_SKILLING" | "UNQUALIFIED";
} {
  const overall = rank.overallScore;

  // Interview Probability Math
  const interviewProbability = Math.min(99, Math.max(10, Math.round(overall * 0.94 + 5)));

  // Hiring Probability Math
  const hiringProbability = Math.min(97, Math.max(8, Math.round(overall * 0.90 + (semantic.missingSkills.length === 0 ? 7 : -5))));

  // Offer Probability Math
  const offerProbability = Math.min(95, Math.max(5, Math.round(hiringProbability * 0.88)));

  // Risk Score (0 to 100)
  let riskScore = 15;
  if (semantic.missingSkills.length > 3) riskScore += 25;
  if (ats.experienceBreakdown.detectedGaps.length > 0) riskScore += 15;
  if (rank.experienceScore < 50) riskScore += 20;
  riskScore = Math.min(90, Math.max(5, riskScore));

  const confidenceScore = Number((0.85 + (overall / 100) * 0.12).toFixed(2));

  // Candidate Quality Matrix
  let candidateQuality: "TOP_TIER" | "HIGH_POTENTIAL" | "QUALIFIED" | "NEEDS_UP_SKILLING" | "UNQUALIFIED" = "QUALIFIED";
  if (overall >= 88 && riskScore < 25) candidateQuality = "TOP_TIER";
  else if (overall >= 75) candidateQuality = "HIGH_POTENTIAL";
  else if (overall >= 60) candidateQuality = "QUALIFIED";
  else if (overall >= 45) candidateQuality = "NEEDS_UP_SKILLING";
  else candidateQuality = "UNQUALIFIED";

  return {
    hiringProbability,
    interviewProbability,
    offerProbability,
    confidenceScore,
    riskScore,
    candidateQuality
  };
}

/* ============================================================
   4. MAIN AI ENGINE REPORT GENERATOR ENTRYPOINT
============================================================ */

export function generateAIRecruiterReport(
  resume: ParsedResume,
  job: JobDescription,
  semanticMatch?: SemanticMatchResult,
  atsAnalysis?: ATSAnalysisResult,
  rankedCandidate?: RankedCandidate
): AIRecruiterReport {
  // Step 1: Pre-requisite calculations
  const ats = atsAnalysis || analyzeResumeATS(resume, job.technicalSkills.allTechnicalSkills);
  const semantic = semanticMatch || evaluateSemanticMatch(resume, job);
  const rank = rankedCandidate || calculateCandidateScore(resume, job, semantic);

  // Step 2: Skill & Salary Intelligence
  const skillIntelligence = analyzeSkillIntelligence(resume, job);
  const salaryIntel = calculateSalaryIntelligence(resume, job);

  // Step 3: Probabilities & Risk
  const probabilities = calculateHiringProbabilities(ats, semantic, rank);

  // Step 4: Decision Recommendation Engine
  let recommendation: AIRecommendationDecision = "Reject";
  if (rank.overallScore >= 85 && probabilities.riskScore <= 30) {
    recommendation = "Strong Hire";
  } else if (rank.overallScore >= 72) {
    recommendation = "Hire";
  } else if (rank.overallScore >= 58) {
    recommendation = "Consider";
  } else if (rank.overallScore >= 45) {
    recommendation = "Hold";
  }

  // Step 5: Summaries & Insights Synthesis
  const executiveSummary = `AI Recruiter Evaluation for ${resume.personal.fullName}: Candidate achieved an overall ATS semantic rank score of ${rank.overallScore}/100. Key strengths include ${skillIntelligence.primarySkills.join(", ") || "core technical skills"} with ${resume.totalExperienceYears} years of verified experience. Hiring Recommendation: ${recommendation.toUpperCase()} (Hiring Probability: ${probabilities.hiringProbability}%).`;

  const candidateSummary = `Candidate ${resume.personal.fullName} brings ${resume.totalExperienceYears} years of engineering experience with strong proficiency in ${skillIntelligence.coreCompetencies.join(", ") || "software development"}. Education: ${resume.education[0]?.degree || "Degree"} from ${resume.education[0]?.institution || "Accredited University"}.`;

  const strengths = [
    ...semantic.strengths,
    skillIntelligence.skillMaturity === "Expert" || skillIntelligence.skillMaturity === "Advanced"
      ? `High technical skill maturity (${skillIntelligence.skillMaturity} level).`
      : "",
    resume.projects.length >= 2 ? "Demonstrated project portfolio with technical depth." : ""
  ].filter(Boolean);

  const weaknesses = [
    ...semantic.weaknesses,
    probabilities.riskScore > 40 ? "Elevated hiring risk score due to skill gaps or career transition." : ""
  ].filter(Boolean);

  const missingSkills = semantic.missingSkills;

  const skillGapAnalysis = missingSkills.map(skill =>
    `Gap: Lacks verified experience in ${skill}. Recommendation: Evaluate in technical interview round.`
  );

  const learningRecommendations = missingSkills.slice(0, 3).map(skill =>
    `Complete hands-on course / certification in ${skill}.`
  );

  const resumeRecommendations = [
    ...ats.improvementSuggestions,
    "Ensure all technical project descriptions highlight quantifiable business metrics."
  ];

  const careerRecommendations = [
    `Target senior designations like ${salaryIntel.expectedDesignation}.`,
    "Focus project contributions on distributed systems and enterprise architecture."
  ];

  const recruiterNotes = [
    ...rank.recruiterNotes,
    `AI Risk Assessment Score: ${probabilities.riskScore}/100`,
    `Estimated Compensation Band: ${salaryIntel.salaryRange.formatted}`
  ];

  const interviewFocusAreas = [
    `System Design & Architecture for ${skillIntelligence.primarySkills[0] || "Backend Systems"}`,
    `Hands-on coding exercise involving ${skillIntelligence.primarySkills[1] || "Algorithms"}`,
    "Deep-dive into project architecture and trade-offs made in previous roles"
  ];

  const technicalTopics = [
    ...skillIntelligence.primarySkills,
    ...skillIntelligence.secondarySkills
  ].slice(0, 6);

  const behavioralTopics = [
    "Conflict resolution and cross-functional team collaboration",
    "Managing project deadlines and handling production incidents",
    "Mentoring junior engineers and code review culture"
  ];

  const leadershipTopics = [
    "Technical decision making under tight constraints",
    "Ownership of end-to-end feature delivery",
    "Architectural governance and technology selection"
  ];

  const riskFactors = [
    ...(probabilities.riskScore > 30 ? [`Risk Score ${probabilities.riskScore}/100`] : []),
    ...weaknesses.slice(0, 2)
  ];

  const positiveIndicators = [
    `ATS Score: ${ats.overallScore}%`,
    `Semantic Match: ${semantic.overallMatch}%`,
    `Verified Experience: ${resume.totalExperienceYears} Years`
  ];

  return {
    executiveSummary,
    candidateSummary,
    strengths,
    weaknesses,
    missingSkills,
    skillGapAnalysis,
    improvementSuggestions: ats.improvementSuggestions,
    careerRecommendations,
    learningRecommendations,
    resumeRecommendations,

    recruiterNotes,
    interviewFocusAreas,
    technicalTopics,
    behavioralTopics,
    leadershipTopics,
    riskFactors,
    positiveIndicators,

    salaryRange: salaryIntel.salaryRange,
    expectedDesignation: salaryIntel.expectedDesignation,
    seniorityLevel: salaryIntel.seniorityLevel,
    jobLevel: salaryIntel.jobLevel,
    marketPosition: salaryIntel.salaryRange.marketPosition,

    candidateQuality: probabilities.candidateQuality,
    resumeQuality: ats.resumeQuality,
    hiringProbability: probabilities.hiringProbability,
    interviewProbability: probabilities.interviewProbability,
    offerProbability: probabilities.offerProbability,
    confidenceScore: probabilities.confidenceScore,
    riskScore: probabilities.riskScore,
    recommendation,

    skillIntelligence
  };
}

export default generateAIRecruiterReport;
