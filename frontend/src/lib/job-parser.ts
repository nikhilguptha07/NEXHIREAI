/* ============================================================
   ENTERPRISE JOB DESCRIPTION PARSER (job-parser.ts)
   Enterprise ATS Engine: Workday, Oracle Recruiting, Greenhouse
============================================================ */

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Freelance"
  | "Temporary";

export type WorkMode = "Remote" | "Hybrid" | "On-site";

export type SeniorityLevel =
  | "Intern"
  | "Junior"
  | "Associate"
  | "Mid Level"
  | "Senior"
  | "Lead"
  | "Principal"
  | "Architect"
  | "Manager"
  | "Director"
  | "VP";

export type HiringDifficultyLevel = "Low" | "Medium" | "High" | "Very High";

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  formatted: string;
}

export interface ExperienceRequirement {
  minimumYears: number;
  maximumYears: number;
  preferredYears: number;
  description: string;
}

export interface EducationRequirement {
  requiredDegree: string;
  preferredDegree: string;
  requiredBranch: string;
  preferredBranch: string;
}

export interface CategorizedTechnicalSkills {
  languages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  cloudPlatforms: string[];
  devops: string[];
  operatingSystems: string[];
  versionControl: string[];
  testingFrameworks: string[];
  tools: string[];
  aiFrameworks: string[];
  mlLibraries: string[];
  bigData: string[];
  dataEngineering: string[];
  backend: string[];
  frontend: string[];
  mobile: string[];
  security: string[];
  networking: string[];
  allTechnicalSkills: string[];
}

export interface SoftSkillsBreakdown {
  leadership: boolean;
  communication: boolean;
  presentation: boolean;
  criticalThinking: boolean;
  problemSolving: boolean;
  mentoring: boolean;
  decisionMaking: boolean;
  collaboration: boolean;
  teamwork: boolean;
  timeManagement: boolean;
  allSoftSkills: string[];
}

export interface QualificationsBreakdown {
  mandatoryQualifications: string[];
  preferredQualifications: string[];
  niceToHaveSkills: string[];
}

export interface BenefitsBreakdown {
  benefitsList: string[];
  insurance: boolean;
  hybrid: boolean;
  remote: boolean;
  bonus: boolean;
  paidLeave: boolean;
  stockOptions: boolean;
  learningBudget: boolean;
}

export interface JobDescription {
  title: string;
  company: string;
  department: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salary: SalaryRange;
  currency: string;
  shift: string;
  noticePeriod: string;

  experience: ExperienceRequirement;
  education: EducationRequirement;

  technicalSkills: CategorizedTechnicalSkills;
  softSkills: SoftSkillsBreakdown;

  responsibilities: string[];
  qualifications: QualificationsBreakdown;
  benefits: BenefitsBreakdown;

  mandatorySkills: string[];
  optionalSkills: string[];
  primaryKeywords: string[];
  secondaryKeywords: string[];

  keywordDensity: Record<string, number>;
  keywordFrequency: Record<string, number>;
  keywordWeight: Record<string, number>;
  repeatedKeywords: string[];

  seniority: SeniorityLevel;
  jobComplexity: number;
  hiringDifficulty: HiringDifficultyLevel;
  skillDiversity: number;
  expectedCandidateLevel: string;
  prioritySkills: string[];
  criticalSkills: string[];

  rawText: string;
}

/* ============================================================
   NORMALIZATION DICTIONARY
============================================================ */

const SKILL_NORMALIZATION_MAP: Record<string, string> = {
  "reactjs": "React",
  "react.js": "React",
  "react": "React",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "node": "Node.js",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "springboot": "Spring Boot",
  "spring-boot": "Spring Boot",
  "dotnet": ".NET",
  ".net": ".NET",
  "net core": ".NET Core",
  "ms sql": "SQL Server",
  "mssql": "SQL Server",
  "sql server": "SQL Server",
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "GCP",
  "google cloud": "GCP",
  "azure": "Azure",
  "k8s": "Kubernetes",
  "kubernetes": "Kubernetes",
  "docker": "Docker",
  "vuejs": "Vue.js",
  "vue.js": "Vue.js",
  "angularjs": "Angular",
  "angular.js": "Angular",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "python3": "Python",
  "python": "Python",
  "java21": "Java",
  "java": "Java",
  "oracle 23ai": "Oracle Database 23ai",
  "oracle db": "Oracle",
  "oracle": "Oracle"
};

