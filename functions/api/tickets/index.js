import { createClient } from '@supabase/supabase-js';

// Helper to get authenticated Supabase client
const getSupabase = (env, request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const supabase = getSupabase(env, request);
  
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // RLS handles visibility (students see theirs, counselors see assigned, admins see all)
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      student:profiles!tickets_student_id_fkey(name, email)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(tickets), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const supabase = getSupabase(env, request);
  
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { subject, initial_message, priority = 'medium' } = await request.json();

    if (!subject || !initial_message) {
      return new Response(JSON.stringify({ error: 'Subject and message are required' }), { status: 400 });
    }

    // 1. Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([{
        student_id: user.id,
        subject,
        priority,
        status: 'open'
      }])
      .select()
      .single();

    if (ticketError) throw ticketError;

    // 2. Create initial message
    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert([{
        ticket_id: ticket.id,
        sender_id: user.id,
        content: initial_message
      }]);

    if (msgError) throw msgError;

    // Return the ticket with the student info so the UI can append it nicely
    const { data: completeTicket } = await supabase
      .from('tickets')
      .select('*, student:profiles!tickets_student_id_fkey(name, email)')
      .eq('id', ticket.id)
      .single();

    return new Response(JSON.stringify(completeTicket || ticket), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
