/**
 * Google Gemini AI Integration for Gestura
 * Powered by Google Generative Language API
 * Uses VITE_GEMINI_API_KEY from .env
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Generate real-time adaptive wellness coaching based on detected mood & blendshapes
 */
export async function getGeminiMoodInsights(mood, blendshapes = [], confidence = 0.8) {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      message: 'Gemini API key is not configured in .env',
    };
  }

  const prompt = `You are the Gestura Vision AI Assistant. 
The user's real-time facial expression analysis reports:
- Dominant Emotional State: ${mood}
- Confidence Score: ${(confidence * 100).toFixed(0)}%
- Top Blendshapes: ${blendshapes.map((b) => `${b.name}: ${b.score}%`).join(', ') || 'Normal baseline'}

Provide a 2-sentence empathetic, scientific biofeedback insight and 1 concise action recommendation for this emotional state. Keep it grounded, professional, and free of fluff.`;

  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.4,
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Gemini API response error:', errData);
      return { success: false, error: errData };
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return {
      success: true,
      insight: candidate || 'Inference confirmed. Maintain steady breathing and posture.',
    };
  } catch (err) {
    console.warn('Gemini network call failed:', err);
    return { success: false, error: err.message };
  }
}
