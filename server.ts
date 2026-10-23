import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { parseResumeContent } from './src/utils/resumeParser.ts';

dotenv.config();

const app = express();
function getPort(): number {
  if (process.env.PORT) return Number(process.env.PORT);
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return Number(process.argv[portArgIndex + 1]);
  }
  return 3000;
}

function getHost(): string {
  if (process.env.HOST) return process.env.HOST;
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1] && !process.argv[hostArgIndex + 1].startsWith('-')) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Dhruva Platform Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(apiKey),
  });
});

// Resume parsing endpoint
app.post('/api/ai/parse-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string') {
      res.status(400).json({ error: 'resumeText is required' });
      return;
    }

    if (ai) {
      try {
        const prompt = `You are an expert talent acquisition parser. Parse this resume text into clean JSON matching this structure:
{
  "fullName": "candidate name",
  "email": "candidate email",
  "phone": "candidate phone",
  "headline": "professional headline e.g. Full Stack Engineer",
  "skills": ["Skill1", "Skill2"],
  "education": [
    {
      "institution": "University / College",
      "degree": "Degree e.g. B.Tech Computer Science",
      "fieldOfStudy": "Major",
      "startYear": "YYYY",
      "endYear": "YYYY",
      "grade": "GPA/CGPA if present"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Title",
      "location": "City, Country",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "current": false,
      "description": "Key achievements and responsibilities"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "link": "url if available"
    }
  ],
  "summary": "1-2 sentence professional bio"
}

Resume Text:
${resumeText.slice(0, 5000)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          res.json({ success: true, data: parsed, engine: 'gemini-3.8-flash' });
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini parsing failed, falling back to deterministic parser:', geminiErr);
      }
    }

    // Deterministic fallback
    const fallbackResult = parseResumeContent(resumeText);
    res.json({ success: true, data: fallbackResult, engine: 'deterministic-regex' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

// Cover letter generator endpoint
app.post('/api/ai/cover-letter', async (req: Request, res: Response) => {
  try {
    const { jobTitle, companyName, seekerName, skills, experienceSummary, tone = 'minimalist' } = req.body;
    
    let toneInstruction = 'concise, understated, and effortless in the style of Apple design communications';
    if (tone === 'impact_metrics') {
      toneInstruction = 'data-driven, emphasizing measurable results, latency optimizations, scalability, and engineering outcomes';
    } else if (tone === 'conversational') {
      toneInstruction = 'warm, articulate, mission-driven, and collaborative';
    } else if (tone === 'executive') {
      toneInstruction = 'strategic, authoritative, emphasizing architectural governance and high-signal execution';
    }

    if (ai) {
      const prompt = `Write a personalized, high-impact cover letter (150-200 words) with tone: ${toneInstruction}.
Applicant: ${seekerName || 'Candidate'}
Target Role: ${jobTitle} at ${companyName}
Top Skills: ${(skills || []).join(', ')}
Background: ${experienceSummary || 'Demonstrated engineering experience and passion for product craftsmanship.'}

Highlight why the candidate is exceptionally suited for ${jobTitle} at ${companyName} without clichés or filler. Output only the body of the cover letter.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({
        success: true,
        coverLetter: response.text?.trim() || 'Excited to apply for this role.',
        tone,
      });
      return;
    }

    // High quality deterministic templates per tone
    let templateLetter = '';
    if (tone === 'impact_metrics') {
      templateLetter = `Dear ${companyName} Hiring Team,

I am writing to submit my candidacy for the ${jobTitle} position at ${companyName}. Across my recent engineering work, I have prioritized high-throughput performance—optimizing client bundle latency by over 30%, refactoring state stores to sub-16ms render budgets, and deploying containerized microservices in ${(skills || []).slice(0, 3).join(', ')}.

${companyName}'s engineering culture of technical precision and scale matches my passion for measurable impact. I look forward to bringing this analytical discipline to your roadmap.

Best regards,
${seekerName || 'Candidate'}`;
    } else if (tone === 'conversational') {
      templateLetter = `Hi ${companyName} Team,

I've been following ${companyName}'s engineering work and couldn't be more excited to apply for the ${jobTitle} role. As someone who deeply values both clean system design and effortless user experience, I love tackling ambiguous problems and building software that genuinely helps people.

My background spans ${(skills || []).slice(0, 4).join(', ')}, and I thrive in collaborative teams that balance speed with craftsmanship. I'd love to chat about how I can contribute to what you're building next!

Warmly,
${seekerName || 'Candidate'}`;
    } else {
      // Minimalist default
      templateLetter = `Dear ${companyName} Hiring Team,

I am writing to express my strong enthusiasm for the ${jobTitle} position at ${companyName}. With a focus on building accessible, high-performance web products and hands-on expertise in ${(skills || ['modern software engineering']).slice(0, 4).join(', ')}, I am confident in my ability to make an immediate impact on your engineering initiatives.

${companyName}'s standard for technical rigor and user empathy strongly aligns with my own engineering ethos. I would welcome the opportunity to discuss how my technical expertise can contribute to your team.

Warm regards,
${seekerName || 'Dhruva Candidate'}`;
    }

    res.json({ success: true, coverLetter: templateLetter, tone });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate cover letter' });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
    console.log(`[Dhruva] Full-stack engine running on http://${HOST}:${PORT}`);
  });
}

startServer();
