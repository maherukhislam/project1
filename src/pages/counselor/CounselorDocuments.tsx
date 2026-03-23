import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import supabase from '../../lib/supabase';
import { generateStudentPdf } from '../../lib/generateStudentPdf';

const documentTypes = [
  { type: 'passport', label: 'Passport' },
  { type: 'academic_certificate', label: 'Academic Certificates' },
  { type: 'transcript', label: 'Transcripts' },
  { type: 'english_test', label: 'English Test Results' },
  { type: 'cv', label: 'CV / Resume' },
  { type: 'sop', label: 'Statement of Purpose' },
  { type: 'recommendation', label: 'Recommendation Letters' },
  { type: 'other', label: 'Other Documents' }
];

const CounselorDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsData, studentsData, appsData] = await Promise.all([
          api.get('/api/documents', { minimal: '1' }),
          api.get('/api/admin/students', { minimal: '1' }),
          api.get('/api/applications', { minimal: '1' })
        ]);
        
        setDocuments(docsData.map((doc: any) => ({
          ...doc,
          student: doc.profiles || null
        })));
        setStudents(studentsData || []);
        setApplications(appsData || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const documentsByUser = useMemo(() =>
    documents.reduce((acc: Record<string, any[]>, doc: any) => {
      (acc[doc.user_id] ||= []).push(doc);
      return acc;
    }, {}),
  [documents]);

  const applicationsByUser = useMemo(() =>
    applications.reduce((acc: Record<string, any[]>, app: any) => {
      (acc[app.user_id] ||= []).push(app);
      return acc;
    }, {}),
  [applications]);

  const updateDocStatus = async (id: number, status: string) => {
    try {
      await api.put('/api/documents', { id, status });
      setDocuments(documents.map(doc => 
        doc.id === id ? { ...doc, status } : doc
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const downloadStudentPdf = async (student: any) => {
    if (!student?.user_id) return;
    setDownloadingPdf(student.user_id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';

      const studentDocs = documentsByUser[student.user_id] || [];
      const studentApps = applicationsByUser[student.user_id] || [];

      const pdfBytes = await generateStudentPdf(
        student,
        studentDocs,
        studentApps,
        token,
      );

      const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `${(student.name || 'student').replace(/[^\w.-]/g, '_')}-studyglobal-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = !search || 
        doc.file_name?.toLowerCase().includes(search.toLowerCase()) ||
        doc.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        doc.student?.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || doc.status === statusFilter;
      const matchesType = !typeFilter || doc.document_type === typeFilter;
      const matchesStudent = !studentFilter || doc.user_id === studentFilter;
      return matchesSearch && matchesStatus && matchesType && matchesStudent;
    });
  }, [documents, search, statusFilter, typeFilter, studentFilter]);

  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    verified: documents.filter(d => d.status === 'verified').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
    uniqueStudents: new Set(documents.map(d => d.user_id)).size
  }), [documents]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Document Review
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Student Documents</h1>
            <p className="mt-2 max-w-2xl text-emerald-50/70">
              Review and verify documents uploaded by your assigned students.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:min-w-[520px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/60">Total</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-400">Pending</p>
              <p className="mt-2 text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">Verified</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.verified}</p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-red-400">Rejected</p>
              <p className="mt-2 text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/60">Students</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.uniqueStudents}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-50/40" />
          <input
            type="text"
            placeholder="Search by file name or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-emerald-50/40 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none min-w-[180px]"
        >
          <option value="">All Types</option>
          {documentTypes.map(dt => (
            <option key={dt.type} value={dt.type}>{dt.label}</option>
          ))}
        </select>
        <select
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none min-w-[180px]"
        >
          <option value="">All Students</option>
          {students.map(s => (
            <option key={s.user_id} value={s.user_id}>{s.name || s.email}</option>
          ))}
        </select>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Documents Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-emerald-50/60 font-medium text-sm">Document</th>
                  <th className="text-left px-6 py-4 text-emerald-50/60 font-medium text-sm">Student</th>
                  <th className="text-left px-6 py-4 text-emerald-50/60 font-medium text-sm hidden md:table-cell">Type</th>
                  <th className="text-left px-6 py-4 text-emerald-50/60 font-medium text-sm hidden lg:table-cell">Size</th>
                  <th className="text-left px-6 py-4 text-emerald-50/60 font-medium text-sm">Status</th>
                  <th className="text-left px-6 py-4 text-emerald-50/60 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-[200px]">{doc.file_name}</p>
                          <p className="text-emerald-50/40 text-sm md:hidden capitalize">
                            {doc.document_type?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          const student = students.find(s => s.user_id === doc.user_id);
                          if (student) setSelectedStudent(student);
                        }}
                        className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                          {doc.student?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="text-emerald-50/80 hover:text-emerald-300">{doc.student?.name || 'Unknown'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-emerald-50/70 text-sm capitalize">
                        {doc.document_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-50/60 hidden lg:table-cell">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-sm font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {doc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateDocStatus(doc.id, 'verified')}
                              className="p-2 rounded-lg hover:bg-emerald-500/20 text-emerald-50/60 hover:text-emerald-400 transition-colors"
                              title="Verify"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateDocStatus(doc.id, 'rejected')}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-emerald-50/60 hover:text-red-400 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-white/10 text-emerald-50/60 hover:text-emerald-400 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-emerald-50/20 mx-auto mb-3" />
              <p className="text-emerald-50/60">No documents found</p>
              <p className="text-emerald-50/40 text-sm mt-1">
                {search || statusFilter || typeFilter || studentFilter 
                  ? 'Try adjusting your filters' 
                  : 'No documents uploaded yet'}
              </p>
            </div>
          )}
        </div>

        {/* Student Detail Panel */}
        {selectedStudent ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 h-fit"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white">
                    {selectedStudent.profile_picture_url ? (
                      <img src={selectedStudent.profile_picture_url} alt={selectedStudent.name || 'Student'} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      selectedStudent.name?.charAt(0) || 'S'
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{selectedStudent.name || 'Student'}</p>
                  <p className="text-sm text-emerald-50/60">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1.5 text-emerald-50/40 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 mb-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-emerald-50/40" />
                  <a href={`mailto:${selectedStudent.email}`} className="text-emerald-50/70 hover:text-emerald-300">
                    {selectedStudent.email}
                  </a>
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-emerald-50/40" />
                    <a href={`tel:${selectedStudent.phone}`} className="text-emerald-50/70 hover:text-emerald-300">
                      {selectedStudent.phone}
                    </a>
                  </div>
                )}
                {(selectedStudent.country || selectedStudent.nationality) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-emerald-50/40" />
                    <span className="text-emerald-50/70">
                      {selectedStudent.country || selectedStudent.nationality}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Stats */}
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 mb-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Document Summary
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  const studentDocs = documentsByUser[selectedStudent.user_id] || [];
                  const pending = studentDocs.filter(d => d.status === 'pending').length;
                  const verified = studentDocs.filter(d => d.status === 'verified').length;
                  const rejected = studentDocs.filter(d => d.status === 'rejected').length;
                  return (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400">{pending}</p>
                        <p className="text-xs text-emerald-50/40 uppercase">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-400">{verified}</p>
                        <p className="text-xs text-emerald-50/40 uppercase">Verified</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{rejected}</p>
                        <p className="text-xs text-emerald-50/40 uppercase">Rejected</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Profile Stats */}
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 mb-4">
              <h3 className="text-sm font-semibold text-white mb-3">Profile Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-emerald-50/40 text-xs uppercase">Completion</p>
                  <p className="text-white font-semibold">{selectedStudent.profile_completion || 0}%</p>
                </div>
                <div>
                  <p className="text-emerald-50/40 text-xs uppercase">Study Level</p>
                  <p className="text-white font-semibold">{selectedStudent.study_level || '-'}</p>
                </div>
                <div>
                  <p className="text-emerald-50/40 text-xs uppercase">Preferred Country</p>
                  <p className="text-white font-semibold">{selectedStudent.preferred_country || '-'}</p>
                </div>
                <div>
                  <p className="text-emerald-50/40 text-xs uppercase">Preferred Subject</p>
                  <p className="text-white font-semibold">{selectedStudent.preferred_subject || '-'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => downloadStudentPdf(selectedStudent)}
                disabled={downloadingPdf === selectedStudent.user_id}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
              >
                {downloadingPdf === selectedStudent.user_id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF Report
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center h-fit">
            <User className="mx-auto h-12 w-12 text-emerald-50/20" />
            <p className="mt-4 text-lg font-medium text-emerald-50/60">Select a student</p>
            <p className="mt-1 text-sm text-emerald-50/40">
              Click on a student name to view their details and download their report
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorDocuments;
