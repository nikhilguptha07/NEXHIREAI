import {
  ParsedResume,
  parseResumeDocument,
  extractTextFromFile,
  DEFAULT_JOB_SKILLS
} from "./resume-parser";

import {
  ATSAnalysisResult,
  analyzeResumeATS
} from "./ats-analyzer";

import {
  JobDescription,
  parseJobDescription
} from "./job-parser";

import {
  SemanticMatchResult,
  evaluateSemanticMatch
} from "./semantic-matcher";

import {
  RankedCandidate,
  RankingBatchResult,
  calculateCandidateScore,
  rankResumes,
  RankingWeights,
  RankingFilterOptions,
  RankingSortOption
} from "./resume-ranker";

import {
  AIRecruiterReport,
  generateAIRecruiterReport
} from "./ai-engine";

import {
  OCRResult,
  processDocumentOCR
} from "./ocr-parser";

/* ============================================================
   ENTERPRISE RESUME INTELLIGENCE SERVICE INTERFACES
============================================================ */

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

export interface ResumeSourceMetadata {
  fileName: string;
  fileSize: string;
  rawText: string;
  ocrUsed: boolean;
  ocrConfidence: number;
  detectedFormat: string;
}

export interface PipelineMetadata {
  processedAt: string;
  pipelineVersion: string;
  totalProcessingTimeMs: number;
  moduleTimingsMs: Record<string, number>;
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  errors: string[];
}

export interface CandidateIntelligenceObject {
  candidate: CandidateProfile;
  resume: ResumeSourceMetadata;
  parsedResume: ParsedResume;
  atsAnalysis: ATSAnalysisResult;
  jobDescription: JobDescription;
  semanticMatch: SemanticMatchResult;
  ranking: RankedCandidate;
  aiReport: AIRecruiterReport;
  metadata: PipelineMetadata;
  processingTime: number;
  version: string;
}

export interface ProcessResumeOptions {
  jobDescriptionText?: string;
  requiredSkills?: string[];
  rankingWeights?: RankingWeights;
  maxFileSizeBytes?: number; // Default 15MB
}

/* ============================================================
   FILE VALIDATION ENGINE
============================================================ */

const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "png", "jpg", "jpeg", "tiff", "bmp", "webp"];

export function validateResumeFile(file: File, maxFileSizeBytes: number = 15 * 1024 * 1024): void {
  if (!file) {
    throw new Error("Validation Error: File object is required.");
  }

  if (file.size > maxFileSizeBytes) {
    throw new Error(`Validation Error: File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of ${(maxFileSizeBytes / (1024 * 1024)).toFixed(2)} MB.`);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(`Validation Error: File format '.${extension}' is unsupported. Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}.`);
  }
}

/* ============================================================
   MAIN PIPELINE ORCHESTRATOR
============================================================ */

