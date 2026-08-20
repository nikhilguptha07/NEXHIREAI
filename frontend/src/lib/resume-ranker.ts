import { ParsedResume } from "./resume-parser";
import { JobDescription } from "./job-parser";
import { SemanticMatchResult, evaluateSemanticMatch } from "./semantic-matcher";
import { analyzeResumeATS } from "./ats-analyzer";

/* ============================================================
   ENTERPRISE RESUME RANKER INTERFACES
============================================================ */

export interface RankingWeights {
  atsScoreWeight: number;        // Default 0.15
  semanticMatchWeight: number;   // Default 0.25
  technicalSkillsWeight: number; // Default 0.20
  experienceWeight: number;      // Default 0.15
  educationWeight: number;       // Default 0.08
  projectsWeight: number;        // Default 0.07
  certificationsWeight: number;  // Default 0.05
  resumeQualityWeight: number;   // Default 0.05
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  atsScoreWeight: 0.15,
  semanticMatchWeight: 0.25,
  technicalSkillsWeight: 0.20,
  experienceWeight: 0.15,
  educationWeight: 0.08,
  projectsWeight: 0.07,
  certificationsWeight: 0.05,
  resumeQualityWeight: 0.05
};

export interface RankingFilterOptions {
  minATSScore?: number;
  minExperienceYears?: number;
  location?: string;
  requiredSkills?: string[];
  minEducationDegree?: string;
  workMode?: string;
  maxNoticePeriodDays?: number;
  maxSalaryBudget?: number;
}

export type RankingSortOption =
  | "overallScore"
  | "atsScore"
  | "semanticMatch"
  | "experience"
  | "projects"
  | "education"
  | "interviewProbability"
  | "hiringProbability";

export interface RankedCandidate {
  candidateId: string;
  candidateName: string;
  overallRank: number;
  overallScore: number;
  atsScore: number;
  semanticScore: number;
  technicalScore: number;
  experienceScore: number;
  educationScore: number;
  projectScore: number;
  certificationScore: number;
  resumeQuality: string;
  hiringProbability: number;
  interviewProbability: number;

  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  rankingReason: string;
  recommendation: string;
  recruiterNotes: string[];

  resume: ParsedResume;
  semanticMatch: SemanticMatchResult;
}

export interface RankingStatistics {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalCandidates: number;
  eligibleCandidates: number;
}

export interface RankingBatchResult {
  rankedCandidates: RankedCandidate[];
  topCandidate: RankedCandidate | null;
  topFive: RankedCandidate[];
  topTen: RankedCandidate[];
  statistics: RankingStatistics;
}

/* ============================================================
   1. INDIVIDUAL CANDIDATE RANKING SCORE EVALUATOR
============================================================ */

