import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, MessageSquare, Clock, CheckCircle, AlertCircle, Send, ArrowDownRight } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';

const statusMeta: Record<string, { label: string; tone: string; icon: any }> = {
  open: { label: 'New', tone: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: MessageSquare },
  in_progress: { label: 'In Progress', tone: 'bg-sky-500/20 text-sky-300 border-sky-500/30', icon: Clock },
  escalated: { label: 'Escalated', tone: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: AlertCircle },
  resolved: { label: 'Resolved', tone: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: CheckCircle },
};

const AdminSupport: React.FC = () => {
  // Removed unused profile
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
      // Fetch all tickets across the system for admins
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
      
      // If the ticket was escalated, we might want to keep it escalated or move to in-progress depending on the workflow.
      // Assuming Admin replies mean it's being handled:
      if (activeTicket.status === 'escalated' || activeTicket.status === 'open') {
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
        className="rounded-3xl border border-slate-700 bg-slate-800/50 p-6 shadow-sm"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              <HelpCircle className="w-4 h-4" /> Global Support
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">System Tickets</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Oversee all student queries network-wide and handle escalated issues from counselors.
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
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 overflow-hidden flex flex-col h-[650px] shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex flex-col gap-4 shrink-0">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveTicket(null)}
                  className="text-sm font-medium text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                >
                  &larr; Back to queue
                </button>
                <div className="flex items-center gap-3">
                  {activeTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {activeTicket.status === 'escalated' && (
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 text-sky-300 transition-colors"
                    >
                      <ArrowDownRight className="w-4 h-4" /> De-escalate
                    </button>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusMeta[activeTicket.status]?.tone || 'bg-slate-500/20 border-slate-500/30 text-slate-300'}`}>
                    {statusMeta[activeTicket.status]?.label || activeTicket.status}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{activeTicket.subject}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                  <span className="font-semibold text-slate-300">{activeTicket.student?.name || 'Student'}</span>
                   • 
                  <span>{new Date(activeTicket.created_at).toLocaleDateString()}</span>
                   • 
                  <span>Priority: <span className="capitalize">{activeTicket.priority}</span></span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
              {messages.length === 0 ? (
                 <div className="flex justify-center items-center h-full"><LoadingSpinner size="md" /></div>
              ) : (
                messages.map((msg: any) => {
                  const isAdmin = msg.sender_role === 'admin';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400">
                           {isAdmin ? 'Admin (You)' : (msg.sender_role === 'counselor' ? 'Counselor' : (activeTicket.student?.name || 'Student'))}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                        isAdmin 
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-sm' 
                          : msg.sender_role === 'counselor'
                            ? 'bg-slate-700/80 border border-slate-600 text-slate-200 rounded-bl-sm shadow-sm'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-bl-sm shadow-sm'
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
              <div className="p-4 border-t border-slate-700 bg-slate-800 shrink-0">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Provide admin override or response..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || submitting}
                    className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                    Reply All
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search all tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 pl-12 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No support tickets in the system.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const StatusIcon = statusMeta[ticket.status]?.icon || MessageSquare;
                return (
                  <div 
                    key={ticket.id} 
                    className="p-5 cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors"
                    onClick={() => handleOpenTicket(ticket)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`p-3 rounded-xl border ${statusMeta[ticket.status]?.tone || 'bg-slate-500/20 border-slate-500/30 text-slate-400'}`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white truncate pr-4">{ticket.subject}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 truncate mt-1">
                            <span className="font-medium text-slate-300">{ticket.student?.name || 'Student'}</span>
                            <span>•</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-1.5 rounded-md text-xs font-medium tracking-wide border ${
                            statusMeta[ticket.status]?.tone || 'bg-slate-500/20 border-slate-500/30 text-slate-300'
                          }`}>
                            {statusMeta[ticket.status]?.label || ticket.status}
                          </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