export function normalizeSkill(skill: string): string {
  const lower = skill.trim().toLowerCase();
  return SKILL_NORMALIZATION_MAP[lower] || skill.trim();
}

/* ============================================================
   TAXONOMY DICTIONARIES
============================================================ */

const TAXONOMY = {
  languages: ["Java", "Python", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Golang", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "Dart", "SQL", "PL/SQL", "HTML", "CSS"],
  frameworks: ["React", "Next.js", "Angular", "Vue.js", "Express", "NestJS", "Spring Boot", "Spring", "Django", "Flask", "FastAPI", "ASP.NET", ".NET", "Laravel", "Ruby on Rails"],
  libraries: ["Redux", "Zustand", "RxJS", "Pandas", "NumPy", "Scikit-Learn", "SciPy", "Lodash", "Axios", "jQuery"],
  databases: ["Oracle", "Oracle Database 23ai", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Cassandra", "Elasticsearch", "DynamoDB", "Firebase", "SQLite", "Neo4j", "ClickHouse"],
  cloudPlatforms: ["AWS", "Azure", "GCP", "Cloudflare", "Heroku", "DigitalOcean", "OpenShift", "Vercel"],
  devops: ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", "Ansible", "Helm", "ArgoCD", "Prometheus", "Grafana", "Nginx"],
  operatingSystems: ["Linux", "Ubuntu", "Debian", "CentOS", "RedHat", "RHEL", "Windows", "macOS", "Unix"],
  versionControl: ["Git", "GitHub", "GitLab", "Bitbucket"],
  testingFrameworks: ["JUnit", "Mockito", "Jest", "Cypress", "Playwright", "Selenium", "Postman", "PyTest"],
  tools: ["Jira", "Confluence", "Postman", "Swagger", "Maven", "Gradle", "Webpack", "Vite"],
  aiFrameworks: ["TensorFlow", "PyTorch", "Keras", "Hugging Face", "LangChain", "LlamaIndex", "OpenAI"],
  mlLibraries: ["Scikit-Learn", "XGBoost", "LightGBM", "OpenCV", "NLTK", "SpaCy"],
  bigData: ["Spark", "Hadoop", "Kafka", "Flink", "Hive", "Airflow"],
  dataEngineering: ["ETL", "Snowflake", "Databricks", "dbt", "Airflow", "Spark"],
  backend: ["Spring Boot", "Node.js", "Express", "NestJS", "Django", "FastAPI", "Microservices", "REST API", "GraphQL", "gRPC"],
  frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "Redux", "Vue.js"],
  mobile: ["React Native", "Flutter", "Android", "iOS", "Swift", "Kotlin"],
  security: ["OAuth2", "JWT", "Spring Security", "TLS", "SSL", "SSO", "IAM", "OWASP"],
  networking: ["TCP/IP", "DNS", "HTTP/HTTPS", "Load Balancer", "VPC", "CDN"]
};

/* ============================================================
   SOFT SKILLS DICTIONARY
============================================================ */

const SOFT_SKILLS_KEYWORDS: Record<keyof Omit<SoftSkillsBreakdown, "allSoftSkills">, string[]> = {
  leadership: ["leadership", "lead", "spearhead", "guide", "mentor", "direction"],
  communication: ["communication", "verbal", "written", "articulate", "interpersonal"],
  presentation: ["presentation", "present", "demo", "stakeholder presentation"],
  criticalThinking: ["critical thinking", "analytical", "reasoning", "problem evaluation"],
  problemSolving: ["problem solving", "troubleshoot", "debugging", "analytical mindset"],
  mentoring: ["mentoring", "mentor", "coaching", "upskilling", "guidance"],
  decisionMaking: ["decision making", "decisive", "trade-offs", "judgment"],
  collaboration: ["collaboration", "cross-functional", "partnering", "cooperation"],
  teamwork: ["teamwork", "team player", "collaborative team"],
  timeManagement: ["time management", "prioritization", "deadline", "fast-paced"]
};

/* ============================================================
   1. BASIC INFORMATION EXTRACTION
============================================================ */

export function extractJobTitle(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Check explicit title patterns
  const titleRegex = /(?:job title|role|position|opening)[:\s]+([A-Za-z0-9\s/,-]+)/i;
  for (const line of lines.slice(0, 10)) {
    const match = line.match(titleRegex);
    if (match && match[1] && match[1].length > 3) {
      return match[1].trim();
    }
  }

  // Heuristic top line extraction
  const roleRegex = /(Software Engineer|Full Stack Developer|Backend Engineer|Frontend Engineer|Data Scientist|DevOps Engineer|Architect|Product Manager|Engineering Manager|System Administrator|AI Engineer)/i;
  for (const line of lines.slice(0, 8)) {
    const match = line.match(roleRegex);
    if (match) return line.replace(/^(hiring|looking for|we are hiring)\s+/i, "").trim();
  }

  return lines[0]?.slice(0, 50) || "Senior Software Engineer";
}

export function extractCompany(text: string): string {
  const match = text.match(/(?:at|company|organization|client)[:\s]+([A-Z][A-Za-z0-9\s.,&-]+)/i) ||
                text.match(/([A-Z][A-Za-z0-9&]+(?:\s+[A-Z][A-Za-z0-9&]+)?)\s+(?:is hiring|is looking|inc|llc|tech|corp|pvt ltd)/i);
  return match?.[1]?.trim() ?? "Enterprise Client";
}

export function extractWorkMode(text: string): WorkMode {
  const lower = text.toLowerCase();
  if (lower.includes("remote") || lower.includes("work from home") || lower.includes("wfh")) return "Remote";
  if (lower.includes("hybrid") || lower.includes("flexible location")) return "Hybrid";
  return "On-site";
}

export function extractEmploymentType(text: string): EmploymentType {
  const lower = text.toLowerCase();
  if (lower.includes("part-time") || lower.includes("part time")) return "Part-time";
  if (lower.includes("contract") || lower.includes("contractor") || lower.includes("freelance")) return "Contract";
  if (lower.includes("intern") || lower.includes("internship")) return "Internship";
  return "Full-time";
}

export function extractSalary(text: string): SalaryRange {
  const salaryRegex = /(?:salary|ctc|package|pay)[:\s]*([$₹€£]?\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|lakh|lakhs|l|m|per year|pa|a year)?\s*(?:-|to)\s*[$₹€£]?\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|lakh|lakhs|l|m|per year|pa|a year)?)/i;
  const match = text.match(salaryRegex);

  if (match && match[1]) {
    const numbers = match[1].match(/\d+(?:,\d+)*/g)?.map(n => parseInt(n.replace(/,/g, ""), 10)) || [];
    const min = numbers[0] || 120000;
    const max = numbers[1] || numbers[0] || 180000;
    return {
      min: min > 1000 ? min : min * 100000,
      max: max > 1000 ? max : max * 100000,
      currency: match[1].includes("₹") ? "INR" : "USD",
      formatted: match[1].trim()
    };
  }

  return {
    min: 100000,
    max: 160000,
    currency: "USD",
    formatted: "$100,000 - $160,000 per year"
  };
}

