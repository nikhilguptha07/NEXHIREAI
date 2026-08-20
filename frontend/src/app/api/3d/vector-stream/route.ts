import { NextResponse } from 'next/server';

export interface CandidateVector3D {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  position: [number, number, number]; // X: Skill depth, Y: Experience level, Z: Domain fit
  skills: string[];
  status: 'top-match' | 'strong' | 'potential';
}

export async function GET() {
  const candidates: CandidateVector3D[] = [
    {
      id: 'cand-1',
      name: 'Sarah Chen',
      role: 'Staff AI/ML Engineer',
      matchScore: 97.4,
      position: [1.8, 1.5, 1.2],
      skills: ['PyTorch', 'Transformers', 'CUDA', 'Vector Search'],
      status: 'top-match',
    },
    {
      id: 'cand-2',
      name: 'Alex Rivera',
      role: 'Senior Full Stack Architect',
      matchScore: 92.8,
      position: [-1.4, 1.2, 0.8],
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
      status: 'top-match',
    },
    {
      id: 'cand-3',
      name: 'Elena Rostova',
      role: 'Principal Cloud Systems Engineer',
      matchScore: 89.1,
      position: [1.1, -1.3, 1.6],
      skills: ['Kubernetes', 'Go', 'AWS', 'Distributed Systems'],
      status: 'strong',
    },
    {
      id: 'cand-4',
      name: 'Marcus Vance',
      role: 'Lead Data Scientist',
      matchScore: 86.5,
      position: [-1.6, -1.1, -1.0],
      skills: ['Python', 'Scikit-Learn', 'Feature Engineering', 'SQL'],
      status: 'strong',
    },
    {
      id: 'cand-5',
      name: 'Devon Wright',
      role: 'DevSecOps & Platform Engineer',
      matchScore: 83.2,
      position: [0.5, 1.7, -1.4],
      skills: ['Terraform', 'CI/CD', 'Security', 'Docker'],
      status: 'potential',
    },
  ];

  const timestamp = new Date().toISOString();

  return NextResponse.json({
    success: true,
    timestamp,
    candidateCount: candidates.length,
    vectorDimension: '3D Spatial Match Vector [Skill depth, Experience level, Domain fit]',
    data: candidates,
  });
}
