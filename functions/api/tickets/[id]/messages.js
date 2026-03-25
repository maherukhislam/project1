import { createClient } from '@supabase/supabase-js';

const getSupabase = (env, request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });
};

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const ticketId = params.id;
  const supabase = getSupabase(env, request);
  
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Use a stored procedure or manual join to get sender roles, or just rely on the frontend 
  // looking at the sender_id. To make it robust, we'll fetch sender roles from profiles.
  const { data: messages, error } = await supabase
    .from('ticket_messages')
    .select(`
      *,
      sender:profiles!ticket_messages_sender_id_fkey(name, role)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Format to match what the frontend expects (`msg.sender_role`)
  const formattedMessages = messages.map(msg => ({
    ...msg,
    sender_role: msg.sender?.role || 'student'
  }));

  return new Response(JSON.stringify(formattedMessages), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const ticketId = params.id;
  const supabase = getSupabase(env, request);
  
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    const { data: message, error: msgError } = await supabase
      .from('ticket_messages')
      .insert([{
        ticket_id: ticketId,
        sender_id: user.id,
        content
      }])
      .select('*, sender:profiles!ticket_messages_sender_id_fkey(name, role)')
      .single();

    if (msgError) throw msgError;

    // Also touch the ticket to update its updated_at column
    await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    const formattedMessage = {
      ...message,
      sender_role: message.sender?.role || 'student'
    };

    return new Response(JSON.stringify(formattedMessage), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
