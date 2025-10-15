import { MongoClient } from 'mongodb';

import dotenv from "dotenv"
dotenv.config()


// Configuration
const CONNECTION_STRING = process.env.CONNECTION_STRING
const DB_NAME = process.env.DB_NAME
const COLLECTION_NAME = process.env.COLLECTION_NAME

// Global client instance
let client = null;
let db = null;
let collection = null;

/**
 * Connect to MongoDB
 */
export async function connectToMongo() {
  try {
    console.log('[DEBUG] Connecting to MongoDB...');
    client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log('[DEBUG] Connected to MongoDB successfully');
  } catch (error) {
    console.error('[ERROR] Failed to connect to MongoDB:', error);
    throw error;
  }
}



async function getCollection() {
  if (!collection) {
    await connectToMongo();
  }
  return collection;
}


export async function getAllProducts() {
  try {
    const coll = await getCollection();
    const products = await coll.find({}).toArray();
    
    return products;
  } catch (error) {
    console.error('[ERROR] Failed to fetch products:', error);
    throw error;
  }
}

/**
 * Get products by IDs
 * @param {Array<string>} productIds - Array of product IDs
 * @returns {Promise<Array>} - Array of product documents
 */
export async function getProductsByIds(productIds) {
  try {
    const coll = await getCollection();
    const products = await coll.find({
      id: { $in: productIds }
    }).toArray();
    
    return products;
  } catch (error) {
    console.error('[ERROR] Failed to fetch products by IDs:', error);
    throw error;
  }
}

