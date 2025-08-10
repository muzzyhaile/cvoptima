# CV Alchemy - AI-Powered CV Optimizer

An intelligent CV optimization tool that analyzes your resume against job requirements and provides AI-powered recommendations to improve your chances of landing the job.

## Features

- **Smart CV Analysis**: Upload PDF, DOC, DOCX, or TXT files
- **AI-Powered Recommendations**: Get specific suggestions for keywords, phrases, and formatting
- **Job Matching**: Analyze your CV against specific job postings
- **Multiple Export Formats**: Download optimized CV as Word, PDF, or text
- **Real-time Preview**: Compare original vs optimized versions
- **Fullscreen Mode**: Detailed view for better CV review

## Setup Instructions

### Prerequisites
- Node.js & npm installed
- Supabase project (for Edge Functions)
- OpenAI API key stored as a secret in Supabase (server-side only)

### Installation

1. **Clone the repository**
```sh
git clone https://github.com/guidingv/cvoptimiser.git
cd cvoptimiser
```

2. **Install dependencies**
```sh
npm install
```

3. **Set up environment variables for the frontend**
```sh
# Copy the example environment file
cp .env.example .env

# Edit .env and set your Supabase Functions base URL (no trailing slash)
VITE_SUPABASE_FUNCTIONS_URL=https://<project-ref>.functions.supabase.co
```

4. **Start the development server**
```sh
npm run dev
```

5. **Open your browser**
Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Deploying the Edge Function (Supabase)

Use the Supabase CLI:

```sh
supabase login
supabase link --project-ref <project-ref>
# Store your OpenAI key securely in Supabase
supabase secrets set OPENAI_API_KEY=sk-...
# Deploy the function
supabase functions deploy analyze
```

## Environment Variables

Frontend (.env):

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_FUNCTIONS_URL` | Base URL for Supabase Edge Functions | Yes |

Backend (Supabase secrets):

- `OPENAI_API_KEY` (required)

## Netlify (Frontend Hosting)

- Ensure `public/_redirects` contains: `/* /index.html 200`
- In Site settings > Environment, set `VITE_SUPABASE_FUNCTIONS_URL`
- Remove Netlify Functions usage; Supabase Edge Functions are deployed via Supabase CLI

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase Edge Functions (Deno)
- OpenAI (server-side)
