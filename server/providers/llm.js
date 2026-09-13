/**
 * Optional OpenAI-compatible chat completion used ONLY to summarize text we actually retrieved
 * (filing documents, headlines). Set OPENAI_API_KEY; override OPENAI_MODEL / OPENAI_BASE_URL
 * for other compatible providers. Without a key, analysis endpoints report "not configured".
 */
export const configured = () => Boolean(process.env.OPENAI_API_KEY)

const base = () => (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
const model = () => process.env.OPENAI_MODEL || 'gpt-4o-mini'

/** Ask for strict JSON. Returns the parsed object or throws. */
export async function completeJson(system, user) {
  const res = await fetch(`${base()}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: model(),
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw Object.assign(new Error(`LLM provider responded ${res.status}.`), { status: 502 })
  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content
  try {
    return JSON.parse(content)
  } catch {
    throw Object.assign(new Error('LLM returned malformed JSON.'), { status: 502 })
  }
}

export const FILING_SYSTEM_PROMPT = `You are a financial filing analyst. You will receive the text of an SEC filing.
Use ONLY facts explicitly present in the text. Never guess or add outside knowledge.
If something is not in the text, leave the array empty or the string "Not stated in this filing".
Respond with JSON: {
  "metrics": [{"label": string, "current": string, "previous"?: string, "delta"?: string}],
  "developments": string[],
  "risks": string[],
  "summary": string
}
Keep metrics to at most 6, developments and risks to at most 5 short sentences each, summary under 120 words.`
