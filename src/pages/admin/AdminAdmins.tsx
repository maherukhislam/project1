import React, { useEffect, useState } from 'react';
import { Shield, ShieldPlus, Mail, User, Copy, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

const AdminAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAdmins = async () => {
    try {
      const data = await api.get('/api/admin/admins');
      setAdmins(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setTemporaryPassword('');

    try {
      const result = await api.post('/api/admin/admins', { name, email });
      setSuccess(`Admin account created for ${result.user.email}`);
      setTemporaryPassword(result.temporaryPassword || '');
      setName('');
      setEmail('');
      await fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = async () => {
    if (!temporaryPassword) return;
    await navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Management</h1>
        <p className="text-slate-400">Create additional admin accounts and review current admins.</p>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldPlus className="w-5 h-5 text-sky-400" />
          Add new admin
        </h2>

        <form onSubmit={createAdmin} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900/70 border border-slate-700 pl-10 pr-3 py-2.5 text-white"
                placeholder="Admin Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900/70 border border-slate-700 pl-10 pr-3 py-2.5 text-white"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-emerald-400 mt-4">{success}</p>}

        {temporaryPassword && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
            <p className="font-semibold">Temporary password (share securely):</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <code className="bg-slate-900/80 px-3 py-1.5 rounded-lg">{temporaryPassword}</code>
              <button onClick={copyPassword} type="button" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-400/40 hover:bg-amber-400/10">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Existing admins
        </h2>

        {loading ? (
          <p className="text-slate-400">Loading admins...</p>
        ) : admins.length === 0 ? (
          <p className="text-slate-400">No admin accounts found.</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{admin.name}</p>
                  <p className="text-slate-400 text-sm">{admin.email}</p>
                </div>
                <p className="text-xs text-slate-500">{new Date(admin.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdmins;