export function extractLocation(text: string): string {
  const locMatch = text.match(/(?:location|city|job location|office)[:\s]+([A-Za-z\s.,-]+)/i) ||
                   text.match(/\b(Bangalore|Bengaluru|San Francisco|New York|Austin|Seattle|London|Hyderabad|Pune|Delhi|Remote)\b/i);
  return locMatch?.[1]?.trim() ?? "Remote / Hybrid";
}

/* ============================================================
   2. EXPERIENCE & EDUCATION EXTRACTION
============================================================ */

export function extractExperienceRequirements(text: string): ExperienceRequirement {
  const expRegex = /(\d+)\s*(?:-|to)\s*(\d+)\s*\+?\s*years/i;
  const minRegex = /(\d+)\+\s*years/i;
  const singleRegex = /at least\s*(\d+)\s*years/i;

  let min = 3;
  let max = 7;

  const matchRange = text.match(expRegex);
  if (matchRange && matchRange[1] && matchRange[2]) {
    min = parseInt(matchRange[1], 10);
    max = parseInt(matchRange[2], 10);
  } else {
    const matchMin = text.match(minRegex) || text.match(singleRegex);
    if (matchMin && matchMin[1]) {
      min = parseInt(matchMin[1], 10);
      max = min + 4;
    }
  }

  return {
    minimumYears: min,
    maximumYears: max,
    preferredYears: min + 2,
    description: `${min}+ years of software development experience`
  };
}

