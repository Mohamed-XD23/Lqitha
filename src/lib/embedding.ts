import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_TOKEN);

export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.HF_API_TOKEN) {
    throw new Error("HF_API_TOKEN is not set in environment variables.");
  }

  const result = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });

  // result is Float32Array | number[] | number[][] depending on the model
  // all-MiniLM-L6-v2 returns a flat 384-dim vector
  const embedding = Array.from(result as number[]);

  if (embedding.length !== 384) {
    throw new Error(`Unexpected embedding size: ${embedding.length}, expected 384`);
  }

  return embedding;
}