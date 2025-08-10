import OpenAI from 'openai';

// Initialize OpenAI client safely for browser usage
const apiKey = (import.meta as any)?.env?.VITE_OPENAI_API_KEY as string | undefined;
let openai: OpenAI | null = null;

try {
  if (apiKey && apiKey.trim().length > 0) {
    openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  } else {
    console.warn('[OpenAI] VITE_OPENAI_API_KEY is missing. Running in demo mode.');
  }
} catch (e) {
  console.error('[OpenAI] Failed to initialize client:', e);
  openai = null;
}

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

// Function to extract job description from URL
async function extractJobFromUrl(jobUrl: string): Promise<string> {
  try {
    if (!openai) {
      return `Job posting provided: ${jobUrl}. OpenAI is not configured; using general best practices.`;
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a job analysis expert. Extract key requirements, skills, and qualifications from job postings."
        },
        {
          role: "user",
          content: `Please analyze this job posting URL and extract the key requirements: ${jobUrl}
          \nIf you cannot access the URL, provide general guidance based on typical roles from the domain, including:\n1) likely required skills\n2) common keywords\n3) qualifications\n4) experience level.\n`}
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0].message.content || "Unable to extract job requirements from URL. Using general best practices.";
  } catch (error) {
    console.error('Error extracting job from URL:', error);
    return `Job posting analysis for: ${jobUrl}. Using general CV optimization best practices.`;
  }
}

export async function analyzeCVWithJob(cvText: string, jobUrl: string): Promise<CVAnalysisResponse> {
  try {
    // If OpenAI not configured, return demo fallback immediately
    if (!openai) {
      return {
        recommendations: [
          { type: "keyword", original: "worked on", suggested: "developed and implemented", reason: "Use strong action verbs for ATS and clarity", applied: false },
          { type: "achievement", original: "improved performance", suggested: "increased performance by 40% through code optimization", reason: "Quantify impact to stand out", applied: false },
          { type: "phrase", original: "team player", suggested: "collaborated with cross-functional teams of 8+ members", reason: "Make soft skills concrete and specific", applied: false },
          { type: "structure", original: "responsible for managing", suggested: "led and coordinated", reason: "Leadership-oriented language scores better", applied: false },
        ],
        optimizedCV: cvText,
        jobSummary: `OpenAI is not configured. Provide a VITE_OPENAI_API_KEY to enable real analysis for ${jobUrl}.`
      };
    }

    // First, analyze the job posting
    const jobAnalysis = await extractJobFromUrl(jobUrl);
    const prompt = `
You are an expert CV optimization specialist with deep knowledge of ATS systems and hiring practices. Analyze this CV against the job requirements and provide specific, actionable recommendations.

CV CONTENT:
${cvText}

JOB ANALYSIS:
${jobAnalysis}

Please provide your analysis in the following JSON format:
{
  "recommendations": [
    {
      "type": "keyword" | "phrase" | "structure" | "achievement",
      "original": "exact text from CV to replace",
      "suggested": "improved version",
      "reason": "explanation of why this improves the CV for this specific job",
      "applied": false
    }
  ],
  "optimizedCV": "full optimized CV text with all recommendations applied",
  "jobSummary": "brief summary of key job requirements identified"
}

Guidelines: Prefer quantified achievements, use strong action verbs, and match keywords from the job analysis while preserving original structure.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert CV optimization specialist. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    try {
      const analysisResult = JSON.parse(response);
      return analysisResult;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response:', response);
      throw new Error('Invalid response format from OpenAI');
    }

  } catch (error) {
    console.error('Error analyzing CV with OpenAI:', error);
    return {
      recommendations: [
        { type: "keyword", original: "worked on", suggested: "developed and implemented", reason: "More specific action verbs improve ATS scoring and clarity", applied: false },
        { type: "achievement", original: "improved performance", suggested: "increased system performance by 40% through code optimization", reason: "Quantified achievements draw attention", applied: false },
      ],
      optimizedCV: cvText,
      jobSummary: "Unable to analyze job posting - using general CV optimization best practices"
    };
  }
}

export async function testOpenAIConnection(): Promise<boolean> {
  try {
    if (!openai) return false;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });
    return !!completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}