export function extractEducationRequirements(text: string): EducationRequirement {
  const lower = text.toLowerCase();
  let requiredDegree = "Bachelor's Degree";
  let preferredDegree = "Master's Degree";

  if (lower.includes("phd") || lower.includes("doctorate")) {
    requiredDegree = "Ph.D.";
  } else if (lower.includes("master") || lower.includes("m.tech") || lower.includes("m.s")) {
    requiredDegree = "Master's Degree";
    preferredDegree = "Ph.D.";
  }

  return {
    requiredDegree,
    preferredDegree,
    requiredBranch: "Computer Science, Software Engineering, or related technical field",
    preferredBranch: "Computer Science & Artificial Intelligence"
  };
}

/* ============================================================
   3. TECHNICAL SKILLS & SOFT SKILLS PARSING
============================================================ */

export function extractCategorizedTechnicalSkills(text: string): CategorizedTechnicalSkills {
  const textLower = text.toLowerCase();
  
  const extractCategory = (keywords: string[]) => {
    const result: string[] = [];
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(textLower)) {
        result.push(normalizeSkill(kw));
      }
    }
    return Array.from(new Set(result));
  };

  const languages = extractCategory(TAXONOMY.languages);
  const frameworks = extractCategory(TAXONOMY.frameworks);
  const libraries = extractCategory(TAXONOMY.libraries);
  const databases = extractCategory(TAXONOMY.databases);
  const cloudPlatforms = extractCategory(TAXONOMY.cloudPlatforms);
  const devops = extractCategory(TAXONOMY.devops);
  const operatingSystems = extractCategory(TAXONOMY.operatingSystems);
  const versionControl = extractCategory(TAXONOMY.versionControl);
  const testingFrameworks = extractCategory(TAXONOMY.testingFrameworks);
  const tools = extractCategory(TAXONOMY.tools);
  const aiFrameworks = extractCategory(TAXONOMY.aiFrameworks);
  const mlLibraries = extractCategory(TAXONOMY.mlLibraries);
  const bigData = extractCategory(TAXONOMY.bigData);
  const dataEngineering = extractCategory(TAXONOMY.dataEngineering);
  const backend = extractCategory(TAXONOMY.backend);
  const frontend = extractCategory(TAXONOMY.frontend);
  const mobile = extractCategory(TAXONOMY.mobile);
  const security = extractCategory(TAXONOMY.security);
  const networking = extractCategory(TAXONOMY.networking);

  const allTechnicalSkills = Array.from(new Set([
    ...languages, ...frameworks, ...libraries, ...databases, ...cloudPlatforms,
    ...devops, ...operatingSystems, ...versionControl, ...testingFrameworks, ...tools,
    ...aiFrameworks, ...mlLibraries, ...bigData, ...dataEngineering, ...backend,
    ...frontend, ...mobile, ...security, ...networking
  ]));

  return {
    languages,
    frameworks,
    libraries,
    databases,
    cloudPlatforms,
    devops,
    operatingSystems,
    versionControl,
    testingFrameworks,
    tools,
    aiFrameworks,
    mlLibraries,
    bigData,
    dataEngineering,
    backend,
    frontend,
    mobile,
    security,
    networking,
    allTechnicalSkills
  };
}

export function extractSoftSkills(text: string): SoftSkillsBreakdown {
  const textLower = text.toLowerCase();
  const allSoftSkills: string[] = [];

  const checkSkill = (keywords: string[], skillName: string): boolean => {
    const isPresent = keywords.some(kw => textLower.includes(kw));
    if (isPresent) allSoftSkills.push(skillName);
    return isPresent;
  };

  const leadership = checkSkill(SOFT_SKILLS_KEYWORDS.leadership, "Leadership");
  const communication = checkSkill(SOFT_SKILLS_KEYWORDS.communication, "Communication");
  const presentation = checkSkill(SOFT_SKILLS_KEYWORDS.presentation, "Presentation");
  const criticalThinking = checkSkill(SOFT_SKILLS_KEYWORDS.criticalThinking, "Critical Thinking");
  const problemSolving = checkSkill(SOFT_SKILLS_KEYWORDS.problemSolving, "Problem Solving");
  const mentoring = checkSkill(SOFT_SKILLS_KEYWORDS.mentoring, "Mentoring");
  const decisionMaking = checkSkill(SOFT_SKILLS_KEYWORDS.decisionMaking, "Decision Making");
  const collaboration = checkSkill(SOFT_SKILLS_KEYWORDS.collaboration, "Collaboration");
  const teamwork = checkSkill(SOFT_SKILLS_KEYWORDS.teamwork, "Teamwork");
  const timeManagement = checkSkill(SOFT_SKILLS_KEYWORDS.timeManagement, "Time Management");

  return {
    leadership,
    communication,
    presentation,
    criticalThinking,
    problemSolving,
    mentoring,
    decisionMaking,
    collaboration,
    teamwork,
    timeManagement,
    allSoftSkills: Array.from(new Set(allSoftSkills))
  };
}

