import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("ANALYZE IMAGE API HIT");

  // 1. Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  // 2. Parse request body
  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing JSON body" },
      { status: 400 }
    );
  }

  const { image } = body;
  if (!image) {
    return NextResponse.json(
      { error: "Missing required field: image (base64 string)" },
      { status: 400 }
    );
  }

  // 3. Build Gemini request
  const prompt = `You are an agricultural expert analyzing a crop image.
Identify visible issues such as:
- nutrient deficiencies
- pest damage
- disease symptoms
- leaf discoloration

Return ONLY valid JSON in this format:

{
  "issues": ["...", "..."],
  "confidence": 0.0 to 1.0
}

Do not include markdown or explanations.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  // 4. Call Gemini API
  let geminiRes: Response;
  try {
    geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    console.error("Gemini fetch error:", message);
    return NextResponse.json(
      { error: "Failed to reach Gemini API", detail: message },
      { status: 502 }
    );
  }

  // 5. Check HTTP status
  if (!geminiRes.ok) {
    const errBody = await geminiRes.text();
    console.error("Gemini API error:", geminiRes.status, errBody);
    return NextResponse.json(
      { error: "Gemini API returned an error", status: geminiRes.status, detail: errBody },
      { status: 502 }
    );
  }

  // 6. Parse Gemini response
  let data: any;
  try {
    data = await geminiRes.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Gemini response" },
      { status: 502 }
    );
  }

  // 7. Extract text
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error("No text in Gemini response:", JSON.stringify(data));
    return NextResponse.json(
      { error: "Gemini returned no text content", raw: data },
      { status: 502 }
    );
  }

  // 8. Clean and parse JSON
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "").trim();

  let parsed: { issues: string[]; confidence: number };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini text as JSON:", cleaned);
    return NextResponse.json(
      { error: "Gemini response was not valid JSON", raw_text: cleaned },
      { status: 502 }
    );
  }

  // 9. Return result
  console.log("ANALYZE IMAGE SUCCESS");
  return NextResponse.json({
    success: true,
    issues: parsed.issues ?? [],
    confidence: parsed.confidence ?? 0,
  });
}
