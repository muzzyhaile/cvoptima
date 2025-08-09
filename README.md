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
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- OpenAI API key - [get one here](https://platform.openai.com/api-keys)

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

3. **Set up environment variables**
```sh
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
VITE_OPENAI_API_KEY=your_actual_api_key_here
```

4. **Start the development server**
```sh
npm run dev
```

5. **Open your browser**
Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key for AI-powered analysis | Yes |

## Project info

**URL**: https://lovable.dev/projects/d3dbcf9c-34dc-485f-8143-bf3e4fc8ced3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d3dbcf9c-34dc-485f-8143-bf3e4fc8ced3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d3dbcf9c-34dc-485f-8143-bf3e4fc8ced3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