export function calculateCandidateScore(
  resume: ParsedResume,
  job: JobDescription,
  semanticMatch?: SemanticMatchResult,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): RankedCandidate {
  const candidateId = resume.fileName.replace(/\.[^/.]+$/, "") + "_" + Math.abs(resume.rawText.length * 31);
  const candidateName = resume.personal.fullName || "Candidate";

  // Run ATS Analyzer & Semantic Matcher if not pre-computed
  const atsResult = analyzeResumeATS(resume, job.technicalSkills.allTechnicalSkills);
  const matchResult = semanticMatch || evaluateSemanticMatch(resume, job);

  const atsScore = atsResult.overallScore;
  const semanticScore = matchResult.overallMatch;
  const technicalScore = matchResult.skillMatch;
  const experienceScore = matchResult.experienceMatch;
  const educationScore = matchResult.educationMatch;
  const projectScore = matchResult.projectMatch;
  const certificationScore = matchResult.certificationMatch;

  // Convert Resume Quality to numerical value (0 to 100)
  let qualityNum = 70;
  if (atsResult.resumeQuality === "EXCELLENT") qualityNum = 95;
  else if (atsResult.resumeQuality === "GOOD") qualityNum = 82;
  else if (atsResult.resumeQuality === "AVERAGE") qualityNum = 65;
  else if (atsResult.resumeQuality === "NEEDS_IMPROVEMENT") qualityNum = 50;
  else if (atsResult.resumeQuality === "POOR") qualityNum = 35;

  // Normalize Weights to sum = 1.0
  const totalWeight =
    weights.atsScoreWeight +
    weights.semanticMatchWeight +
    weights.technicalSkillsWeight +
    weights.experienceWeight +
    weights.educationWeight +
    weights.projectsWeight +
    weights.certificationsWeight +
    weights.resumeQualityWeight;

  const wATS = weights.atsScoreWeight / totalWeight;
  const wSem = weights.semanticMatchWeight / totalWeight;
  const wTech = weights.technicalSkillsWeight / totalWeight;
  const wExp = weights.experienceWeight / totalWeight;
  const wEdu = weights.educationWeight / totalWeight;
  const wProj = weights.projectsWeight / totalWeight;
  const wCert = weights.certificationsWeight / totalWeight;
  const wQual = weights.resumeQualityWeight / totalWeight;

  // Weighted Overall Ranking Score Formula
  const overallScoreCalculated =
    atsScore * wATS +
    semanticScore * wSem +
    technicalScore * wTech +
    experienceScore * wExp +
    educationScore * wEdu +
    projectScore * wProj +
    certificationScore * wCert +
    qualityNum * wQual;

  const overallScore = Math.min(100, Math.max(0, Math.round(overallScoreCalculated)));

  // Generate Ranking Reason
  let rankingReason = "";
  if (overallScore >= 85) {
    rankingReason = "Top-tier alignment across technical stack, work experience, and ATS keyword density.";
  } else if (overallScore >= 70) {
    rankingReason = "Solid candidate match with strong core competencies and minor skill gaps.";
  } else if (overallScore >= 55) {
    rankingReason = "Moderate fit. Candidate meets baseline requirements but has notable skill or experience shortfalls.";
  } else {
    rankingReason = "Below threshold match. Substantial missing skills or experience shortfalls.";
  }

  // Synthesize Recruiter Notes
  const recruiterNotes: string[] = [
    `ATS Quality Score: ${atsScore}/100 (${atsResult.resumeQuality})`,
    `Semantic Match Score: ${semanticScore}/100`,
    `Matched ${matchResult.matchedSkills.length} required skills (${matchResult.missingSkills.length} missing)`,
    `Experience: ${resume.totalExperienceYears} years candidate vs ${job.experience.minimumYears} years required`,
    `Ranking Recommendation: ${matchResult.recommendation.replace("_", " ")}`
  ];

  return {
    candidateId,
    candidateName,
    overallRank: 1, // Will be updated during batch sorting
    overallScore,
    atsScore,
    semanticScore,
    technicalScore,
    experienceScore,
    educationScore,
    projectScore,
    certificationScore,
    resumeQuality: atsResult.resumeQuality,
    hiringProbability: matchResult.hiringProbability,
    interviewProbability: matchResult.interviewProbability,

    strengths: matchResult.strengths,
    weaknesses: matchResult.weaknesses,
    missingSkills: matchResult.missingSkills,
    rankingReason,
    recommendation: matchResult.recommendation,
    recruiterNotes,

    resume,
    semanticMatch: matchResult
  };
}

/* ============================================================
   2. TIE-BREAKING ALGORITHM
============================================================ */

export function compareCandidatesWithTieBreaking(
  a: RankedCandidate,
  b: RankedCandidate
): number {
  // 0. Primary Sort: Overall Score (Descending)
  if (b.overallScore !== a.overallScore) {
    return b.overallScore - a.overallScore;
  }

  // Tie-breaker 1: Semantic Match
  if (b.semanticScore !== a.semanticScore) {
    return b.semanticScore - a.semanticScore;
  }

  // Tie-breaker 2: ATS Score
  if (b.atsScore !== a.atsScore) {
    return b.atsScore - a.atsScore;
  }

  // Tie-breaker 3: Experience Score
  if (b.experienceScore !== a.experienceScore) {
    return b.experienceScore - a.experienceScore;
  }

  // Tie-breaker 4: Technical Skills Score
  if (b.technicalScore !== a.technicalScore) {
    return b.technicalScore - a.technicalScore;
  }

  // Tie-breaker 5: Project Score
  if (b.projectScore !== a.projectScore) {
    return b.projectScore - a.projectScore;
  }

  // Tie-breaker 6: Education Score
  if (b.educationScore !== a.educationScore) {
    return b.educationScore - a.educationScore;
  }

  // Tie-breaker 7: Certification Score
  return b.certificationScore - a.certificationScore;
}

