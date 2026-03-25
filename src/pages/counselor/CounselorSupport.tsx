import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, MessageSquare, Clock, CheckCircle, AlertCircle, Send, ArrowUpRight } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const statusMeta: Record<string, { label: string; tone: string; icon: any }> = {
  open: { label: 'New', tone: 'bg-emerald-100 text-emerald-700', icon: MessageSquare },
  in_progress: { label: 'In Progress', tone: 'bg-sky-100 text-sky-700', icon: Clock },
  escalated: { label: 'Escalated to Admin', tone: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  resolved: { label: 'Resolved', tone: 'bg-slate-100 text-slate-700', icon: CheckCircle },
};

const CounselorSupport: React.FC = () => {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await api.get('/api/tickets');
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const data = await api.get(`/api/tickets/${ticketId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleOpenTicket = (ticket: any) => {
    setActiveTicket(ticket);
    fetchMessages(ticket.id);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    setSubmitting(true);
    try {
      const msg = await api.post(`/api/tickets/${activeTicket.id}/messages`, {
        content: replyText
      });
      
      // If the ticket was 'open', implicitly mark it 'in_progress' when the counselor replies
      if (activeTicket.status === 'open') {
         await api.put(`/api/tickets/${activeTicket.id}/status`, { status: 'in_progress' });
         setActiveTicket({ ...activeTicket, status: 'in_progress' });
         setTickets(tickets.map(t => t.id === activeTicket.id ? { ...t, status: 'in_progress' } : t));
      }

      setMessages([...messages, msg]);
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeTicket) return;
    try {
      await api.put(`/api/tickets/${activeTicket.id}/status`, { status: newStatus });
      setActiveTicket({ ...activeTicket, status: newStatus });
      setTickets(tickets.map(t => t.id === activeTicket.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) || 
    t.student?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-sky-100 bg-[#f8fafc] p-8 shadow-sm"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <HelpCircle className="w-4 h-4" /> Student Support
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Support Inbox</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Manage incoming queries from your students. Resolve them directly or escalate complex requests to the Admins.
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : activeTicket ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-0 overflow-hidden flex flex-col h-[650px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveTicket(null)}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                >
                  &larr; Back to inbox
                </button>
                <div className="flex items-center gap-3">
                  {activeTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {activeTicket.status !== 'escalated' && activeTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus('escalated')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Escalate to Admin
                    </button>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMeta[activeTicket.status]?.tone || 'bg-slate-100'}`}>
                    {statusMeta[activeTicket.status]?.label || activeTicket.status}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{activeTicket.subject}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Opened by <span className="font-semibold">{activeTicket.student?.name || 'Student'}</span> on {new Date(activeTicket.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/40">
              {messages.length === 0 ? (
                 <div className="flex justify-center items-center h-full"><LoadingSpinner size="md" /></div>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.sender_id === profile?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-500">
                           {isMe ? 'You' : (msg.sender_role === 'student' ? (activeTicket.student?.name || 'Student') : 'Admin')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                        isMe 
                          ? 'bg-sky-500 text-white rounded-br-sm' 
                          : msg.sender_role === 'admin' 
                            ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap text-[15px]">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Area */}
            {activeTicket.status !== 'resolved' && (
              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={activeTicket.status === 'escalated' ? "Reply to student or admin..." : "Reply to student..."}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || submitting}
                    className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </form>
              </div>
            )}
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by subject or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-slate-200 border-dashed">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No student support tickets yet.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const StatusIcon = statusMeta[ticket.status]?.icon || MessageSquare;
                return (
                  <GlassCard 
                    key={ticket.id} 
                    className="p-5 cursor-pointer hover:border-sky-300 transition-colors"
                    onClick={() => handleOpenTicket(ticket)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`p-3 rounded-xl ${statusMeta[ticket.status]?.tone || 'bg-slate-100 text-slate-600'}`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{ticket.subject}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 truncate mt-1">
                            <span className="font-medium text-slate-700">{ticket.student?.name || 'Student'}</span>
                            <span>•</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-1.5 rounded-md text-xs font-medium tracking-wide ${
                            statusMeta[ticket.status]?.tone || 'bg-slate-100 text-slate-700'
                          }`}>
                            {statusMeta[ticket.status]?.label || ticket.status}
                          </span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorSupport;
