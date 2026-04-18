import { NextRequest, NextResponse } from "next/server";

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

export async function POST(req: NextRequest) {
  console.log("ANALYZE IMAGE API HIT");

  // 1. Check Auth Header (Mandatory Security)
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication Failure: Unverified UID context" },
      { status: 401 }
    );
  }

  // 1.1 Check API key
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

  // 2.1 Validate image payload
  if (image.length > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image too large. Maximum size is 5MB." },
      { status: 413 }
    );
  }

  // Extract raw base64 and dynamic mime-type if it has a prefix
  let base64Data = image;
  let dynamicMimeType = "image/jpeg"; // Default

  if (image.includes(",")) {
    const parts = image.split(",");
    base64Data = parts[1];
    const match = parts[0].match(/data:(.*?);/);
    if (match) dynamicMimeType = match[1];
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
                  mimeType: dynamicMimeType,
                  data: base64Data,
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
  } catch (error: unknown) {
    console.error("analyze-image error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Failed to analyze crop image", detail: message },
      { status: 500 }
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
  let data: GeminiResponse;
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
  } catch (err: unknown) {
    console.error("AI Response Parsing Failure:", err, cleaned);
    // Safe fallback instead of crashing
    parsed = { 
      issues: ["AI was unable to clearly identify specific issues in this image."], 
      confidence: 0 
    };
  }

  // 9. Return result
  console.log("ANALYZE IMAGE SUCCESS");
  return NextResponse.json({
    success: true,
    issues: parsed.issues ?? [],
    confidence: parsed.confidence ?? 0,
  });
}
