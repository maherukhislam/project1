import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, FileWarning, FolderKanban, Users } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const stageLabels: Record<string, string> = {
  new_lead: 'New Lead',
  profile_incomplete: 'Profile Incomplete',
  ready_to_apply: 'Ready to Apply',
  applied: 'Applied',
  offer_received: 'Offer Received',
  visa_processing: 'Visa Processing',
  completed: 'Completed'
};

const CounselorDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRows, applicationRows] = await Promise.all([
          api.get('/api/admin/students'),
          api.get('/api/applications', { minimal: '1' })
        ]);
        setStudents(studentRows || []);
        setApplications(applicationRows || []);
      } catch (error) {
        console.error('Failed to load counselor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applicationsByStatus = useMemo(
    () =>
      applications.reduce((acc: Record<string, number>, application: any) => {
        acc[application.status] = (acc[application.status] || 0) + 1;
        return acc;
      }, {}),
    [applications]
  );

  const priorityStudents = useMemo(
    () =>
      [...students]
        .sort((left, right) => {
          const leftScore = (left.profile_strength_score || 0) + (left.lead_score || 0);
          const rightScore = (right.profile_strength_score || 0) + (right.lead_score || 0);
          return rightScore - leftScore;
        })
        .slice(0, 5),
    [students]
  );

  const followUps = useMemo(
    () =>
      applications
        .filter((application) => {
          const daysLeft = application.deadline_snapshot?.application_days_left;
          return typeof daysLeft === 'number' && daysLeft >= 0 && daysLeft <= 14;
        })
        .sort(
          (left, right) =>
            (left.deadline_snapshot?.application_days_left || 999) -
            (right.deadline_snapshot?.application_days_left || 999)
        )
        .slice(0, 5),
    [applications]
  );

  const summary = useMemo(
    () => ({
      totalStudents: students.length,
      readyToApply: students.filter((student) => student.pipeline_stage === 'ready_to_apply').length,
      docsNeedAttention: students.filter((student) => (student.document_readiness?.score || 0) < 100).length,
      activeApplications: applications.filter((application) => ['submitted', 'under_review', 'accepted', 'visa_processing'].includes(application.status)).length
    }),
    [students, applications]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Human execution layer
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Counselor Dashboard</h1>
            <p className="mt-2 max-w-2xl text-emerald-50/70">
              Work the assigned pipeline, focus hot leads first, and keep deadlines and missing documents visible.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/counselor/students"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-300/15"
            >
              Open My Students
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/counselor/applications"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Open Applications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Assigned Students', value: summary.totalStudents, icon: Users },
          { label: 'Ready To Apply', value: summary.readyToApply, icon: CheckCircle2 },
          { label: 'Docs Need Attention', value: summary.docsNeedAttention, icon: FileWarning },
          { label: 'Active Applications', value: summary.activeApplications, icon: FolderKanban }
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-50/60">{item.label}</p>
              <item.icon className="h-5 w-5 text-emerald-200" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Priority Queue</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Students to Work First</h2>
            </div>
            <Link to="/counselor/students" className="text-sm font-medium text-emerald-200 hover:text-white">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {priorityStudents.length > 0 ? priorityStudents.map((student) => (
              <div key={student.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{student.name || 'Student'}</p>
                    <p className="text-sm text-emerald-50/60">{student.email}</p>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                    {stageLabels[student.pipeline_stage] || 'New Lead'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/40">Lead</p>
                    <p className="mt-1 text-sm font-semibold text-white">{student.lead_score || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/40">Strength</p>
                    <p className="mt-1 text-sm font-semibold text-white">{student.profile_strength_score || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/40">Docs</p>
                    <p className="mt-1 text-sm font-semibold text-white">{student.document_readiness?.score || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/40">Visa Risk</p>
                    <p className="mt-1 text-sm font-semibold text-white">{student.visa_risk_level || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-emerald-50/60">
                No assigned students yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Pipeline Snapshot</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Applications by Stage</h2>
            <div className="mt-5 space-y-3">
              {['draft', 'submitted', 'under_review', 'accepted', 'visa_processing'].map((status) => (
                <div key={status} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <p className="text-sm text-emerald-50/70">{status.replace('_', ' ')}</p>
                  <span className="text-sm font-semibold text-white">{applicationsByStatus[status] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-amber-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Follow-Ups</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Upcoming Deadlines</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {followUps.length > 0 ? followUps.map((application) => (
                <div key={application.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="font-medium text-white">{application.programs?.name || 'Program'}</p>
                  <p className="mt-1 text-sm text-emerald-50/60">
                    {application.profiles?.name || 'Student'} • {application.programs?.universities?.name}
                  </p>
                  <p className="mt-2 text-sm text-amber-200">
                    {application.deadline_snapshot?.application_days_left} days left to deadline
                  </p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-emerald-50/60">
                  No near-term application deadlines right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;
