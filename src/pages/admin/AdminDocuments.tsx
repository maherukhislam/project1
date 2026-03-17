import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const docs = await api.get('/api/documents', { minimal: '1' });
      setDocuments(docs.map((doc: any) => ({
        ...doc,
        student: doc.profiles || null
      })));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !search || 
      doc.file_name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.student?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesType = !typeFilter || doc.document_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-amber-500/20 text-amber-400';
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
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
        <p className="text-slate-400">Review and verify student uploaded documents ({documents.length} total)</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-sky-500 outline-none min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-sky-500 outline-none min-w-[180px]"
        >
          <option value="">All Types</option>
          {documentTypes.map(dt => (
            <option key={dt.type} value={dt.type}>{dt.label}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Document</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Student</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium hidden lg:table-cell">Size</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate max-w-[200px]">{doc.file_name}</p>
                        <p className="text-slate-400 text-sm md:hidden capitalize">
                          {doc.document_type?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                        {doc.student?.name?.charAt(0) || 'S'}
                      </div>
                      <span className="text-slate-300">{doc.student?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-sm capitalize">
                      {doc.document_type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 hidden lg:table-cell">
                    {formatFileSize(doc.file_size)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${getStatusColor(doc.status)}`}>
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
                            className="p-2 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-colors"
                            title="Verify"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateDocStatus(doc.id, 'rejected')}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
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
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
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
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocuments;
