/**
 * NEXHIRE AI — Enterprise ATS Mock & Fallback Dataset
 */

export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  experienceYears: number;
  matchScore: number;
  status: 'NEW' | 'SCREENING' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED';
  appliedDate: string;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    company: string;
    title: string;
    duration: string;
    description: string;
  }[];
  aiSummary: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE' | string;
  jobType?: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  minimumScore?: number;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'PAUSED' | string;
  postedDate: string;
  applicantsCount: number;
  shortlistedCount: number;
  description: string;
  requiredSkills: string[];
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  jobTitle: string;
  interviewerName: string;
  interviewerRole: string;
  scheduledAt: string;
  durationMinutes: number;
  type: 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  meetingUrl?: string;
  rating?: number;
  feedback?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION' | 'INTERVIEW' | 'AI_RANKING' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  link?: string;
}

export const MOCK_CANDIDATES: Candidate[] = [];

export const MOCK_JOBS: JobPosting[] = [
  {
    id: 'job-001',
    title: 'Senior Full Stack Engineer (Next.js & Spring Boot)',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'FULL_TIME',
    experienceLevel: 'Senior (5+ years)',
    salaryMin: 160000,
    salaryMax: 210000,
    currency: 'USD',
    status: 'PUBLISHED',
    postedDate: '2026-07-20',
    applicantsCount: 0,
    shortlistedCount: 0,
    description: 'We are seeking a Senior Full Stack Engineer to drive our core AI hiring platform architecture using Next.js 15, React 19, and Spring Boot.',
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Java', 'Spring Boot', 'Oracle']
  },
  {
    id: 'job-002',
    title: 'Staff AI/ML Research Engineer',
    department: 'AI Research',
    location: 'Seattle, WA / Hybrid',
    type: 'FULL_TIME',
    experienceLevel: 'Staff (7+ years)',
    salaryMin: 190000,
    salaryMax: 250000,
    currency: 'USD',
    status: 'PUBLISHED',
    postedDate: '2026-07-22',
    applicantsCount: 0,
    shortlistedCount: 0,
    description: 'Lead vector embeddings, LLM fine-tuning, and semantic candidate matching engine using Oracle 26ai AI Vector Search.',
    requiredSkills: ['Python', 'PyTorch', 'Vector Search', 'LLMs', 'FastAPI']
  },
  {
    id: 'job-003',
    title: 'Principal Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'FULL_TIME',
    experienceLevel: 'Principal (8+ years)',
    salaryMin: 150000,
    salaryMax: 195000,
    currency: 'USD',
    status: 'PUBLISHED',
    postedDate: '2026-07-18',
    applicantsCount: 0,
    shortlistedCount: 0,
    description: 'Shape the next generation of AI-native recruiting tools with sleek glassmorphism design and micro-interactions.',
    requiredSkills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research']
  },
  {
    id: 'job-004',
    title: 'Senior DevOps / Infrastructure Engineer',
    department: 'Infrastructure',
    location: 'Austin, TX',
    type: 'FULL_TIME',
    experienceLevel: 'Senior (5+ years)',
    salaryMin: 155000,
    salaryMax: 200000,
    currency: 'USD',
    status: 'DRAFT',
    postedDate: '2026-07-29',
    applicantsCount: 0,
    shortlistedCount: 0,
    description: 'Manage automated Kubernetes deployments, Redis caching clusters, and MinIO object storage.',
    requiredSkills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Redis']
  }
];

export const MOCK_INTERVIEWS: InterviewSession[] = [];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'New Top Candidate Match',
    message: 'Sarah Jenkins scored 98% match for Senior Full Stack Engineer.',
    type: 'AI_RANKING',
    timestamp: '10 mins ago',
    read: false,
    link: '/dashboard/candidates/cand-001'
  },
  {
    id: 'notif-002',
    title: 'Interview Scheduled',
    message: 'Technical interview with Michael Chen scheduled for tomorrow at 2:30 PM.',
    type: 'INTERVIEW',
    timestamp: '1 hour ago',
    read: false,
    link: '/dashboard/interviews'
  },
  {
    id: 'notif-003',
    title: 'New Application Received',
    message: 'David Kim applied for Senior DevOps Engineer.',
    type: 'APPLICATION',
    timestamp: '3 hours ago',
    read: true,
    link: '/dashboard/candidates/cand-004'
  }
];
