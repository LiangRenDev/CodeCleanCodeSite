// Cloudflare Pages Function to handle chatbot requests
// Uses MiniMax API directly (or configure your own LLM)

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Get the request body
    const body = await request.json();

    // MiniMax API configuration
    // You can set these in Cloudflare Pages environment variables
    const API_KEY = env.LLM_API_KEY || '';
    const API_BASE = env.LLM_API_BASE || 'https://6b79-16-176-154-194.ngrok-free.app/v1';
    const MODEL = body.model || 'minimax-portal/MiniMax-M2.5';

    // If using ngrok endpoint, include the API key in the request
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided in env or use custom header for ngrok
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    if (!API_KEY) {
      return new Response(JSON.stringify({
        error: 'API key not configured. Please set LLM_API_KEY in environment variables.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Forward to LLM API
    const llmResponse = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: MODEL,
        messages: body.messages,
        max_tokens: body.max_tokens || 500,
        stream: body.stream || false,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error('LLM API error:', errorText);

      return new Response(JSON.stringify({
        error: 'Failed to get response from LLM'
      }), {
        status: llmResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const result = await llmResponse.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
