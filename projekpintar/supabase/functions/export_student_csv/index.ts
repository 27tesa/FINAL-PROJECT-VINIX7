import { createClient } from '@supabase/supabase-js';

// Supabase Edge Function template.
// Jika ingin deploy sebagai Supabase Edge Function, gunakan runtime Deno terpisah.
// File ini disimpan di proyek agar referensi fungsi tersedia, tetapi dibuat agar valid TypeScript
// untuk pekerjaan lokal dan tidak memicu diagnostics Deno di editor.

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRole);

export async function exportStudentCsv(req: any) {
  try {
    let userId: string | null = null;
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      userId = url.searchParams.get('user_id');
    } else {
      try {
        const body = await req.json();
        userId = body?.user_id ?? null;
      } catch (_) {
        // ignore invalid JSON
      }
    }

    if (!userId) {
      return {
        status: 400,
        body: 'Missing user_id',
      };
    }

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('quiz_set_id, score, total_questions, created_at, quiz_set:quiz_sets(id, subject:subjects(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const header = ['quiz_set_id', 'subject', 'score', 'total_questions', 'created_at'];
    const rows = (attempts ?? []).map((a: any) => [
      a.quiz_set_id,
      a.quiz_set?.subject?.name ?? 'Umum',
      a.score,
      a.total_questions,
      a.created_at,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.map((v) => '"' + String(v ?? '') + '"').join(','))].join('\n');

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${userId}-attempts.csv"`,
      },
      body: csv,
    };
  } catch (err) {
    return {
      status: 500,
      body: String(err),
    };
  }
}
