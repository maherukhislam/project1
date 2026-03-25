import { createClient } from '@supabase/supabase-js';

const getSupabase = (env, request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });
};

export async function onRequestPut(context) {
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
    const { status } = await request.json();

    if (!status || !['open', 'in_progress', 'escalated', 'resolved'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Valid status is required' }), { status: 400 });
    }

    // Only Counselors and Admins should realistically be updating status to escalated or in_progress.
    // However, since RLS is enabled, the database policy will throw an error if the user
    // doesn't have permission to update THIS specific ticket.

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single();

    if (ticketError) throw ticketError;

    return new Response(JSON.stringify(ticket), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
