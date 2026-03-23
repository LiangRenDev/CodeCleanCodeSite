// Cloudflare Pages Function to handle chatbot requests
// This proxies requests to the custom LLM endpoint with CORS headers

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Get the request body
    const body = await request.json();

    // Forward to custom LLM endpoint
    const llmResponse = await fetch('https://6b79-16-176-154-194.ngrok-free.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model || 'minimax-portal/MiniMax-M2.5',
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
