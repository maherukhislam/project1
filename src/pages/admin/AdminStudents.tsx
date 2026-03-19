import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Phone,
  MapPin,
  GraduationCap,
  X,
  Mail,
  FileText,
  Calendar,
  Eye,
  User,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import supabase from '../../lib/supabase';

const stageOrder = ['new_lead', 'profile_ready', 'applied', 'review', 'visa'] as const;

const stageMeta: Record<string, { label: string; tone: string; description: string }> = {
  new_lead: {
    label: 'New lead',
    tone: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    description: 'Needs profile completion'
  },
  profile_ready: {
    label: 'Profile ready',
    tone: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Ready for application planning'
  },
  applied: {
    label: 'Applied',
    tone: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    description: 'At least one draft or submitted case'
  },
  review: {
    label: 'Under review',
    tone: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Waiting on counselor or school feedback'
  },
  visa: {
    label: 'Visa stage',
    tone: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Accepted or in visa processing'
  }
};

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<(typeof stageOrder)[number] | 'all'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'applications'>('profile');
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, docsData, appsData] = await Promise.all([
          api.get('/api/admin/students'),
          api.get('/api/documents', { minimal: '1' }),
          api.get('/api/applications', { minimal: '1' })
        ]);

        setStudents(studentsData);
        setDocuments(docsData);
        setApplications(appsData);
        setSelectedStudent((current: any) => current || studentsData?.[0] || null);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedStudent && students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const applicationsByUser = applications.reduce((acc: Record<string, any[]>, app: any) => {
    (acc[app.user_id] ||= []).push(app);
    return acc;
  }, {});

  const documentsByUser = documents.reduce((acc: Record<string, any[]>, doc: any) => {
    (acc[doc.user_id] ||= []).push(doc);
    return acc;
  }, {});

  const getStage = (student: any) => {
    const studentApps = applicationsByUser[student.user_id] || [];
    const completion = student.profile_completion || 0;

    if (studentApps.some((app) => app.status === 'visa_processing')) return 'visa';
    if (studentApps.some((app) => app.status === 'accepted')) return 'visa';
    if (studentApps.some((app) => ['submitted', 'under_review'].includes(app.status))) return 'review';
    if (studentApps.length > 0) return 'applied';
    if (completion >= 80) return 'profile_ready';
    return 'new_lead';
  };

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        !search ||
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase());
      const stage = getStage(student);
      const matchesStage = stageFilter === 'all' || stage === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => (b.profile_completion || 0) - (a.profile_completion || 0));

  const selectedApps = selectedStudent ? (applicationsByUser[selectedStudent.user_id] || []) : [];
  const selectedDocs = selectedStudent ? (documentsByUser[selectedStudent.user_id] || []) : [];
  const selectedStage = selectedStudent ? getStage(selectedStudent) : 'new_lead';

  const totalStudents = students.length;
  const readyStudents = students.filter((student) => (student.profile_completion || 0) >= 80).length;
  const activeApplicants = students.filter((student) => (applicationsByUser[student.user_id] || []).length > 0).length;
  const needsAttention = students.filter((student) => (student.profile_completion || 0) < 60 && !(applicationsByUser[student.user_id] || []).length).length;

  const updateApplicationStatus = async (appId: number, status: string) => {
    try {
      await api.put('/api/applications', { id: appId, status });
      setApplications((current) =>
        current.map((app) => (app.id === appId ? { ...app, status } : app))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const downloadStudentPdf = async () => {
    if (!selectedStudent?.user_id) return;
    setDownloadingReport(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Unauthorized');

      const response = await fetch(`/api/admin/students-report?user_id=${encodeURIComponent(selectedStudent.user_id)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to generate report');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(selectedStudent.name || 'student').replace(/[^\w.-]/g, '_')}-profile-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
    } finally {
      setDownloadingReport(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'under_review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'visa_processing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'submitted':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              CRM view
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Leads / Students</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Track each student from profile completion to application progress in a single admissions pipeline.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-bold text-white">{totalStudents}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ready</p>
              <p className="mt-2 text-2xl font-bold text-white">{readyStudents}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Applied</p>
              <p className="mt-2 text-2xl font-bold text-white">{activeApplicants}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Needs help</p>
              <p className="mt-2 text-2xl font-bold text-white">{needsAttention}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {['all', ...stageOrder].map((stage) => {
          const meta = stage === 'all' ? null : stageMeta[stage];
          const isActive = stageFilter === stage;

          return (
            <button
              key={stage}
              onClick={() => setStageFilter(stage as any)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {stage === 'all' ? 'All Leads' : meta?.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.85fr]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 pl-12 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-3">
            {filteredStudents.length > 0 ? filteredStudents.map((student, index) => {
              const stage = getStage(student);
              const stageInfoItem = stageMeta[stage];
              const studentApps = applicationsByUser[student.user_id] || [];
              const studentDocs = documentsByUser[student.user_id] || [];

              return (
                <motion.button
                  key={student.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    setSelectedStudent(student);
                    setActiveTab('profile');
                  }}
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    selectedStudent?.id === student.id
                      ? 'border-sky-500/40 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-base font-semibold text-white">
                        {student.profile_picture_url ? (
                          <img src={student.profile_picture_url} alt={student.name || 'Student'} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          student.name?.charAt(0) || 'S'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{student.name || 'Unknown student'}</p>
                        <p className="text-sm text-slate-400">{student.email}</p>
                      </div>
                    </div>

                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${stageInfoItem.tone}`}>
                      {stageInfoItem.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Profile</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                            style={{ width: `${student.profile_completion || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-300">{student.profile_completion || 0}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Applications</p>
                      <p className="mt-2 text-sm font-semibold text-white">{studentApps.length}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Documents</p>
                      <p className="mt-2 text-sm font-semibold text-white">{studentDocs.length}</p>
                    </div>
                  </div>
                </motion.button>
              );
            }) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-12 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-slate-600" />
                <p className="text-slate-400">No students found</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {selectedStudent ? (
            <div className="rounded-3xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              <div className="border-b border-slate-700 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-lg font-bold text-white">
                      {selectedStudent.profile_picture_url ? (
                        <img src={selectedStudent.profile_picture_url} alt={selectedStudent.name || 'Student'} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        selectedStudent.name?.charAt(0) || 'S'
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{selectedStudent.name}</p>
                      <p className="text-sm text-slate-400">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadStudentPdf}
                    disabled={downloadingReport}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/20 disabled:opacity-70"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloadingReport ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${selectedStage ? stageMeta[selectedStage].tone : 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                    {selectedStage ? stageMeta[selectedStage].label : 'New lead'}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                    Profile {selectedStudent.profile_completion || 0}%
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                    {applicationsByUser[selectedStudent.user_id]?.length || 0} applications
                  </span>
                </div>
              </div>

              <div className="flex border-b border-slate-700">
                {(['profile', 'documents', 'applications'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-sky-400 bg-sky-500/10 text-sky-300'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="max-h-[68vh] overflow-y-auto p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: User, label: 'Full Name', value: selectedStudent.name },
                        { icon: Mail, label: 'Email', value: selectedStudent.email },
                        { icon: Phone, label: 'Phone', value: selectedStudent.phone },
                        { icon: MapPin, label: 'Nationality', value: selectedStudent.nationality },
                        { icon: GraduationCap, label: 'Education Level', value: selectedStudent.education_level },
                        { icon: GraduationCap, label: 'Study Level', value: selectedStudent.study_level },
                        { icon: Calendar, label: 'Created', value: selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : '-' },
                        { icon: CheckCircle, label: 'Completion', value: `${selectedStudent.profile_completion || 0}%` },
                        { icon: FileText, label: 'Preferred Country', value: selectedStudent.preferred_country },
                        { icon: FileText, label: 'Preferred Subject', value: selectedStudent.preferred_subject },
                        {
                          icon: FileText,
                          label: 'Budget Range',
                          value:
                            selectedStudent.budget_min && selectedStudent.budget_max
                              ? `$${selectedStudent.budget_min.toLocaleString()} - $${selectedStudent.budget_max.toLocaleString()}`
                              : '-'
                        },
                        { icon: Clock, label: 'Intake', value: selectedStudent.intake }
                      ].map((item, i) => (
                        <div key={i} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <item.icon className="h-4 w-4" />
                            <p className="text-sm">{item.label}</p>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white">{item.value || 'Not provided'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    {selectedDocs.length > 0 ? selectedDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-8 w-8 text-slate-400" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">{doc.file_name}</p>
                            <p className="text-sm capitalize text-slate-400">{doc.document_type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                        <FileText className="mx-auto mb-3 h-12 w-12 text-slate-600" />
                        <p className="text-slate-400">No documents uploaded</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'applications' && (
                  <div className="space-y-4">
                    {selectedApps.length > 0 ? selectedApps.map((app) => (
                      <div key={app.id} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">{app.programs?.name || 'Program'}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              {app.programs?.universities?.name} • {app.programs?.universities?.country}
                            </p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status?.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          Applied {new Date(app.created_at).toLocaleDateString()}
                          {app.intake && <span>• Intake {app.intake}</span>}
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">
                            Update status
                          </label>
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                          >
                            {['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'visa_processing'].map((status) => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                        <FileText className="mx-auto mb-3 h-12 w-12 text-slate-600" />
                        <p className="text-slate-400">No applications yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-800/40 p-8 text-center text-slate-400">
              <Eye className="mx-auto mb-3 h-12 w-12 text-slate-600" />
              <p>Select a student to inspect their profile, documents, and applications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
