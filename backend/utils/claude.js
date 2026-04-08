/**
 * Thin wrapper around the Anthropic Messages API.
 * Uses the native fetch available in Node 18+.
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-sonnet-4-20250514';

/**
 * Send a prompt to Claude and return the text response.
 * @param {string} userPrompt
 * @param {string} [systemPrompt]
 * @param {number} [maxTokens=1024]
 * @returns {Promise<string>}
 */
async function callClaude(userPrompt, systemPrompt = 'You are an expert HR interviewer and talent evaluator.', maxTokens = 1024) {
  // ── Mock AI for Development ──────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('your-key-here')) {
    console.log('🤖 Using mock AI response (ANTHROPIC_API_KEY missing)');
    
    // Return mock responses based on prompt keywords
    if (userPrompt.toLowerCase().includes('generate-questions') || userPrompt.toLowerCase().includes('interview questions for the role')) {
      return JSON.stringify([
        "Tell me about a time you handled a difficult situation with a coworker.",
        "What are your greatest professional strengths?",
        "How do you prioritize your tasks when faced with tight deadlines?",
        "Describe a challenge you faced and how you overcame it.",
        "Why are you interested in this position and our company?"
      ]);
    }
    
    if (userPrompt.toLowerCase().includes('evaluate') || userPrompt.toLowerCase().includes('evaluate the following interview')) {
      return JSON.stringify({
        scores: { communication: 8, technical: 7, confidence: 9 },
        feedback: "The candidate demonstrated strong communication skills and structural thinking. Good confidence.",
        strengths: ["Clear articulation", "Confident delivery", "Relevant examples"],
        weaknesses: ["Could go deeper into technical specifics", "Mentioned limited tools"],
        recommendation: "hire"
      });
    }

    if (userPrompt.toLowerCase().includes('follow-up')) {
      return "That's interesting. Can you provide a more specific example of how you applied that skill?";
    }

    return "This is a default mock response from the AI interview assistant.";
  }

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            process.env.ANTHROPIC_API_KEY,
      'anthropic-version':    '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.content?.map((b) => b.text || '').join('') || '';
}

/**
 * Parse JSON from Claude output, stripping markdown fences if present.
 * @param {string} raw
 * @returns {any}
 */
function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { callClaude, parseJSON };
