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
  jobSummary?: string;
}

// Function to extract job description from URL
async function extractJobFromUrl(jobUrl: string): Promise<string> {
  try {
    // For now, we'll use OpenAI to analyze the job URL
    // In a production environment, you might want to use web scraping
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
          
          Since I cannot directly access the URL, please provide general job analysis guidance based on the URL domain and any visible job indicators. Focus on:
          1. Likely required skills
          2. Common industry keywords
          3. Professional qualifications
          4. Experience level indicators
          
          Provide a structured summary of what this job likely requires.`
        }
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

OPTIMIZATION GUIDELINES:
1. **Keywords**: Include industry-specific terms and technologies mentioned in the job
2. **Quantified Achievements**: Replace vague statements with measurable results
3. **Action Verbs**: Use strong, action-oriented language (Led, Implemented, Achieved, etc.)
4. **ATS Optimization**: Ensure keywords match job requirements for ATS scanning
5. **Structure**: Improve formatting and organization for better readability
6. **Relevance**: Highlight experiences most relevant to the target role

Provide 6-10 specific, high-impact recommendations that will significantly improve this CV's effectiveness for the target job. Focus on changes that will have the biggest impact on getting past ATS systems and impressing hiring managers.

Make sure the optimized CV maintains the original structure while incorporating improvements.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Using GPT-4 for better analysis
      messages: [
        {
          role: "system",
          content: "You are an expert CV optimization specialist. Always respond with valid JSON format. Focus on actionable, specific improvements that will help the candidate get hired."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 3000,
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
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
    
    // Return enhanced fallback recommendations
    return {
      recommendations: [
        {
          type: "keyword",
          original: "worked on",
          suggested: "developed and implemented",
          reason: "More specific action verbs improve ATS scoring and show proactivity",
          applied: false
        },
        {
          type: "achievement",
          original: "improved performance",
          suggested: "increased system performance by 40% through code optimization",
          reason: "Quantified achievements are 3x more likely to catch recruiter attention",
          applied: false
        },
        {
          type: "phrase",
          original: "team player",
          suggested: "collaborated with cross-functional teams of 8+ members",
          reason: "Specific collaboration details demonstrate real teamwork experience",
          applied: false
        },
        {
          type: "structure",
          original: "responsible for managing",
          suggested: "led and coordinated",
          reason: "Leadership language shows ownership and management potential",
          applied: false
        },
        {
          type: "keyword",
          original: "programming",
          suggested: "full-stack development using React, Node.js, and Python",
          reason: "Specific technology stacks match modern job requirements",
          applied: false
        }
      ],
      optimizedCV: "⚠️ OpenAI connection failed. Please check your API key in the .env file. Your original CV content is preserved below.\n\n" + cvText,
      jobSummary: "Unable to analyze job posting - using general CV optimization best practices"
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
