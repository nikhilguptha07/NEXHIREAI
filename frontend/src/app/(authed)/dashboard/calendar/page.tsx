'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Briefcase,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Edit,
  Grid,
  List,
  Columns,
  MapPin,
  FileText,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/* ============================================================
   TYPES & DATA MODELS
============================================================ */

export type CalendarViewMode = 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';

export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'HR' | 'EXECUTIVE';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'PENDING';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RecruitmentEvent {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  recruiterName: string;
  type: InterviewType;
  status: InterviewStatus;
  priority: PriorityLevel;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  durationMinutes: number;
  meetingUrl?: string;
  location?: string;
  notes?: string;
}

/* ============================================================
   DEFAULT INITIAL ENTERPRISE EVENTS DATASET (No Duplicates)
============================================================ */

const INITIAL_EVENTS: RecruitmentEvent[] = [
  {
    id: 'evt-101',
    candidateName: 'Sarah Jenkins',
    candidateEmail: 'sarah.jenkins@example.com',
    jobTitle: 'Senior Full Stack Engineer',
    department: 'Engineering',
    recruiterName: 'Alex Rivera',
    type: 'TECHNICAL',
    status: 'SCHEDULED',
    priority: 'HIGH',
    date: '2026-08-03',
    time: '10:00 AM',
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/nex-tech-screen',
    location: 'Google Meet',
    notes: 'Focus on System Architecture, Next.js 15 App Router, and Spring Boot REST APIs.',
  },
  {
    id: 'evt-102',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@example.com',
    jobTitle: 'Staff AI/ML Research Engineer',
    department: 'AI Research',
    recruiterName: 'Elena Rostova',
    type: 'SYSTEM_DESIGN',
    status: 'SCHEDULED',
    priority: 'HIGH',
    date: '2026-08-05',
    time: '02:30 PM',
    durationMinutes: 45,
    meetingUrl: 'https://zoom.us/j/nex-ai-research',
    location: 'Zoom Video Conference',
    notes: 'Deep-dive into Oracle 23ai AI Vector Search embeddings and LLM fine-tuning.',
  },
  {
    id: 'evt-103',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@example.com',
    jobTitle: 'Senior DevOps Infrastructure Engineer',
    department: 'Infrastructure',
    recruiterName: 'Alex Rivera',
    type: 'BEHAVIORAL',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    date: '2026-08-10',
    time: '11:00 AM',
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/nex-devops-fit',
    location: 'Google Meet',
    notes: 'Evaluated team mentorship, Kubernetes automation, and incidents response history.',
  },
  {
    id: 'evt-104',
    candidateName: 'Elena Rodriguez',
    candidateEmail: 'elena.r@example.com',
    jobTitle: 'Principal Product Designer',
    department: 'Design',
    recruiterName: 'Marcus Vance',
    type: 'EXECUTIVE',
    status: 'SCHEDULED',
    priority: 'HIGH',
    date: '2026-08-14',
    time: '03:00 PM',
    durationMinutes: 60,
    location: 'Building A — Executive Suite 402',
    notes: 'Onsite portfolio presentation with VP of Engineering & Product Leads.',
  },
  {
    id: 'evt-105',
    candidateName: 'James Wilson',
    candidateEmail: 'j.wilson@example.com',
    jobTitle: 'Senior Backend Engineer (Java)',
    department: 'Engineering',
    recruiterName: 'Elena Rostova',
    type: 'HR',
    status: 'PENDING',
    priority: 'MEDIUM',
    date: '2026-08-18',
    time: '01:00 PM',
    durationMinutes: 30,
    meetingUrl: 'https://meet.google.com/nex-hr-screen',
    location: 'Google Meet',
    notes: 'Screening for compensation expectations and notice period alignment.',
  },
  {
    id: 'evt-106',
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya.sharma@example.com',
    jobTitle: 'Senior Data Architect',
    department: 'Data Platform',
    recruiterName: 'Alex Rivera',
    type: 'TECHNICAL',
    status: 'SCHEDULED',
    priority: 'HIGH',
    date: '2026-08-22',
    time: '04:00 PM',
    durationMinutes: 60,
    meetingUrl: 'https://meet.google.com/nex-data-arch',
    location: 'Google Meet',
    notes: 'Oracle Database 23ai Partitioning and real-time Kafka pipeline telemetry design.',
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HiringCalendarPage() {
  // Calendar Navigation State (Default to August 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1));
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-03');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Event Data State
  const [events, setEvents] = useState<RecruitmentEvent[]>(INITIAL_EVENTS);
  const [activeModalEvent, setActiveModalEvent] = useState<RecruitmentEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State for Add Event
  const [newEvent, setNewEvent] = useState<Partial<RecruitmentEvent>>({
    candidateName: '',
    candidateEmail: '',
    jobTitle: '',
    department: 'Engineering',
    recruiterName: 'Alex Rivera',
    type: 'TECHNICAL',
    status: 'SCHEDULED',
    priority: 'HIGH',
    date: '2026-08-15',
    time: '10:00 AM',
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/nex-screen',
    notes: '',
  });

  /* ============================================================
     DATE COMPUTATIONS
  ============================================================ */

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 1));
    setSelectedDate('2026-08-01');
  };

  // Calendar Grid Cells Computation
  const calendarGrid = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading Days (Prev Month)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonthNum = month === 0 ? 11 : month - 1;
      const prevYearNum = month === 0 ? year - 1 : year;
      const dateStr = `${prevYearNum}-${String(prevMonthNum + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: prevDay, isCurrentMonth: false });
    }

    // Current Month Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: day, isCurrentMonth: true });
    }

    // Trailing Days (Next Month)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonthNum = month === 11 ? 0 : month + 1;
      const nextYearNum = month === 11 ? year + 1 : year;
      const dateStr = `${nextYearNum}-${String(nextMonthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: day, isCurrentMonth: false });
    }

    return cells;
  }, [year, month]);

  /* ============================================================
     FILTERED EVENTS COMPUTATION (Guaranteed Unique IDs)
  ============================================================ */

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        searchQuery === '' ||
        evt.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.recruiterName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || evt.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || evt.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchQuery, typeFilter, statusFilter]);

  // Group filtered events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, RecruitmentEvent[]> = {};
    filteredEvents.forEach((evt) => {
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date]!.push(evt);
    });
    return map;
  }, [filteredEvents]);

  /* ============================================================
     EVENT CRUD ACTIONS
  ============================================================ */

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.candidateName || !newEvent.jobTitle) return;

    const created: RecruitmentEvent = {
      id: `evt-${Date.now()}`,
      candidateName: newEvent.candidateName || 'Candidate',
      candidateEmail: newEvent.candidateEmail || 'candidate@example.com',
      jobTitle: newEvent.jobTitle || 'Software Engineer',
      department: newEvent.department || 'Engineering',
      recruiterName: newEvent.recruiterName || 'Alex Rivera',
      type: (newEvent.type as InterviewType) || 'TECHNICAL',
      status: (newEvent.status as InterviewStatus) || 'SCHEDULED',
      priority: (newEvent.priority as PriorityLevel) || 'HIGH',
      date: newEvent.date || selectedDate,
      time: newEvent.time || '10:00 AM',
      durationMinutes: Number(newEvent.durationMinutes) || 45,
      meetingUrl: newEvent.meetingUrl,
      notes: newEvent.notes,
    };

    setEvents((prev) => [...prev, created]);
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setActiveModalEvent(null);
  };

  const handleStatusChange = (id: string, newStatus: InterviewStatus) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    if (activeModalEvent && activeModalEvent.id === id) {
      setActiveModalEvent({ ...activeModalEvent, status: newStatus });
    }
  };

  /* ============================================================
     COLOR & BADGE UTILITIES
  ============================================================ */

  const getTypeBadgeColor = (type: InterviewType) => {
    switch (type) {
      case 'TECHNICAL':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'BEHAVIORAL':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SYSTEM_DESIGN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'HR':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'EXECUTIVE':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default:
        return 'bg-accent text-foreground';
    }
  };

  const getStatusBadgeColor = (status: InterviewStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 pt-2 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recruitment Calendar</h1>
          <p className="text-xs text-muted-foreground">
            Schedule candidate interviews, track recruiter availability, and manage hiring rounds.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border/40 bg-card p-0.5">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'MONTH' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Month</span>
            </button>

            <button
              onClick={() => setViewMode('WEEK')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'WEEK' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Week</span>
            </button>

            <button
              onClick={() => setViewMode('AGENDA')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'AGENDA' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="primary-button text-xs gap-1.5 h-8 px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Interview</span>
          </Button>
        </div>
      </div>

      {/* Navigation & Live Filter Controls Bar */}
      <Card className="border border-border/40 bg-card/60 p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Month/Year Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 text-xs font-medium border-border/40"
            >
              Today
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0 border-border/40"
                aria-label="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0 border-border/40"
                aria-label="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <span className="font-bold text-sm text-foreground px-2">
              {MONTH_NAMES[month]} {year}
            </span>
          </div>

          {/* Search & Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search candidate/job..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-accent/30 border-border/40 rounded-lg"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 text-xs rounded-lg border border-border/40 bg-accent/30 px-2 text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Types</option>
              <option value="TECHNICAL">Technical Screen</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="HR">HR Screen</option>
              <option value="EXECUTIVE">Executive</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs rounded-lg border border-border/40 bg-accent/30 px-2 text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ============================================================
         VIEW MODE 1: MONTH VIEW (Default)
      ============================================================ */}

      {viewMode === 'MONTH' && (
        <Card className="border border-border/40 bg-card/60 p-4">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground border-b border-border/40 pb-2 mb-2">
            {WEEKDAY_NAMES.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* 42-Cell Date Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((cell) => {
              const dayEvents = eventsByDate[cell.dateStr] || [];
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[100px] p-2 rounded-lg border text-xs flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : cell.isCurrentMonth
                      ? 'border-border/30 bg-card/40 hover:border-border/60'
                      : 'border-transparent bg-accent/5 text-muted-foreground/40'
                  }`}
                >
                  <div className="flex justify-between items-center font-medium text-[11px]">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : cell.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/40'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Day Events Badges */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalEvent(ev);
                        }}
                        className={`p-1 rounded text-[10px] font-medium border truncate hover:opacity-80 transition-opacity ${getTypeBadgeColor(
                          ev.type
                        )}`}
                        title={`${ev.time} - ${ev.candidateName} (${ev.jobTitle})`}
                      >
                        {ev.time} {ev.candidateName}
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground text-center font-semibold">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ============================================================
         VIEW MODE 2: AGENDA VIEW
      ============================================================ */}

      {viewMode === 'AGENDA' && (
        <Card className="border border-border/40 bg-card/60 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="font-bold text-sm text-foreground">Upcoming Interview Agenda</h2>
            <span className="text-xs text-muted-foreground">{filteredEvents.length} Sessions Found</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p>No interview sessions match the active search filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setActiveModalEvent(evt)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-accent/20 border border-border/30 hover:border-primary/40 transition-all cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                      {evt.candidateName?.[0] || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{evt.candidateName}</span>
                        <Badge variant="outline" className={`text-[10px] ${getTypeBadgeColor(evt.type)}`}>
                          {evt.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.jobTitle} • {evt.department}</p>
                      <p className="text-[11px] text-muted-foreground pt-0.5 flex items-center gap-2">
                        <span>Recruiter: {evt.recruiterName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {evt.date} at {evt.time}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadgeColor(evt.status)}`}>
                        {evt.status}
                      </span>
                    </div>

                    {evt.meetingUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 border-border/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(evt.meetingUrl, '_blank');
                        }}
                      >
                        <Video className="h-3.5 w-3.5 text-blue-400" />
                        <span>Join</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ============================================================
         VIEW MODE 3: WEEK VIEW
      ============================================================ */}

      {viewMode === 'WEEK' && (
        <Card className="border border-border/40 bg-card/60 p-4 space-y-3">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground border-b border-border/40 pb-2">
            {WEEKDAY_NAMES.map((d, i) => (
              <div key={d}>
                <p className="uppercase text-[10px]">{d}</p>
                <p className="text-sm font-bold text-foreground">{i + 1}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 min-h-[300px]">
            {WEEKDAY_NAMES.map((_, colIdx) => {
              const dateStr = `2026-08-0${colIdx + 1}`;
              const dayEvts = eventsByDate[dateStr] || [];

              return (
                <div key={colIdx} className="p-2 rounded-lg bg-accent/10 border border-border/30 space-y-2">
                  {dayEvts.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setActiveModalEvent(ev)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer ${getTypeBadgeColor(ev.type)}`}
                    >
                      <p className="font-bold text-[11px] truncate">{ev.candidateName}</p>
                      <p className="text-[10px] opacity-80">{ev.time}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ============================================================
         MODAL 1: EVENT DETAILS MODAL
      ============================================================ */}

      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/40 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">{activeModalEvent.candidateName}</h3>
                  <Badge variant="outline" className={`text-[10px] ${getTypeBadgeColor(activeModalEvent.type)}`}>
                    {activeModalEvent.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activeModalEvent.jobTitle} • {activeModalEvent.department}</p>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-accent/20 border border-border/30 space-y-0.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Date & Time
                  </span>
                  <p className="font-semibold text-foreground">{activeModalEvent.date} at {activeModalEvent.time}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-accent/20 border border-border/30 space-y-0.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-purple-400" /> Recruiter
                  </span>
                  <p className="font-semibold text-foreground">{activeModalEvent.recruiterName}</p>
                </div>
              </div>

              {activeModalEvent.location && (
                <div className="p-2.5 rounded-xl bg-accent/20 border border-border/30 flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Location / Platform
                  </span>
                  <span className="font-semibold text-foreground">{activeModalEvent.location}</span>
                </div>
              )}

              {activeModalEvent.notes && (
                <div className="p-3 rounded-xl bg-accent/20 border border-border/30 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                    <FileText className="h-3.5 w-3.5 text-amber-400" /> Interviewer Notes
                  </span>
                  <p className="text-muted-foreground">{activeModalEvent.notes}</p>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-border/40 space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Update Session Status
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(activeModalEvent.id, 'COMPLETED')}
                    className="text-xs gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Completed</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(activeModalEvent.id, 'CANCELLED')}
                    className="text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-950/30"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Cancel Interview</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEvent(activeModalEvent.id)}
                    className="text-xs gap-1 text-red-400 hover:bg-red-950/30 ml-auto border-border/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {activeModalEvent.meetingUrl && (
              <div className="pt-3 border-t border-border/40">
                <Button size="sm" className="w-full primary-button text-xs gap-1.5" asChild>
                  <a href={activeModalEvent.meetingUrl} target="_blank" rel="noreferrer">
                    <Video className="h-4 w-4" />
                    <span>Launch Interview Meeting</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
         MODAL 2: SCHEDULE NEW INTERVIEW MODAL
      ============================================================ */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-base text-foreground">Schedule Candidate Interview</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Candidate Name</label>
                <Input
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newEvent.candidateName}
                  onChange={(e) => setNewEvent({ ...newEvent, candidateName: e.target.value })}
                  className="h-8 text-xs bg-accent/30 border-border/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Job Title</label>
                  <Input
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={newEvent.jobTitle}
                    onChange={(e) => setNewEvent({ ...newEvent, jobTitle: e.target.value })}
                    className="h-8 text-xs bg-accent/30 border-border/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Recruiter</label>
                  <Input
                    value={newEvent.recruiterName}
                    onChange={(e) => setNewEvent({ ...newEvent, recruiterName: e.target.value })}
                    className="h-8 text-xs bg-accent/30 border-border/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="h-8 text-xs bg-accent/30 border-border/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Time</label>
                  <Input
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="h-8 text-xs bg-accent/30 border-border/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as InterviewType })}
                    className="h-8 w-full text-xs rounded-lg border border-border/40 bg-accent/30 px-2 text-foreground"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="SYSTEM_DESIGN">System Design</option>
                    <option value="BEHAVIORAL">Behavioral</option>
                    <option value="HR">HR Screen</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Meeting Link / Location</label>
                <Input
                  placeholder="https://meet.google.com/..."
                  value={newEvent.meetingUrl}
                  onChange={(e) => setNewEvent({ ...newEvent, meetingUrl: e.target.value })}
                  className="h-8 text-xs bg-accent/30 border-border/40"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Interviewer Focus / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key topics to evaluate during session..."
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full rounded-lg border border-border/40 bg-accent/30 p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="primary-button text-xs px-4">
                  Save Interview Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
