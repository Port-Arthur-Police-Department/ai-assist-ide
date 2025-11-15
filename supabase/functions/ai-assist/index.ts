import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, code, language, providers } = await req.json();
    
    console.log('=== AI ASSIST DEBUG INFO ===');
    console.log('Language:', language);
    console.log('Last message:', messages[messages.length - 1]?.content?.substring(0, 100));
    console.log('Providers received:', providers);
    
    // Debug each provider
    if (providers) {
      Object.entries(providers).forEach(([providerName, providerData]: [string, any]) => {
        if (providerData && providerData.key) {
          const key = providerData.key;
          console.log(`${providerName}: KEY PRESENT (length: ${key.length}), starts with: ${key.substring(0, 10)}...`);
        } else {
          console.log(`${providerName}: NO KEY or disabled`);
        }
      });
    }

    const systemPrompt = `You are an expert coding assistant. Help users write and improve code.
    
Current code (${language}):
\`\`\`${language}
${code}
\`\`\`

Provide concise, working code with explanations.`;

    let apiUrl: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let requestBody: any;
    let providerUsed = 'none';

    // Priority: OpenAI > Anthropic > Gemini > DeepSeek > Lovable AI
    if (providers?.openai?.key) {
      providerUsed = 'openai';
      console.log('Using OpenAI');
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${providers.openai.key}`;
      requestBody = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      };
    } else if (providers?.anthropic?.key) {
      providerUsed = 'anthropic';
      console.log('Using Anthropic');
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = providers.anthropic.key;
      headers['anthropic-version'] = '2023-06-01';
      requestBody = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        stream: true,
      };
    } else if (providers?.gemini?.key) {
      providerUsed = 'gemini';
      console.log('Using Gemini');
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${providers.gemini.key}`;
      requestBody = {
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages.map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
        ],
      };
    } else if (providers?.deepseek?.key) {
      providerUsed = 'deepseek';
      console.log('Using DeepSeek');
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers['Authorization'] = `Bearer ${providers.deepseek.key}`;
      requestBody = {
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      };
    } else {
      console.log('No valid provider found - using fallback');
      // Fallback mock response
      const mockResponse = `I can see you're working with ${language} code! 

Your current code:
\`\`\`${language}
${code}
\`\`\`

I can help you with:
- Code improvements and optimizations
- Bug fixes and debugging
- Adding new features
- Code explanations
- Best practices

To enable full AI capabilities, make sure your API keys are properly configured for your preferred AI providers.`;

      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream({
          start(controller) {
            const chunks = mockResponse.split(' ');
            let index = 0;
            
            const sendChunk = () => {
              if (index < chunks.length) {
                const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '');
                const response = {
                  choices: [{
                    delta: {
                      content: chunk
                    }
                  }]
                };
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
                index++;
                setTimeout(sendChunk, 50);
              } else {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            };
            
            sendChunk();
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        }
      );
    }

    console.log(`Making request to ${providerUsed} API...`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log(`Response status from ${providerUsed}:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // Return a helpful error message
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream({
          start(controller) {
            const errorResponse = {
              choices: [{
                delta: {
                  content: `Error from ${providerUsed} API (${response.status}): ${errorText.substring(0, 200)}...\n\nPlease check your API key and try again.`
                }
              }]
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        }
      );
    }

    console.log(`Successfully connected to ${providerUsed} API, streaming response...`);
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    
    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        start(controller) {
          const errorResponse = {
            choices: [{
              delta: {
                content: `Unexpected error: ${message}\n\nPlease check the console for details.`
              }
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      }
    );
  }
});