/* ============================================================
   3. FILTERING & SORTING PIPELINE
============================================================ */

export function filterCandidates(
  candidates: RankedCandidate[],
  options?: RankingFilterOptions
): RankedCandidate[] {
  if (!options) return candidates;

  return candidates.filter(c => {
    if (options.minATSScore !== undefined && c.atsScore < options.minATSScore) {
      return false;
    }
    if (options.minExperienceYears !== undefined && c.resume.totalExperienceYears < options.minExperienceYears) {
      return false;
    }
    if (options.location && !c.resume.personal.address.toLowerCase().includes(options.location.toLowerCase())) {
      return false;
    }
    if (options.requiredSkills && options.requiredSkills.length > 0) {
      const candidateSkillSet = new Set(c.resume.technicalSkills.map(s => s.toLowerCase()));
      const hasAllRequired = options.requiredSkills.every(req => candidateSkillSet.has(req.toLowerCase()));
      if (!hasAllRequired) return false;
    }
    return true;
  });
}

export function sortCandidatesByCriterion(
  candidates: RankedCandidate[],
  criterion: RankingSortOption = "overallScore"
): RankedCandidate[] {
  const sorted = [...candidates];

  sorted.sort((a, b) => {
    switch (criterion) {
      case "atsScore":
        return b.atsScore - a.atsScore;
      case "semanticMatch":
        return b.semanticScore - a.semanticScore;
      case "experience":
        return b.experienceScore - a.experienceScore;
      case "projects":
        return b.projectScore - a.projectScore;
      case "education":
        return b.educationScore - a.educationScore;
      case "interviewProbability":
        return b.interviewProbability - a.interviewProbability;
      case "hiringProbability":
        return b.hiringProbability - a.hiringProbability;
      case "overallScore":
      default:
        return compareCandidatesWithTieBreaking(a, b);
    }
  });

  return sorted;
}

/* ============================================================
   4. MAIN BATCH RESUME RANKER ENTRYPOINT
============================================================ */

export function rankResumes(
  resumes: ParsedResume[],
  job: JobDescription,
  precomputedMatches?: SemanticMatchResult[],
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS,
  filterOptions?: RankingFilterOptions,
  sortBy: RankingSortOption = "overallScore"
): RankingBatchResult {
  if (!resumes || resumes.length === 0) {
    return {
      rankedCandidates: [],
      topCandidate: null,
      topFive: [],
      topTen: [],
      statistics: {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalCandidates: 0,
        eligibleCandidates: 0
      }
    };
  }

  // Step 1: Calculate Score for Each Candidate
  const evaluatedCandidates: RankedCandidate[] = resumes.map((resume, idx) => {
    const precomputed = precomputedMatches?.[idx];
    return calculateCandidateScore(resume, job, precomputed, weights);
  });

  // Step 2: Apply Filters
  const filteredCandidates = filterCandidates(evaluatedCandidates, filterOptions);

  // Step 3: Sort Candidates (with Tie Breaking)
  const sortedCandidates = sortCandidatesByCriterion(filteredCandidates, sortBy);

  // Step 4: Assign Sequential Overall Ranks
  sortedCandidates.forEach((c, idx) => {
    c.overallRank = idx + 1;
  });

  // Step 5: Compute Batch Statistics
  const scores = sortedCandidates.map(c => c.overallScore);
  const totalCandidates = resumes.length;
  const eligibleCandidates = sortedCandidates.length;

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const averageScore = scores.length > 0
    ? Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1))
    : 0;

  const topCandidate = sortedCandidates[0] || null;
  const topFive = sortedCandidates.slice(0, 5);
  const topTen = sortedCandidates.slice(0, 10);

  return {
    rankedCandidates: sortedCandidates,
    topCandidate,
    topFive,
    topTen,
    statistics: {
      averageScore,
      highestScore,
      lowestScore,
      totalCandidates,
      eligibleCandidates
    }
  };
}

export default rankResumes;
