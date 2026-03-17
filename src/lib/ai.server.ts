import { env } from 'cloudflare:workers';
import { sampleExamples } from '@/lib/team-name-examples';

interface AiEnv {
  AI: {
    run: (
      model: string,
      options: { messages: unknown[]; temperature?: number; top_p?: number; max_tokens?: number }
    ) => Promise<unknown>;
  };
}

function getAiEnv(): AiEnv {
  return env as unknown as AiEnv;
}

const CREATIVE_THEMES = [
  'tech puns', 'animals', 'food', 'space', 'nature', 'music', 'games',
  'wordplay', 'mythology', 'sci-fi', 'abstract', 'minimal', 'bold',
];

export async function generateTeamName(): Promise<string> {
  const examples = sampleExamples(20).join(', ');
  const theme = CREATIVE_THEMES[Math.floor(Math.random() * CREATIVE_THEMES.length)];
  const prompt = [
    'Here are real team names from previous HackNU hackathons:',
    examples,
    '',
    'Generate one new hackathon team name for HackNU.',
    'Rules: 2–3 words max, under 30 characters. Easy to pronounce and memorable—judges and recruiters will see it.',
    'Be creative and varied. Take inspiration from the examples but prefer a fresh angle; avoid repeating the same patterns.',
    'Avoid obscure inside jokes and well-known brand names. Relate to coding, tech, or innovation.',
    `Optional vibe: something ${theme}-flavored.`,
    '',
    'Return only the name, no punctuation, no quotes, no explanation.',
  ].join('\n');

  const { AI } = getAiEnv();
  const response = await AI.run('@cf/ibm-granite/granite-4.0-h-micro', {
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.2,
    top_p: 0.95,
    max_tokens: 32,
  });

  const content = (response as { choices?: Array<{ message?: { content?: string } }> })
    .choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error('AI returned no team name');
  const name = content.trim();
  return name.length > 30 ? name.slice(0, 30) : name;
}