/* ============================================================
   4. RESPONSIBILITIES & QUALIFICATIONS
============================================================ */

export function extractResponsibilities(text: string): string[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const responsibilities: string[] = [];

  let inSection = false;
  const sectionHeaders = /^(responsibilities|what you will do|role responsibilities|duties|key responsibilities)/i;
  const otherHeaders = /^(qualifications|requirements|skills|benefits|about us)/i;

  for (const line of lines) {
    if (sectionHeaders.test(line)) {
      inSection = true;
      continue;
    } else if (inSection && otherHeaders.test(line)) {
      inSection = false;
      break;
    }

    if (inSection && line.length > 10) {
      responsibilities.push(line.replace(/^[•▪►◆■★●◦\-*]\s*/, ""));
    }
  }

  if (responsibilities.length === 0) {
    // Fallback bullet collection
    lines.forEach(l => {
      if (/^[•▪►◆■★●◦\-*]\s+/.test(l) && l.length > 20) {
        responsibilities.push(l.replace(/^[•▪►◆■★●◦\-*]\s*/, ""));
      }
    });
  }

  return Array.from(new Set(responsibilities));
}

export function extractQualifications(text: string, allTechSkills: string[]): QualificationsBreakdown {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const mandatoryQualifications: string[] = [];
  const preferredQualifications: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes("required") || line.toLowerCase().includes("must have") || line.toLowerCase().includes("minimum")) {
      mandatoryQualifications.push(line);
    } else if (line.toLowerCase().includes("preferred") || line.toLowerCase().includes("nice to have") || line.toLowerCase().includes("plus")) {
      preferredQualifications.push(line);
    }
  }

  return {
    mandatoryQualifications: mandatoryQualifications.slice(0, 8),
    preferredQualifications: preferredQualifications.slice(0, 6),
    niceToHaveSkills: allTechSkills.slice(Math.ceil(allTechSkills.length * 0.6))
  };
}

/* ============================================================
   5. BENEFITS EXTRACTION
============================================================ */

export function extractBenefits(text: string): BenefitsBreakdown {
  const textLower = text.toLowerCase();
  
  const insurance = textLower.includes("insurance") || textLower.includes("health") || textLower.includes("medical");
  const remote = textLower.includes("remote");
  const hybrid = textLower.includes("hybrid");
  const bonus = textLower.includes("bonus") || textLower.includes("performance pay");
  const paidLeave = textLower.includes("paid leave") || textLower.includes("pto") || textLower.includes("vacation");
  const stockOptions = textLower.includes("stock") || textLower.includes("rsu") || textLower.includes("equity");
  const learningBudget = textLower.includes("learning") || textLower.includes("tuition") || textLower.includes("conference");

  const benefitsList: string[] = [];
  if (insurance) benefitsList.push("Health & Dental Insurance");
  if (remote || hybrid) benefitsList.push(remote ? "100% Remote Work" : "Hybrid Work Model");
  if (bonus) benefitsList.push("Annual Performance Bonus");
  if (paidLeave) benefitsList.push("Generous Paid Time Off (PTO)");
  if (stockOptions) benefitsList.push("Equity / Stock Options");
  if (learningBudget) benefitsList.push("Professional Development & Learning Stipend");

  return {
    benefitsList,
    insurance,
    hybrid,
    remote,
    bonus,
    paidLeave,
    stockOptions,
    learningBudget
  };
}

/* ============================================================
   6. SENIORITY & HIRING INSIGHTS
============================================================ */

