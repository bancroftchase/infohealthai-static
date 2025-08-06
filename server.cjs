const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// PUT YOUR ACTUAL API KEYS HERE (safe on your local machine)
const CLAUDE_API_KEY = 'your-actual-claude-key-here';
const OPENAI_API_KEY = 'your-actual-openai-key-here';

// Claude API endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.json({ success: false, error: 'Query is required' });
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
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    res.json({ 
      success: true, 
      response: data.content[0].text 
    });

  } catch (error) {
    console.error('Claude API Error:', error);
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
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 InfoHealth AI server running at http://localhost:${PORT}`);
  console.log('📝 Open your browser to http://localhost:3000 to use the app');
});