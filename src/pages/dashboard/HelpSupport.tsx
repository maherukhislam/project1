import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Plus, Search, MessageSquare, Clock, CheckCircle, AlertCircle, X, Send } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const statusMeta: Record<string, { label: string; tone: string; icon: any }> = {
  open: { label: 'Open', tone: 'bg-emerald-100 text-emerald-700', icon: MessageSquare },
  in_progress: { label: 'In Progress', tone: 'bg-sky-100 text-sky-700', icon: Clock },
  escalated: { label: 'Escalated to Admin', tone: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  resolved: { label: 'Resolved', tone: 'bg-slate-100 text-slate-700', icon: CheckCircle },
};

const HelpSupport: React.FC = () => {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // we'll create an api endpoint or just hit the table if RLS is setup properly
      // For now, let's assume standard api.get('/api/tickets')
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newTicket = await api.post('/api/tickets', {
        subject: newSubject,
        initial_message: newMessage,
        priority: 'medium'
      });
      setTickets([newTicket, ...tickets]);
      setShowNewModal(false);
      setNewSubject('');
      setNewMessage('');
      handleOpenTicket(newTicket);
    } catch (err) {
      console.error('Failed to create ticket', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    setSubmitting(true);
    try {
      const msg = await api.post(`/api/tickets/${activeTicket.id}/messages`, {
        content: replyText
      });
      setMessages([...messages, msg]);
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.95))] p-8 shadow-[0_24px_70px_rgba(14,116,144,0.1)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              <HelpCircle className="w-4 h-4" /> Priority Support
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Help & Support</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Need assistance with your application or visa? Open a ticket to chat directly with your assigned counselor or our admin team.
            </p>
          </div>
          
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : activeTicket ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-0 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div>
                <button 
                  onClick={() => setActiveTicket(null)}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700 mb-2 inline-flex items-center gap-1"
                >
                  &larr; Back to all tickets
                </button>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{activeTicket.subject}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMeta[activeTicket.status]?.tone || 'bg-slate-100'}`}>
                    {statusMeta[activeTicket.status]?.label || activeTicket.status}
                  </span>
                </div>
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
                          {isMe ? 'You' : (msg.sender_role === 'counselor' ? 'Counselor' : 'Support Team')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                        isMe 
                          ? 'bg-sky-500 text-white rounded-br-sm' 
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
                    placeholder="Type your message..."
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
              placeholder="Search past tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96 pl-12 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-slate-200 border-dashed">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No tickets found.</p>
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
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${statusMeta[ticket.status]?.tone || 'bg-slate-100 text-slate-600'}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-slate-900 truncate pr-4">{ticket.subject}</h3>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                            statusMeta[ticket.status]?.tone || 'bg-slate-100 text-slate-700'
                          }`}>
                            {statusMeta[ticket.status]?.label || ticket.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
          >
            <button 
              onClick={() => setShowNewModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create Support Ticket</h2>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Need help with Visa Application"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 outline-none transition-colors resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newSubject || !newMessage}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