export function detectSeniority(text: string, title: string): SeniorityLevel {
  const combined = (title + " " + text).toLowerCase();

  if (combined.includes("intern")) return "Intern";
  if (combined.includes("vp") || combined.includes("vice president")) return "VP";
  if (combined.includes("director")) return "Director";
  if (combined.includes("principal")) return "Principal";
  if (combined.includes("architect")) return "Architect";
  if (combined.includes("lead")) return "Lead";
  if (combined.includes("manager")) return "Manager";
  if (combined.includes("senior") || combined.includes("sr.")) return "Senior";
  if (combined.includes("junior") || combined.includes("jr.")) return "Junior";
  if (combined.includes("associate")) return "Associate";

  return "Mid Level";
}

/* ============================================================
   7. MAIN JOB PARSER ENTRYPOINT
============================================================ */

export function parseJobDescription(rawText: string): JobDescription {
  if (!rawText || !rawText.trim()) {
    throw new Error("Invalid or empty job description provided.");
  }

  const title = extractJobTitle(rawText);
  const company = extractCompany(rawText);
  const workMode = extractWorkMode(rawText);
  const employmentType = extractEmploymentType(rawText);
  const salary = extractSalary(rawText);
  const location = extractLocation(rawText);

  const experience = extractExperienceRequirements(rawText);
  const education = extractEducationRequirements(rawText);

  const technicalSkills = extractCategorizedTechnicalSkills(rawText);
  const softSkills = extractSoftSkills(rawText);

  const responsibilities = extractResponsibilities(rawText);
  const qualifications = extractQualifications(rawText, technicalSkills.allTechnicalSkills);
  const benefits = extractBenefits(rawText);

  const seniority = detectSeniority(rawText, title);

  // Keyword Engine
  const words = rawText.toLowerCase().match(/\b[a-z0-9+#.-]+\b/g) || [];
  const totalWords = words.length;
  const keywordFrequency: Record<string, number> = {};
  for (const w of words) {
    if (w.length >= 3) keywordFrequency[w] = (keywordFrequency[w] || 0) + 1;
  }

  const keywordDensity: Record<string, number> = {};
  for (const [kw, freq] of Object.entries(keywordFrequency)) {
    if (freq >= 2 && technicalSkills.allTechnicalSkills.some(s => s.toLowerCase() === kw)) {
      keywordDensity[kw] = Number(((freq / totalWords) * 100).toFixed(2));
    }
  }

  const mandatorySkills = technicalSkills.allTechnicalSkills.slice(0, Math.ceil(technicalSkills.allTechnicalSkills.length * 0.6));
  const optionalSkills = technicalSkills.allTechnicalSkills.slice(Math.ceil(technicalSkills.allTechnicalSkills.length * 0.6));

  const primaryKeywords = mandatorySkills.slice(0, 6);
  const secondaryKeywords = optionalSkills.slice(0, 6);

  const repeatedKeywords = Object.entries(keywordFrequency)
    .filter(([_, count]) => count > 8)
    .map(([kw, count]) => `${kw} (${count}x)`);

  const skillDiversity = technicalSkills.allTechnicalSkills.length;
  const jobComplexity = Math.min(100, skillDiversity * 4 + experience.minimumYears * 5 + 30);

  let hiringDifficulty: HiringDifficultyLevel = "Medium";
  if (jobComplexity >= 80) hiringDifficulty = "Very High";
  else if (jobComplexity >= 65) hiringDifficulty = "High";
  else if (jobComplexity <= 40) hiringDifficulty = "Low";

  const expectedCandidateLevel = `${seniority} (${experience.minimumYears}+ Years Experience)`;

  return {
    title,
    company,
    department: "Engineering / Technology",
    employmentType,
    workMode,
    location,
    salary,
    currency: salary.currency,
    shift: "Day Shift (Standard)",
    noticePeriod: "30 Days / Immediate",

    experience,
    education,

    technicalSkills,
    softSkills,

    responsibilities,
    qualifications,
    benefits,

    mandatorySkills,
    optionalSkills,
    primaryKeywords,
    secondaryKeywords,

    keywordDensity,
    keywordFrequency,
    keywordWeight: keywordFrequency,
    repeatedKeywords,

    seniority,
    jobComplexity,
    hiringDifficulty,
    skillDiversity,
    expectedCandidateLevel,
    prioritySkills: primaryKeywords,
    criticalSkills: mandatorySkills,

    rawText
  };
}

export default parseJobDescription;
