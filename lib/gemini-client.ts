import { VertexAI } from '@google-cloud/vertexai';

/**
 * lib/gemini-client.ts
 * Optimized Vertex AI SDK implementation with a global rate limit queue.
 */

const PROJECT_ID = '738090758944'; // Using project number for tighter IAM binding
const LOCATION = 'asia-southeast1';

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

/**
 * Global Rate Limit Controller (Queue)
 * Ensures only 1 Gemini call executes at a time per instance.
 */
class GeminiQueue {
  private queue: Promise<any> = Promise.resolve();

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(async () => {
      // Add a 500ms mandatory buffer between calls as per Task 8
      await new Promise(r => setTimeout(r, 500));
      return task();
    });
    this.queue = result.catch(() => {}); // Prevent pipeline crash
    return result;
  }
}

const globalQueue = new GeminiQueue();

export interface GeminiRequestOptions {
  contents: any[];
  generationConfig?: any;
  safetySettings?: any;
}

/**
 * Resilient AI call wrapper using Vertex AI SDK and global queue.
 */
export async function callVertexWithRetry(
  models: string[],
  options: GeminiRequestOptions,
  maxRetries = 1 // Task 3: maxRetries = 1
): Promise<{ ok: boolean; status: number; text: string; data?: any; modelUsed: string }> {
  
  if (!models || models.length === 0) {
    throw new Error("No models provided for AI fallback chain");
  }

  return globalQueue.enqueue(async () => {
    const startTime = Date.now();
    let lastError: any = null;
    let modelUsed = models[0];

    // Use the specific versioned model which can sometimes resolve permission disambiguation
    const activeModelName = "gemini-1.5-flash-001"; 
    
    console.log(`[Gemini Queue] START: ${activeModelName} as ${PROJECT_ID} at ${new Date().toISOString()}`);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = vertexAI.getGenerativeModel({ 
          model: activeModelName,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        });
        
        const result = await model.generateContent({
          contents: options.contents,
        });

        const response = await result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (text) {
          const duration = Date.now() - startTime;
          console.log(`[Gemini Queue] END: ${activeModelName} success in ${duration}ms`);
          
          return { 
            ok: true, 
            status: 200, 
            text, 
            data: { candidates: [{ content: { parts: [{ text }] } }] },
            modelUsed: activeModelName
          };
        }
        throw new Error("Empty response");

      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Queue] FAIL: ${activeModelName} attempt ${attempt + 1}: ${err.message}`);

        if (attempt === 0 && maxRetries > 0) {
          // Task 3: First retry: 500ms delay
          await new Promise(r => setTimeout(r, 500));
        } else {
          break; // Stop after maxRetries (Task 3)
        }
      }
    }

    // Task 5: Fail-soft behavior (The caller should handle ok: false)
    return { 
      ok: false, 
      status: lastError?.status || 500, 
      text: lastError?.message || "Vertex AI service unavailable",
      modelUsed: activeModelName
    };
  });
}

// Support legacy name if needed
export const callGeminiWithRetry = async (
  apiKeyIgnored: string | undefined, 
  models: string[],
  options: GeminiRequestOptions,
  maxRetries = 1
) => {
  return callVertexWithRetry(models, options, maxRetries);
};
