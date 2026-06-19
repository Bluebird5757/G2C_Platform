import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini if key is present
let aiModel = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash as the standard fast text model
    aiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err.message);
  }
}

/**
 * Helper to clean Markdown wrappers from LLM JSON responses
 */
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * 1. Semantic Search Query Parsing
 */
export const parseSemanticSearch = async (queryText) => {
  if (aiModel) {
    try {
      const prompt = `You are an AI assistant parsing search queries for an agricultural portal named G2C (Grower2Consumer).
Convert the user's natural language query into a structured JSON object containing:
- "category" (Must be exactly one of: "Milk Product", "Fruits", "Vegetables", or null if not mentioned/implied)
- "item" (The specific crop/product singular lowercase, e.g., "apple", "tomato", "milk", "paneer", or null if not mentioned)
- "city" (The city name capitalized, e.g., "Amritsar", "Bathinda", "Ludhiana", or null if not mentioned)

Return ONLY raw JSON, do not wrap in markdown block.

User Query: "${queryText}"`;

      const result = await aiModel.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(cleanJsonString(text));
      return {
        category: parsed.category || null,
        item: parsed.item || null,
        city: parsed.city || null,
      };
    } catch (err) {
      console.warn('Gemini search parse failed, falling back to local:', err.message);
    }
  }

  // Local Keyword-based parser fallback
  const normalized = queryText.toLowerCase();
  const res = { category: null, item: null, city: null };

  // Cities
  if (normalized.includes('amritsar')) res.city = 'Amritsar';
  else if (normalized.includes('bathinda')) res.city = 'Bathinda';
  else if (normalized.includes('ludhiana')) res.city = 'Ludhiana';

  // Items & Categories
  const items = [
    { name: 'onion', cat: 'Vegetables' },
    { name: 'tomato', cat: 'Vegetables' },
    { name: 'potato', cat: 'Vegetables' },
    { name: 'spinach', cat: 'Vegetables' },
    { name: 'paneer', cat: 'Milk Product' },
    { name: 'curd', cat: 'Milk Product' },
    { name: 'cheese', cat: 'Milk Product' },
    { name: 'ice cream', cat: 'Milk Product' },
    { name: 'apple', cat: 'Fruits' },
    { name: 'watermelon', cat: 'Fruits' },
    { name: 'kiwi', cat: 'Fruits' },
    { name: 'dragon fruit', cat: 'Fruits' },
  ];

  for (const it of items) {
    if (normalized.includes(it.name)) {
      res.item = it.name;
      res.category = it.cat;
      break;
    }
  }

  // Broad category search if no specific item
  if (!res.category) {
    if (normalized.includes('vegetable') || normalized.includes('veg')) res.category = 'Vegetables';
    else if (normalized.includes('fruit')) res.category = 'Fruits';
    else if (normalized.includes('milk') || normalized.includes('dairy')) res.category = 'Milk Product';
  }

  return res;
};

/**
 * 2. Translation Service
 */
export const translateText = async (text, targetLang) => {
  if (aiModel) {
    try {
      const prompt = `Translate the following text to ${targetLang}. Return ONLY the translated text, do not add explanations or notes.
Text: "${text}"`;
      const result = await aiModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn('Gemini translation failed, falling back to local:', err.message);
    }
  }

  // Local static/mock translation fallback
  const norm = text.toLowerCase().trim();
  if (targetLang.toLowerCase() === 'punjabi') {
    if (norm === 'hello' || norm === 'hi') return 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ';
    if (norm.includes('price') || norm.includes('how much')) return 'ਇਸਦੀ ਕੀਮਤ ਕੀ ਹੈ?';
    if (norm.includes('available')) return 'ਕੀ ਇਹ ਉਪਲਬਧ ਹੈ?';
    return `[ਪੰਜਾਬੀ ਅਨੁਵਾਦ]: ${text}`;
  }

  if (targetLang.toLowerCase() === 'hindi') {
    if (norm === 'hello' || norm === 'hi') return 'नमस्ते';
    if (norm.includes('price') || norm.includes('how much')) return 'इसका मूल्य क्या है?';
    if (norm.includes('available')) return 'क्या यह उपलब्ध है?';
    return `[हिंदी अनुवाद]: ${text}`;
  }

  return text;
};

/**
 * 3. Contextual Smart Replies
 */
export const getSmartReplies = async (messageText) => {
  if (aiModel) {
    try {
      const prompt = `You are a helper for a farm-to-table agricultural chat portal. 
A grower received the following message from a customer:
"${messageText}"

Generate exactly 3 short, context-appropriate response options that the grower can click to send. Keep each option under 8 words. 
Return ONLY a JSON array of strings. Do not add markdown wrappers.`;

      const result = await aiModel.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(cleanJsonString(text));
    } catch (err) {
      console.warn('Gemini smart replies failed, falling back to local:', err.message);
    }
  }

  // Local fallback replies
  const norm = messageText.toLowerCase();
  if (norm.includes('price') || norm.includes('cost') || norm.includes('rate') || norm.includes('how much')) {
    return [
      'Fresh onions are available at ₹40/kg.',
      'How much quantity do you require?',
      'Prices are displayed on my listing page.',
    ];
  }

  if (norm.includes('available') || norm.includes('have') || norm.includes('stock') || norm.includes('paneer')) {
    return [
      'Yes, fresh stock is available.',
      'No, we are currently sold out.',
      'We will receive a fresh batch tomorrow.',
    ];
  }

  return [
    'Hello! How can I help you today?',
    'Yes, direct pickup is available.',
    'Can you collect them tomorrow morning?',
  ];
};
