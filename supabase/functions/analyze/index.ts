// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: analyze
// Securely call OpenAI from the edge and return recommendations

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

async function analyzeCVWithJob(cvText: string, jobUrl: string) {
  const jobPrompt = `Extract key requirements, skills, and qualifications from this job posting URL: ${jobUrl}. If the URL content can't be fetched, infer typical requirements for this role based on the URL and path.`

  const system = `You are an expert CV optimization specialist. Return valid JSON with recommendations and an optimizedCV.`
  const user = `CV:\n${cvText}\n\n${jobPrompt}\n\nReturn JSON: { "recommendations": [ {"type":"keyword|phrase|structure|achievement","original":"","suggested":"","reason":"","applied":false} ], "optimizedCV":"..." }`;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-nano-2025-04-14',
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  })

  if (!resp.ok) {
    const t = await resp.text()
    throw new Error(`OpenAI error: ${resp.status} ${t}`)
  }

  const data = await resp.json()
  const content = data.choices?.[0]?.message?.content || ''
  try {
    return JSON.parse(content)
  } catch {
    return { recommendations: [], optimizedCV: cvText }
  }
}

// Simple CORS helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Local TS hint for VS Code when not running in Edge runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }
  if (!OPENAI_API_KEY) {
    return new Response('Missing OPENAI_API_KEY', { status: 500, headers: corsHeaders })
  }

  try {
    const { cvText, jobUrl } = await req.json()
    if (!cvText || !jobUrl) {
      return new Response(JSON.stringify({ error: 'cvText and jobUrl required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const result = await analyzeCVWithJob(cvText, jobUrl)
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
})