export async function processResumePipeline(
  file: File,
  options: ProcessResumeOptions = {}
): Promise<CandidateIntelligenceObject> {
  const startTime = Date.now();
  const moduleTimingsMs: Record<string, number> = {};
  const pipelineErrors: string[] = [];

  // Step 1: File Validation
  const t0 = Date.now();
  validateResumeFile(file, options.maxFileSizeBytes);
  moduleTimingsMs["fileValidation"] = Date.now() - t0;

  // Step 2: Initial Text Extraction & OCR Processing
  const t1 = Date.now();
  let rawText = "";
  try {
    rawText = await extractTextFromFile(file);
  } catch (err) {
    pipelineErrors.push(`Text Extraction Warning: ${(err as Error).message}`);
  }

  const ocrResult: OCRResult = await processDocumentOCR(file, rawText);
  rawText = ocrResult.text;
  moduleTimingsMs["ocrExtraction"] = Date.now() - t1;

  if (!rawText || !rawText.trim()) {
    throw new Error("Processing Error: Unable to extract readable text from document. File may be encrypted or corrupted.");
  }

  // Step 3: Job Description Parsing
  const t2 = Date.now();
  const defaultJDText = `Senior Software Engineer Position. Required Skills: ${options.requiredSkills?.join(", ") || DEFAULT_JOB_SKILLS.join(", ")}. Minimum 3+ years experience.`;
  const jdInputText = options.jobDescriptionText || defaultJDText;
  const jobDescription: JobDescription = parseJobDescription(jdInputText);
  moduleTimingsMs["jobParsing"] = Date.now() - t2;

  // Step 4: Resume Parsing
  const t3 = Date.now();
  const parsedResume: ParsedResume = await parseResumeDocument(
    file,
    options.requiredSkills || jobDescription.technicalSkills.allTechnicalSkills,
    jobDescription.rawText
  );
  parsedResume.rawText = rawText; // Ensure OCR-enhanced text is bound
  moduleTimingsMs["resumeParsing"] = Date.now() - t3;

  // Step 5: ATS Analysis
  const t4 = Date.now();
  const atsAnalysis: ATSAnalysisResult = analyzeResumeATS(
    parsedResume,
    jobDescription.technicalSkills.allTechnicalSkills
  );
  moduleTimingsMs["atsAnalysis"] = Date.now() - t4;

  // Step 6: Semantic Matching
  const t5 = Date.now();
  const semanticMatch: SemanticMatchResult = evaluateSemanticMatch(
    parsedResume,
    jobDescription
  );
  moduleTimingsMs["semanticMatching"] = Date.now() - t5;

  // Step 7: Resume Ranking
  const t6 = Date.now();
  const ranking: RankedCandidate = calculateCandidateScore(
    parsedResume,
    jobDescription,
    semanticMatch,
    options.rankingWeights
  );
  moduleTimingsMs["resumeRanking"] = Date.now() - t6;

  // Step 8: AI Engine Analysis & Recruiter Report
  const t7 = Date.now();
  const aiReport: AIRecruiterReport = generateAIRecruiterReport(
    parsedResume,
    jobDescription,
    semanticMatch,
    atsAnalysis,
    ranking
  );
  moduleTimingsMs["aiEngine"] = Date.now() - t7;

  // Step 9: Candidate & Metadata Packaging
  const totalProcessingTimeMs = Date.now() - startTime;

  const candidate: CandidateProfile = {
    id: ranking.candidateId,
    name: parsedResume.personal.fullName || "Candidate Name",
    email: parsedResume.personal.email || "",
    phone: parsedResume.personal.phone || "",
    address: parsedResume.personal.address || "",
    linkedIn: parsedResume.personal.linkedIn || "",
    github: parsedResume.personal.github || "",
    portfolio: parsedResume.personal.portfolio || ""
  };

  const resumeMetadata: ResumeSourceMetadata = {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    rawText,
    ocrUsed: ocrResult.ocrUsed,
    ocrConfidence: ocrResult.confidence,
    detectedFormat: ocrResult.detectedFormat
  };

  const metadata: PipelineMetadata = {
    processedAt: new Date().toISOString(),
    pipelineVersion: "1.0.0-ENTERPRISE",
    totalProcessingTimeMs,
    moduleTimingsMs,
    status: pipelineErrors.length === 0 ? "SUCCESS" : "PARTIAL_SUCCESS",
    errors: pipelineErrors
  };

  return {
    candidate,
    resume: resumeMetadata,
    parsedResume,
    atsAnalysis,
    jobDescription,
    semanticMatch,
    ranking,
    aiReport,
    metadata,
    processingTime: totalProcessingTimeMs,
    version: "1.0.0-ENTERPRISE"
  };
}

/* ============================================================
   BATCH RESUME PROCESSING PIPELINE
============================================================ */

export async function processBatchResumePipeline(
  files: File[],
  jobDescriptionText: string,
  rankingWeights?: RankingWeights,
  filterOptions?: RankingFilterOptions,
  sortBy: RankingSortOption = "overallScore"
): Promise<{
  results: CandidateIntelligenceObject[];
  batchRanking: RankingBatchResult;
  processingTimeMs: number;
}> {
  const startTime = Date.now();

  if (!files || files.length === 0) {
    throw new Error("Batch Error: At least one resume file must be provided.");
  }

  // Parse Job Description once for the entire batch
  const jobDescription = parseJobDescription(jobDescriptionText);

  // Process all resumes concurrently
  const candidateObjects: CandidateIntelligenceObject[] = await Promise.all(
    files.map(file =>
      processResumePipeline(file, {
        jobDescriptionText,
        rankingWeights
      })
    )
  );

  const parsedResumes = candidateObjects.map(c => c.parsedResume);
  const semanticMatches = candidateObjects.map(c => c.semanticMatch);

  // Rank full candidate pool together
  const batchRanking = rankResumes(
    parsedResumes,
    jobDescription,
    semanticMatches,
    rankingWeights,
    filterOptions,
    sortBy
  );

  const processingTimeMs = Date.now() - startTime;

  return {
    results: candidateObjects,
    batchRanking,
    processingTimeMs
  };
}

export default processResumePipeline;
