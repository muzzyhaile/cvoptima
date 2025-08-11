// NOTE: Browser OpenAI usage removed for security. We now call Supabase Edge Function.
// Kept types.

interface CVAnalysisResponse {
  recommendations: {
    type: "keyword" | "phrase" | "structure" | "achievement";
    original: string;
    suggested: string;
    reason: string;
    applied: boolean;
  }[];
  optimizedCV: string;
  jobSummary?: string;
}

const getFunctionsUrl = () => {
  const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!base) return null;
  return base.replace(/\/$/, '');
};

export async function analyzeCVWithJob(cvText: string, jobUrl: string): Promise<CVAnalysisResponse> {
  const base = getFunctionsUrl();
  if (!base) throw new Error('Missing VITE_SUPABASE_FUNCTIONS_URL');

  const resp = await fetch(`${base}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText, jobUrl }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `Edge Function error ${resp.status}`);
  }

  return await resp.json();
}
