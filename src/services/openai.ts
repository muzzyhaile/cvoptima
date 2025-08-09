import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable client-side usage
});

interface CVAnalysisResponse {
  recommendations: {
    type: "keyword" | "phrase" | "structure" | "achievement";
    original: string;
    suggested: string;
    reason: string;
    applied: boolean;
  }[];
  optimizedCV: string;
}

export async function analyzeCVWithJob(cvText: string, jobUrl: string): Promise<CVAnalysisResponse> {
  try {
    // First, let's try to extract job requirements from the URL (simplified for now)
    const jobDescription = `Job from URL: ${jobUrl}. Please analyze the CV against general best practices and common job requirements.`;

    const prompt = `
You are an expert CV optimization specialist. Analyze this CV and provide specific recommendations to improve it for job applications.

CV CONTENT:
${cvText}

JOB REFERENCE:
${jobDescription}

Please provide your analysis in the following JSON format:
{
  "recommendations": [
    {
      "type": "keyword" | "phrase" | "structure" | "achievement",
      "original": "exact text from CV to replace",
      "suggested": "improved version",
      "reason": "explanation of why this improves the CV",
      "applied": false
    }
  ],
  "optimizedCV": "full optimized CV text with all recommendations applied"
}

Focus on:
1. Industry keywords and buzzwords
2. Action-oriented language
3. Quantified achievements
4. Professional formatting
5. ATS optimization
6. Relevance to job requirements

Provide 5-8 specific, actionable recommendations.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert CV optimization specialist. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysisResult = JSON.parse(response);
    return analysisResult;

  } catch (error) {
    console.error('Error analyzing CV with OpenAI:', error);
    
    // Return fallback recommendations if API fails
    return {
      recommendations: [
        {
          type: "keyword",
          original: "Worked on projects",
          suggested: "Led cross-functional projects",
          reason: "More specific and action-oriented language shows leadership",
          applied: false
        },
        {
          type: "achievement",
          original: "Improved efficiency",
          suggested: "Increased operational efficiency by 25% through process optimization",
          reason: "Quantified achievements are more impactful and credible",
          applied: false
        },
        {
          type: "phrase",
          original: "Responsible for",
          suggested: "Managed and executed",
          reason: "Active voice demonstrates ownership and accountability",
          applied: false
        }
      ],
      optimizedCV: "Your optimized CV will appear here after connecting to OpenAI. Please add your API key to the .env file."
    };
  }
}

export async function testOpenAIConnection(): Promise<boolean> {
  try {
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
