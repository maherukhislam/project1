import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, CheckCircle, Clock, AlertCircle, File, Image, FileSpreadsheet } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { type: 'passport', label: 'Passport', required: true },
    { type: 'academic_certificate', label: 'Academic Certificates', required: true },
    { type: 'transcript', label: 'Transcripts', required: true },
    { type: 'english_test', label: 'English Test Results', required: true },
    { type: 'cv', label: 'CV / Resume', required: true },
    { type: 'sop', label: 'Statement of Purpose', required: false },
    { type: 'recommendation', label: 'Recommendation Letters', required: false },
    { type: 'other', label: 'Other Documents', required: false }
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await api.get('/api/documents', { minimal: '1' });
        setDocuments(data);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleUpload = async (type: string, file: File) => {
    setUploading(true);
    try {
      // In production, this would upload to R2/S3 first
      const fakeUrl = `https://storage.example.com/${Date.now()}-${file.name}`;
      
      await api.post('/api/documents', {
        document_type: type,
        file_name: file.name,
        file_url: fakeUrl,
        file_size: file.size
      });

      // Refresh documents
      const data = await api.get('/api/documents', { minimal: '1' });
      setDocuments(data);
    } catch (err) {
      console.error('Failed to upload document:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await api.delete('/api/documents', { id });
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return Image;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes: number) => {
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

  const uploadedTypes = documents.map(d => d.document_type);
  const completedCount = documentTypes.filter(dt => dt.required && uploadedTypes.includes(dt.type)).length;
  const requiredCount = documentTypes.filter(dt => dt.required).length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Documents</h1>
        <p className="text-slate-600">Upload and manage your application documents</p>
      </motion.div>

      {/* Progress */}
      <GlassCard className="p-6 mb-8" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Document Completion</h2>
          <span className="text-sky-600 font-semibold">{completedCount}/{requiredCount} Required</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all"
            style={{ width: `${(completedCount / requiredCount) * 100}%` }}
          />
        </div>
      </GlassCard>

      {/* Document Types */}
      <div className="grid md:grid-cols-2 gap-6">
        {documentTypes.map((docType, i) => {
          const uploaded = documents.filter(d => d.document_type === docType.type);
          
          return (
            <motion.div
              key={docType.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{docType.label}</h3>
                    <span className={`text-xs ${docType.required ? 'text-red-500' : 'text-slate-500'}`}>
                      {docType.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  {uploaded.length > 0 && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {/* Uploaded Files */}
                {uploaded.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {uploaded.map(doc => {
                      const FileIcon = getFileIcon(doc.file_name);
                      return (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-slate-100">
                          <FileIcon className="w-8 h-8 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(doc.file_size || 0)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(docType.type, file);
                    }}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-600">Upload {uploaded.length > 0 ? 'Another' : ''} File</span>
                    </>
                  )}
                </label>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Documents;
