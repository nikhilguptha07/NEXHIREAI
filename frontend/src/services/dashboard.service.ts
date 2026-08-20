import { http } from '@/api/client';
import { type ApplicationStatus } from '@/types/api';
import {
  MOCK_CANDIDATES,
  MOCK_JOBS,
  MOCK_INTERVIEWS,
  MOCK_NOTIFICATIONS,
  type Candidate,
  type JobPosting,
  type InterviewSession,
  type NotificationItem,
} from '@/lib/mock-data';

export interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalCandidates: number;
  offersSent: number;
  hiringRate: number;
  applicationsByStatus: Record<string, number>;
  jobsByStatus: Record<string, number>;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  department?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  recruiterId?: string;
  recruiterName?: string;
  atsScore?: number;
  aiRecommendation?: string;
  status: ApplicationStatus;
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InterviewRecord {
  id: string;
  applicationId: string;
  jobTitle?: string;
  interviewerId: string;
  interviewerName?: string;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  scheduledAt: string;
  durationMinutes: number;
  location?: string;
  meetingProvider?: string;
  meetingId?: string;
  meetingUrl?: string;
  interviewType?: string;
  status: string;
  feedback?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeJob(item: any): JobPosting {
  if (!item) {
    return {
      id: '',
      title: 'Untitled Requisition',
      department: 'General',
      location: 'Remote',
      type: 'FULL_TIME',
      jobType: 'FULL_TIME',
      experienceLevel: 'Senior',
      salaryMin: 0,
      salaryMax: 0,
      minSalary: 0,
      maxSalary: 0,
      currency: 'USD',
      minimumScore: 80,
      status: 'PUBLISHED',
      postedDate: new Date().toISOString(),
      applicantsCount: 0,
      shortlistedCount: 0,
      description: '',
      requiredSkills: [],
    };
  }

  const sMin = Number(item.salaryMin ?? item.minSalary ?? 0);
  const sMax = Number(item.salaryMax ?? item.maxSalary ?? 0);

  const skills = Array.isArray(item.requiredSkills)
    ? item.requiredSkills.map((s: any) =>
        typeof s === 'string' ? s : s?.skillName || s?.name || 'Skill'
      )
    : [];

  return {
    id: String(item.id || ''),
    title: item.title || 'Untitled Requisition',
    department: item.department || 'Engineering',
    location: item.location || 'Remote',
    type: item.type || item.jobType || 'FULL_TIME',
    jobType: item.jobType || item.type || 'FULL_TIME',
    experienceLevel: item.experienceLevel || 'Mid-Senior',
    salaryMin: sMin,
    salaryMax: sMax,
    minSalary: sMin,
    maxSalary: sMax,
    currency: item.currency || 'USD',
    minimumScore: Number(item.minimumScore ?? 80),
    status: item.status || 'PUBLISHED',
    postedDate: item.postedDate || item.createdAt || new Date().toISOString(),
    applicantsCount: Number(item.applicantsCount ?? 0),
    shortlistedCount: Number(item.shortlistedCount ?? 0),
    description: item.description || '',
    requiredSkills: skills,
  };
}

export class DashboardService {
  /**
   * Get main platform stats
   */
  static async getStats(): Promise<DashboardStats> {
    try {
      const data = await http.get<DashboardStats>('/dashboard/stats');
      if (data && typeof data.totalCandidates === 'number') {
        return data;
      }
    } catch (_err) {
      // Fallback
    }

    return {
      totalJobs: 4,
      totalApplications: 0,
      totalInterviews: 0,
      totalCandidates: 0,
      offersSent: 0,
      hiringRate: 0,
      applicationsByStatus: {
        SUBMITTED: 0,
        SCREENING: 0,
        SHORTLISTED: 0,
        INTERVIEW_SCHEDULED: 0,
        OFFERED: 0,
        ACCEPTED: 0,
      },
      jobsByStatus: {
        PUBLISHED: 3,
        DRAFT: 1,
        CLOSED: 0,
      },
    };
  }

  /**
   * Get Candidates list
   */
  static async getCandidates(): Promise<Candidate[]> {
    try {
      const data = await http.get<any[]>('/candidates');
      if (Array.isArray(data)) {
        return data.map((item) => ({
          id: item.id || '',
          name: item.name || item.headline || 'Candidate Profile',
          avatar: item.avatar || item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          email: item.email || 'candidate@nexhire.ai',
          phone: item.phone || '+1 (555) 000-0000',
          role: item.role || item.headline || 'Software Engineer',
          location: item.location || 'Remote',
          experienceYears: item.experienceYears ?? item.yearsOfExperience ?? 3,
          matchScore: item.matchScore ?? 92,
          status: item.status || 'NEW',
          appliedDate: item.createdAt ? (new Date(item.createdAt).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
          skills: Array.isArray(item.skills) 
            ? item.skills.map((s: any) => (typeof s === 'string' ? s : s.name || 'Skill'))
            : ['Java', 'Spring Boot'],
          education: Array.isArray(item.educations) && item.educations.length > 0 ? item.educations.map((e: any) => ({
            degree: e.degree || 'Degree',
            institution: e.institution || 'University',
            year: e.endDate ? String(e.endDate).slice(0, 4) : '2023'
          })) : [
            { degree: 'B.S. Computer Science', institution: 'University of Technology', year: '2021' }
          ],
          experience: Array.isArray(item.experiences) && item.experiences.length > 0 ? item.experiences.map((ex: any) => ({
            company: ex.companyName || 'Company',
            title: ex.title || 'Role',
            duration: ex.startDate ? `${ex.startDate} - ${ex.endDate || 'Present'}` : '2021 - Present',
            description: ex.description || 'Software Engineering responsibilities.'
          })) : [
            { company: 'Enterprise Software Inc.', title: item.headline || 'Software Engineer', duration: '2021 - Present', description: 'Engineered high-scale web applications and API services.' }
          ],
          aiSummary: item.summary || 'Strong technical background with proven experience.',
        }));
      }
    } catch (_err) {
      // Fallback
    }

    return [];
  }

  /**
   * Get Candidate by ID
   */
  static async getCandidateById(id: string): Promise<Candidate | null> {
    try {
      const item = await http.get<any>(`/candidates/${id}`);
      if (item && item.id) {
        return {
          id: item.id || '',
          name: item.name || item.headline || 'Candidate Profile',
          avatar: item.avatar || item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          email: item.email || 'candidate@nexhire.ai',
          phone: item.phone || '+1 (555) 000-0000',
          role: item.role || item.headline || 'Software Engineer',
          location: item.location || 'Remote',
          experienceYears: item.experienceYears ?? item.yearsOfExperience ?? 3,
          matchScore: item.matchScore ?? 92,
          status: item.status || 'NEW',
          appliedDate: item.createdAt ? (new Date(item.createdAt).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
          skills: Array.isArray(item.skills) 
            ? item.skills.map((s: any) => (typeof s === 'string' ? s : s.name || 'Skill'))
            : ['Java', 'Spring Boot'],
          education: Array.isArray(item.educations) && item.educations.length > 0 ? item.educations.map((e: any) => ({
            degree: e.degree || 'Degree',
            institution: e.institution || 'University',
            year: e.endDate ? String(e.endDate).slice(0, 4) : '2023'
          })) : [
            { degree: 'B.S. Computer Science', institution: 'University of Technology', year: '2021' }
          ],
          experience: Array.isArray(item.experiences) && item.experiences.length > 0 ? item.experiences.map((ex: any) => ({
            company: ex.companyName || 'Company',
            title: ex.title || 'Role',
            duration: ex.startDate ? `${ex.startDate} - ${ex.endDate || 'Present'}` : '2021 - Present',
            description: ex.description || 'Software Engineering responsibilities.'
          })) : [
            { company: 'Enterprise Software Inc.', title: item.headline || 'Software Engineer', duration: '2021 - Present', description: 'Engineered high-scale web applications and API services.' }
          ],
          aiSummary: item.summary || 'Strong technical background with proven experience.',
        };
      }
    } catch (_err) {
      // Fallback
    }

    return null;
  }

  /**
   * Get Job Postings
   */
  static async getJobs(): Promise<JobPosting[]> {
    try {
      const data = await http.get<any>('/jobs');
      let rawList: any[] = [];
      if (data && Array.isArray(data.content)) {
        rawList = data.content;
      } else if (Array.isArray(data)) {
        rawList = data;
      }

      if (rawList.length > 0) {
        return rawList.map(normalizeJob);
      }
    } catch (_err) {
      // Fallback
    }

    return MOCK_JOBS.map(normalizeJob);
  }

  /**
   * Get Job by ID
   */
  static async getJobById(id: string): Promise<JobPosting | null> {
    try {
      const data = await http.get<any>(`/jobs/${id}`);
      if (data && data.id) {
        return normalizeJob(data);
      }
    } catch (_err) {
      // Fallback
    }

    const found = MOCK_JOBS.find((j) => j.id === id);
    return found ? normalizeJob(found) : null;
  }

  static async submitApplication(
    jobId: string,
    resumeFileOrUrl?: File | string,
    coverLetter?: string
  ): Promise<ApplicationRecord> {
    let finalResumeUrl = 'https://nexhire.ai/resumes/sample-candidate.pdf';

    if (resumeFileOrUrl instanceof File) {
      try {
        const formData = new FormData();
        formData.append('resume', resumeFileOrUrl);
        formData.append('coverLetter', coverLetter || '');
        return await http.uploadMultipart<ApplicationRecord>(`/jobs/${jobId}/apply/multipart`, formData);
      } catch (_err) {
        try {
          const uploadRes = await http.upload<{ fileUrl: string }>('/resumes/upload', resumeFileOrUrl);
          if (uploadRes?.fileUrl) {
            finalResumeUrl = uploadRes.fileUrl;
          }
        } catch (_uploadErr) {
          // Fallback URL
        }
      }
    } else if (typeof resumeFileOrUrl === 'string' && resumeFileOrUrl) {
      finalResumeUrl = resumeFileOrUrl;
    }

    return await http.post<ApplicationRecord>(`/jobs/${jobId}/apply`, {
      jobId,
      resumeUrl: finalResumeUrl,
      coverLetter: coverLetter || 'Excited to apply for this role and bring value to the team.',
    });
  }

  /**
   * Get Candidate Applications
   */
  static async getMyApplications(): Promise<ApplicationRecord[]> {
    try {
      const data = await http.get<ApplicationRecord[]>('/applications/me');
      if (Array.isArray(data)) {
        return data;
      }
    } catch (_err) {
      // Fallback
    }

    return [];
  }

  /**
   * Get Applications for a specific Job Requisition
   */
  static async getJobApplications(jobId: string): Promise<ApplicationRecord[]> {
    try {
      const data = await http.get<ApplicationRecord[]>(`/applications/job/${jobId}`);
      if (Array.isArray(data)) {
        return data;
      }
    } catch (_err) {
      // Fallback
    }

    return [];
  }

  /**
   * Get Applications for Recruiter
   */
  static async getRecruiterApplications(): Promise<ApplicationRecord[]> {
    try {
      const data = await http.get<ApplicationRecord[]>('/applications/recruiter');
      if (Array.isArray(data)) {
        return data;
      }
    } catch (_err) {
      // Fallback
    }

    return [];
  }

  /**
   * Withdraw Application (Candidate)
   */
  static async withdrawApplication(id: string): Promise<ApplicationRecord> {
    return await http.put<ApplicationRecord>(`/applications/${id}/withdraw`, {});
  }

  /**
   * Update Application Status
   */
  static async updateApplicationStatus(id: string, status: string): Promise<ApplicationRecord> {
    return await http.put<ApplicationRecord>(`/applications/${id}/status`, { status });
  }

  /**
   * Schedule Interview Session
   */
  static async scheduleInterview(data: {
    applicationId: string;
    scheduledAt: string;
    durationMinutes?: number;
    meetingProvider?: string;
    location?: string;
  }): Promise<InterviewRecord> {
    return await http.post<InterviewRecord>('/interviews/invite', data);
  }

  /**
   * Candidate Respond to Interview (ACCEPT / DECLINE)
   */
  static async respondToInterview(interviewId: string, response: 'ACCEPT' | 'DECLINE'): Promise<InterviewRecord> {
    return await http.patch<InterviewRecord>(`/interviews/${interviewId}/respond`, { response });
  }

  /**
   * Recruiter Record Feedback & Final Decision
   */
  static async recordInterviewFeedback(
    interviewId: string,
    feedback: string,
    rating: number,
    decision: 'SELECTED' | 'REJECTED' | 'COMPLETED'
  ): Promise<InterviewRecord> {
    return await http.post<InterviewRecord>(`/interviews/${interviewId}/feedback`, {
      feedback,
      rating,
      decision,
    });
  }

  /**
   * Get Interviews
   */
  static async getInterviews(): Promise<InterviewSession[]> {
    try {
      const data = await http.get<any[]>('/interviews/me');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.id || '',
          candidateId: item.candidateId || '',
          jobId: item.applicationId || '',
          jobTitle: item.jobTitle || 'Software Engineer Requisition',
          candidateName: item.candidateName || 'Candidate',
          candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          interviewerName: item.interviewerName || 'Recruiter',
          interviewerRole: 'Lead Technical Recruiter',
          scheduledAt: item.scheduledAt || new Date().toISOString(),
          durationMinutes: item.durationMinutes || 60,
          type: item.interviewType || item.meetingProvider || 'VIDEO',
          status: item.status || 'INVITED',
          meetingUrl: item.meetingUrl || 'https://meet.google.com/nex-hire-ai',
          feedback: item.feedback,
          rating: item.rating,
        }));
      }
    } catch (_err) {
      // Fallback
    }

    return MOCK_INTERVIEWS;
  }

  /**
   * Get Notifications
   */
  static async getNotifications(): Promise<NotificationItem[]> {
    try {
      const data = await http.get<NotificationItem[]>('/notifications');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (_err) {
      // Fallback
    }

    return MOCK_NOTIFICATIONS;
  }
}
