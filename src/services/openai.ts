// NOTE: Browser OpenAI usage removed for security. We now call Supabase Edge Function.
// Kept types and fallback implementation.

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
  try {
    const base = getFunctionsUrl();
    if (!base) throw new Error('Missing VITE_SUPABASE_FUNCTIONS_URL');

    const resp = await fetch(`${base}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText, jobUrl })
    });

    if (!resp.ok) {
      throw new Error(await resp.text());
    }

    return await resp.json();
  } catch (error) {
    console.error('Error analyzing via Edge Function:', error);
    // Fallback demo recommendations
    return {
      recommendations: [
        { type: 'keyword', original: 'worked on', suggested: 'developed and implemented', reason: 'Action verbs improve ATS scoring', applied: false },
        { type: 'achievement', original: 'improved performance', suggested: 'increased system performance by 40%', reason: 'Quantify impact for hiring managers', applied: false },
      ],
      optimizedCV: cvText,
      jobSummary: 'Edge function unavailable - demo mode'
    };
  }
}

export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const base = getFunctionsUrl();
    if (!base) return false;

    const resp = await fetch(`${base}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText: 'ping', jobUrl: 'https://example.com/job' })
    });
    return resp.ok;
  } catch {
    return false;
  }
}
