import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, MapPin, GraduationCap, X, Mail, FileText, Calendar, Eye, User } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'applications'>('profile');
  const [studentDocs, setStudentDocs] = useState<any[]>([]);
  const [studentApps, setStudentApps] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await api.get('/api/admin/students');
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const viewStudent = async (student: any) => {
    setSelectedStudent(student);
    setActiveTab('profile');
    
    // Fetch student's documents and applications
    try {
      const [docs, apps] = await Promise.all([
        api.get('/api/documents', { user_id: student.user_id }),
        api.get('/api/applications')
      ]);
      setStudentDocs(docs);
      // Filter apps for this student
      setStudentApps(apps.filter((a: any) => a.user_id === student.user_id));
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    }
  };

  const updateApplicationStatus = async (appId: number, status: string) => {
    try {
      await api.put('/api/applications', { id: appId, status });
      // Refresh applications
      const apps = await api.get('/api/applications');
      setStudentApps(apps.filter((a: any) => a.user_id === selectedStudent.user_id));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'under_review': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'visa_processing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-amber-400';
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
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
          <p className="text-slate-400">Manage registered students ({students.length} total)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none w-full md:w-80"
          />
        </div>
      </motion.div>

      {/* Students Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Student</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden md:table-cell">Nationality</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden lg:table-cell">Preferred Country</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden lg:table-cell">Study Level</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Profile</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{student.name || 'Unknown'}</p>
                        <p className="text-slate-400 text-sm">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 hidden md:table-cell">
                    {student.nationality || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-300 hidden lg:table-cell">
                    {student.preferred_country || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-300 hidden lg:table-cell">
                    {student.study_level || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"
                          style={{ width: `${student.profile_completion || 0}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm">{student.profile_completion || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => viewStudent(student)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No students found</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedStudent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-800 border border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                    {selectedStudent.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
                    <p className="text-slate-400">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-700">
                {['profile', 'documents', 'applications'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {activeTab === 'profile' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: User, label: 'Full Name', value: selectedStudent.name },
                      { icon: Mail, label: 'Email', value: selectedStudent.email },
                      { icon: Phone, label: 'Phone', value: selectedStudent.phone },
                      { icon: MapPin, label: 'Nationality', value: selectedStudent.nationality },
                      { icon: GraduationCap, label: 'Education Level', value: selectedStudent.education_level },
                      { icon: GraduationCap, label: 'Study Level', value: selectedStudent.study_level },
                      { label: 'GPA', value: selectedStudent.gpa },
                      { label: 'English Score', value: `${selectedStudent.english_score || '-'} (${selectedStudent.english_test_type || '-'})` },
                      { label: 'Preferred Country', value: selectedStudent.preferred_country },
                      { label: 'Preferred Subject', value: selectedStudent.preferred_subject },
                      { label: 'Budget Range', value: selectedStudent.budget_min && selectedStudent.budget_max ? `$${selectedStudent.budget_min.toLocaleString()} - $${selectedStudent.budget_max.toLocaleString()}` : '-' },
                      { label: 'Intake', value: selectedStudent.intake }
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-700/30">
                        <p className="text-slate-400 text-sm mb-1">{item.label}</p>
                        <p className="text-white font-medium">{item.value || 'Not provided'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    {studentDocs.length > 0 ? studentDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="text-white font-medium">{doc.file_name}</p>
                            <p className="text-slate-400 text-sm capitalize">{doc.document_type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium capitalize ${getDocStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No documents uploaded</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'applications' && (
                  <div className="space-y-4">
                    {studentApps.length > 0 ? studentApps.map((app) => (
                      <div key={app.id} className="p-4 rounded-xl bg-slate-700/30">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{app.programs?.name || 'Program'}</p>
                            <p className="text-slate-400 text-sm">{app.programs?.universities?.name} • {app.programs?.universities?.country}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                            {app.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                          <Calendar className="w-4 h-4" />
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                          {app.intake && <span>• Intake: {app.intake}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-slate-400 text-sm">Update Status:</span>
                          {['submitted', 'under_review', 'accepted', 'rejected', 'visa_processing'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateApplicationStatus(app.id, status)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                app.status === status
                                  ? getStatusColor(status)
                                  : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              {status.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No applications yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudents;
