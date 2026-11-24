import { pipeline } from "@huggingface/transformers";
import { PDFParse } from "pdf-parse";

let extractorPromise;

async function embed(text) {
  extractorPromise ??= pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  const extractor = await extractorPromise;

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(output.data);
}

export async function processPDF(buffer) {
  const parser = new PDFParse({
    data: new Uint8Array(buffer)
  });

  let text;

  try {
    const result = await parser.getText();
    text = result.text.trim();
  } finally {
    await parser.destroy();
  }

  if (!text) {
    throw new Error("No readable text found in PDF.");
  }

  const chunks = [];

  for (let i = 0; i < text.length && chunks.length < 100; i += 600) {
    chunks.push(text.slice(i, i + 800));
  }

  const documents = [];

  for (let i = 0; i < chunks.length; i++) {
    documents.push({
      id: i + 1,
      text: chunks[i],
      vector: await embed(chunks[i])
    });
  }

  return documents;
}

function similarity(a, b) {
  return a.reduce(
    (sum, value, i) => sum + value * b[i],
    0
  );
}

export async function retrieveContext(question, documents) {
  if (!documents?.length) return "";

  const queryVector = await embed(question);

  return documents
    .map(doc => ({
      ...doc,
      score: similarity(queryVector, doc.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(doc => `[Chunk ${doc.id}]\n${doc.text}`)
    .join("\n\n");
}