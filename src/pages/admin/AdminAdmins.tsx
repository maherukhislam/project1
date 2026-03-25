import React, { useEffect, useState } from 'react';
import { Shield, ShieldPlus, Mail, User, Copy, CheckCircle2, Briefcase, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import supabase, { supabaseEnabled } from '../../lib/supabase';

const AdminAdmins: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'counselor'>('counselor');
  const [preferredCountry, setPreferredCountry] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAdmins = async () => {
    try {
      const data = await api.get('/api/admin/admins');
      setTeamMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();

    if (!supabaseEnabled) return;

    // Listen for real-time presence updates on the profiles table
    const channel = supabase
      .channel('admin-presence')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setTeamMembers((prev) =>
            prev.map((member) => {
              if (member.user_id === payload.new.user_id) {
                return {
                  ...member,
                  is_online: payload.new.is_online,
                  last_seen_at: payload.new.last_seen_at,
                };
              }
              return member;
            })
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setTemporaryPassword('');

    try {
      const result = await api.post('/api/admin/admins', {
        name,
        email,
        role,
        preferred_country: role === 'counselor' ? preferredCountry : null,
        counselor_specializations: role === 'counselor' ? specializations : '',
        counselor_capacity: role === 'counselor' ? Number(capacity || 30) : 30,
        counselor_active: role === 'counselor' ? active : true
      });
      setSuccess(`${role === 'counselor' ? 'Counselor' : 'Admin'} account created for ${result.user.email}`);
      setTemporaryPassword(result.temporaryPassword || '');
      setName('');
      setEmail('');
      setPreferredCountry('');
      setSpecializations('');
      setCapacity('30');
      setActive(true);
      setRole('counselor');
      await fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to create team member');
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
        <h1 className="text-3xl font-bold text-white mb-2">Admin & Counselor Roles</h1>
        <p className="text-slate-400">Create operations users, set counselor capacity, and review the current team.</p>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldPlus className="w-5 h-5 text-sky-400" />
          Add team member
        </h2>

        <form onSubmit={createAdmin} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'counselor')}
              className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-white"
            >
              <option value="counselor">Counselor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

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

          {role === 'counselor' && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Preferred Country</label>
                <input
                  value={preferredCountry}
                  onChange={(e) => setPreferredCountry(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-white"
                  placeholder="United Kingdom"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Specializations</label>
                <input
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-white"
                  placeholder="United Kingdom, Business Administration, Canada"
                />
                <p className="mt-1 text-xs text-slate-500">Comma-separated countries or subject areas.</p>
              </div>

              <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                />
                Counselor is active for auto-assignment
              </label>
            </>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating...' : `Create ${role === 'counselor' ? 'Counselor' : 'Admin'}`}
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
          Team members
        </h2>

        {loading ? (
          <p className="text-slate-400">Loading team members...</p>
        ) : teamMembers.length === 0 ? (
          <p className="text-slate-400">No team members found.</p>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white font-medium">{member.name}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      member.role === 'counselor'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-sky-500/15 text-sky-300'
                    }`}>
                      {member.role}
                    </span>
                    {member.role === 'counselor' && (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        member.counselor_active === false
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {member.counselor_active === false ? 'inactive' : 'active'}
                      </span>
                    )}
                    {/* Real-time online presence status */}
                    <div className="flex items-center gap-1.5 ml-1">
                      <span className="relative flex h-2 w-2">
                        {member.is_online ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400">
                        {member.is_online ? 'Online' : (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {member.last_seen_at 
                              ? new Date(member.last_seen_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : 'Offline'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">{member.email}</p>
                  {member.role === 'counselor' && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      {member.preferred_country && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {member.preferred_country}
                        </span>
                      )}
                      <span className="rounded-full border border-slate-700 px-2 py-1">
                        Capacity {member.counselor_capacity || 30}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">{new Date(member.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdmins;
