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

  // Local static/mock translation fallback dictionary
  const norm = text.toLowerCase().trim();
  const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim().toLowerCase();

  const punjabiPhrases = {
    'hello': 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
    'hi': 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
    'yes': 'ਹਾਂ',
    'no': 'ਨਹੀਂ',
    'ok': 'ਠੀਕ ਹੈ',
    'okay': 'ਠੀਕ ਹੈ',
    'yes, fresh onions are available.': 'ਹਾਂ, ਤਾਜ਼ਾ ਪਿਆਜ਼ ਉਪਲਬਧ ਹਨ।',
    'no, we are currently sold out.': 'ਨਹੀਂ, ਸਾਡੇ ਕੋਲ ਹੁਣੇ ਖਤਮ ਹੋ ਗਿਆ ਹੈ।',
    'how much is the price for onion?': 'ਪਿਆਜ਼ ਦੀ ਕੀਮਤ ਕਿੰਨੀ ਹੈ?',
    'how much quantity do you require?': 'ਤੁਹਾਨੂੰ ਕਿੰਨੀ ਮਾਤਰਾ ਦੀ ਲੋੜ ਹੈ?',
    'prices are displayed on my listing page.': 'ਕੀਮਤਾਂ ਮੇਰੀ ਸੂਚੀ ਪੰਨੇ ਤੇ ਦਿਖਾਈਆਂ ਗਈਆਂ ਹਨ।'
  };

  const hindiPhrases = {
    'hello': 'नमस्ते',
    'hi': 'नमस्ते',
    'yes': 'हाँ',
    'no': 'नहीं',
    'ok': 'ठीक है',
    'okay': 'ठीक है',
    'yes, fresh onions are available.': 'हाँ, ताज़ा प्याज उपलब्ध हैं।',
    'no, we are currently sold out.': 'नहीं, अभी हमारे पास समाप्त हो गया है।',
    'how much is the price for onion?': 'प्याज का मूल्य कितना है?',
    'how much quantity do you require?': 'आपको कितनी मात्रा की आवश्यकता है?',
    'prices are displayed on my listing page.': 'मूल्य मेरी सूची पृष्ठ पर प्रदर्शित हैं।'
  };

  if (targetLang.toLowerCase() === 'punjabi') {
    // Check exact phrase first
    if (punjabiPhrases[norm]) return punjabiPhrases[norm];
    if (punjabiPhrases[cleanText]) return punjabiPhrases[cleanText];

    // Word by word fallback
    const words = text.split(/\s+/);
    const punjabiWords = {
      'hello': 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'hi': 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'yes': 'ਹਾਂ', 'no': 'ਨਹੀਂ', 'ok': 'ਠੀਕ ਹੈ', 'okay': 'ਠੀਕ ਹੈ',
      'available': 'ਉਪਲਬਧ', 'price': 'ਕੀਮਤ', 'cost': 'ਕੀਮਤ', 'onion': 'ਪਿਆਜ਼', 'onions': 'ਪਿਆਜ਼',
      'potato': 'ਆਲੂ', 'potatoes': 'ਆਲੂ', 'tomato': 'ਟਮਾਟਰ', 'tomatoes': 'ਟਮਾਟਰ', 'milk': 'ਦੁੱਧ',
      'paneer': 'ਪਨੀਰ', 'fresh': 'ਤਾਜ਼ਾ', 'quantity': 'ਮਾਤਰਾ', 'is': 'ਹੈ', 'are': 'ਹਨ'
    };
    const translated = words.map(w => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
      return punjabiWords[cleanW] || w;
    }).join(' ');
    return translated;
  }

  if (targetLang.toLowerCase() === 'hindi') {
    // Check exact phrase first
    if (hindiPhrases[norm]) return hindiPhrases[norm];
    if (hindiPhrases[cleanText]) return hindiPhrases[cleanText];

    // Word by word fallback
    const words = text.split(/\s+/);
    const hindiWords = {
      'hello': 'नमस्ते', 'hi': 'नमस्ते', 'yes': 'हाँ', 'no': 'नहीं', 'ok': 'ठीक है', 'okay': 'ठीक है',
      'available': 'उपलब्ध', 'price': 'मूल्य', 'cost': 'मूल्य', 'onion': 'प्याज', 'onions': 'प्याज',
      'potato': 'आलू', 'potatoes': 'आलू', 'tomato': 'टमाटर', 'tomatoes': 'टमाटर', 'milk': 'दूध',
      'paneer': 'पनीर', 'fresh': 'ताज़ा', 'quantity': 'मात्रा', 'is': 'है', 'are': 'हैं'
    };
    const translated = words.map(w => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
      return hindiWords[cleanW] || w;
    }).join(' ');
    return translated;
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
