'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Sparkles, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { http, type ApiError } from '@/api/client';

export default function CreateJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [type, setType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('Senior (5+ years)');
  const [salaryMin, setSalaryMin] = useState('140000');
  const [salaryMax, setSalaryMax] = useState('180000');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'Next.js', 'TypeScript', 'Java', 'Spring Boot']);
  const [submitting, setSubmitting] = useState(false);

  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN')
  );

  useEffect(() => {
    if (!authLoading && user && !isRecruiter) {
      toast.error('You do not have permission to perform this action.');
      router.push('/dashboard');
    }
  }, [user, authLoading, isRecruiter, router]);

  if (authLoading || (user && !isRecruiter)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Please enter a job title and description.');
      return;
    }

    setSubmitting(true);

    try {
      await http.post('/jobs', {
        title,
        department,
        location,
        jobType: type,
        experienceLevel,
        minSalary: Number(salaryMin) || 0,
        maxSalary: Number(salaryMax) || 0,
        currency: 'USD',
        description,
        requiredSkills: skills.map((s) => ({ skillName: s, importance: 'REQUIRED' })),
      });

      toast.success('Job requisition published successfully!');
      router.push('/dashboard/jobs');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error(apiErr?.message || 'Failed to create job requisition.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/jobs">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Job Requisitions</span>
        </Link>
      </Button>

      <Card className="glass border-white/10 p-6">
        <CardHeader className="p-0 pb-6 border-b border-white/10">
          <CardTitle className="text-2xl font-bold">Create Job Requisition</CardTitle>
          <CardDescription className="text-xs">
            Define role requirements, required skill taxonomy, and target compensation.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Job Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. Senior Full Stack Engineer (Next.js & Spring Boot)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-black/40 border-white/10 focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-black/40 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Location / Workplace
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-black/40 border-white/10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Minimum Salary (USD)
                </Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="bg-black/40 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Maximum Salary (USD)
                </Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="bg-black/40 border-white/10"
                />
              </div>
            </div>

            {/* Skills Taxonomy */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required Skill Taxonomy
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill (e.g. React, Docker, Oracle)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="bg-black/40 border-white/10 flex-1"
                />
                <Button type="button" onClick={handleAddSkill} variant="outline" size="sm" className="glass">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary"
                  >
                    <span>{skill}</span>
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Job Description & Qualifications
              </Label>
              <textarea
                id="description"
                rows={6}
                placeholder="Detail key responsibilities, qualifications, and project context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-sm focus:border-primary focus:outline-none text-foreground"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard/jobs">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="primary-button text-xs gap-2">
                {submitting ? 'Publishing...' : 'Publish Job Requisition'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
