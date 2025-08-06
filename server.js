const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// MIDDLEWARE SETUP - ORDER MATTERS!
app.use(cors());
app.use(express.json());

// Override CSP before serving static files
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:; " +
    "style-src 'self' 'unsafe-inline' http: https:; " +
    "img-src 'self' data: blob: http: https:; " +
    "connect-src 'self' http: https: ws: wss:; " +
    "font-src 'self' data: http: https:;"
  );
  next();
});

// Serve static files from current directory
app.use(express.static(__dirname));

// PUT YOUR ACTUAL API KEYS HERE
const CLAUDE_API_KEY = 'your-actual-claude-key-here';
const OPENAI_API_KEY = 'your-actual-openai-key-here';

// API Routes
app.post('/api/claude', async (req, res) => {
  try {
    console.log('🔍 Received Claude API request:', req.body.query);
    
    const { query } = req.body;
    
    if (!query) {
      return res.json({ success: false, error: 'Query is required' });
    }

    if (CLAUDE_API_KEY === 'your-actual-claude-key-here') {
      return res.json({ success: false, error: 'Claude API key not configured' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          { 
            role: 'user', 
            content: `You are InfoHealth AI, a medical information assistant specializing in 5 primary conditions: hypertension, cholesterol, asthma, acid reflux, and diabetes.

For the user question: "${query}"

Provide a comprehensive, well-structured medical response following this format:
- Start with brief disclaimer: "*Consult healthcare professionals for medical advice.*"
- Use clear section headers with **bold text**
- Include bullet points for easy reading
- Add blank lines between major sections for readability
- Focus on practical information patients need

Make your response clearly different from a basic keyword lookup - provide context, explanations, and helpful details.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API Error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Claude API Success - Response length:', data.content[0].text.length);
    
    res.json({ 
      success: true, 
      response: data.content[0].text 
    });

  } catch (error) {
    console.error('❌ Claude API Error:', error.message);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// OpenAI backup endpoint
app.post('/api/openai', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (OPENAI_API_KEY === 'your-actual-openai-key-here') {
      return res.json({ success: false, error: 'OpenAI API key not configured' });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `You are InfoHealth AI. Answer: ${query}` }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    const data = await response.json();
    res.json({ 
      success: true, 
      response: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Explicit route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 InfoHealth AI server running at http://localhost:${PORT}`);
  console.log('📝 Open your browser to http://localhost:3000 to use the app');
  console.log('📁 Serving files from:', __dirname);
});