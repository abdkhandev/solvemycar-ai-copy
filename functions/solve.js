const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt required' }) };
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are SolveMyCar, an expert AI mechanic. Provide detailed, step-by-step diagnostic advice based on user symptoms. Use lists, bold key terms, and suggest tools/codes. Keep responses concise, helpful, and safe—advise professional help for serious issues. Format with HTML like <ol>, <ul>, <b> for readability.'
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content;
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Update to Netlify URL after deployment
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ html: reply })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'AI service error. Try again later.' })
    };
  }
};
