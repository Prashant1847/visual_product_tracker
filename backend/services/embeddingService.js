import fetch from 'node-fetch';

import dotenv from "dotenv"
dotenv.config()

// Configuration
const API_KEY = process.env.API_KEY;
const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';
const MODEL_NAME = 'jina-clip-v2';


export async function generateEmbeddingFromUrl(imageUrl) {
  console.log('[DEBUG] Generating embedding from URL:', imageUrl);

  try {
    const payload = {
      model: "jina-clip-v2",
      dimensions: 512,
      input: [
        { image: imageUrl }
      ]
    };

    const response = await fetch(JINA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Jina API error: ${response.status} ${response.statusText}. Response Body: ${errorBody}`);
    }

    const result = await response.json();
    // Jina returns embeddings as result.embeddings
    return result?.data?.[0]?.embedding;
  } catch (err) {
    console.error('[ERROR] Failed to generate embedding from URL:', err);
    throw err;
  }
}


export async function generateEmbeddingFromBuffer(imageBuffer, mimeType = 'image/jpeg') {

  try {
    // Convert buffer to base64 for Jina
    const base64Image = imageBuffer.toString('base64');
    const payload = {
      model: MODEL_NAME,
      dimensions: 512,
      input: [
        { image: `data:${mimeType};base64,${base64Image}` }
      ]
    };

    const response = await fetch(JINA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Jina API error: ${response.status} ${response.statusText}. Response: ${text}`);
    }

    const json = await response.json();
    const embedding = json?.data?.[0]?.embedding;
    if (!embedding) throw new Error('No embedding returned by Jina');

    return embedding;

  } catch (err) {
    console.error('[ERROR] Failed to generate embedding from buffer:', err.message);
    throw err;
  }
}
