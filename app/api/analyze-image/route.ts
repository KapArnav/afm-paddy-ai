import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callVertexWithRetry } from "@/lib/gemini-client";
import { checkVisionCache, setVisionCache } from "@/lib/vision-cache";

const RequestBodySchema = z.object({
  image: z.string().min(100), // Expecting a non-trivial base64 string
});

export async function POST(req: NextRequest) {
  console.log("ANALYZE IMAGE API HIT");

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication Failure: Unverified UID context" },
      { status: 401 }
    );
  }

  // 2. Parse request body
  let body: any;
  try {
    const rawBody = await req.json();
    const validation = RequestBodySchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid Input", details: validation.error.format() },
        { status: 400 }
      );
    }
    body = validation.data;
  } catch (error) {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  const { image } = body;
  let base64Data = image;
  let dynamicMimeType = "image/jpeg";

  if (image.includes(",")) {
    const parts = image.split(",");
    base64Data = parts[1];
    const match = parts[0].match(/data:(.*?);/);
    if (match) dynamicMimeType = match[1];
  }

  // 2.2 CHECK CACHE FIRST (TPM Saver)
  const cachedFindings = await checkVisionCache(userId, base64Data);
  if (cachedFindings) {
    try {
      const parsedIssues = JSON.parse(cachedFindings);
       return NextResponse.json({
        success: true,
        issues: parsedIssues,
        confidence: 1.0,
        cached: true
      });
    } catch {
      console.warn("[Vision Cache] Corrupt cache entry, proceeding to API.");
    }
  }

  // 3. Build Gemini request
    // 2. Call Vertex AI via the new queued client (Task 2 & 6)
    const visionPrompt = "Describe this paddy field's condition. Are there any visible pests, diseases, or nutrient issues? Be technical but concise.";
    
    // Use the same generally available model family as the strategist path.
    const visionRes = await callVertexWithRetry(
      ["gemini-2.5-flash"],
      {
        contents: [{
          role: "user",
          parts: [
            { text: visionPrompt },
            { inlineData: { mimeType: dynamicMimeType, data: base64Data } }
          ]
        }]
      }
    );

    if (!visionRes.ok) {
      return NextResponse.json(
        { success: false, error: "Vision Analysis Unavailable", detail: visionRes.text },
        { status: 429 }
      );
    }

    const analysis = visionRes.text;
  const rawText = analysis || "{}";
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    // Store in cache for future hits
    await setVisionCache(userId, base64Data, JSON.stringify(parsed.issues || []));

    return NextResponse.json({
      success: true,
      issues: parsed.issues ?? [],
      confidence: parsed.confidence ?? 0,
      model: visionRes.modelUsed
    });
  } catch (err) {
    console.warn("[Vision API] Parsing failure, returning raw description fallback.");
    // Fallback: If JSON parsing fails, treat the entire text as a single issue/description
    const fallbackIssues = [cleaned.substring(0, 500)]; 
    return NextResponse.json({
      success: true,
      issues: fallbackIssues,
      confidence: 0.5,
      isRawText: true
    });
  }
}
