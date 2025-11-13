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
    
    console.log('AI Assist:', { language, providersEnabled: Object.keys(providers || {}).filter(k => providers[k]) });

    const systemPrompt = `You are an expert coding assistant. Help users write and improve code.
    
Current code (${language}):
\`\`\`${language}
${code}
\`\`\`

Provide concise, working code with explanations.`;

    let apiUrl: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let requestBody: any;

    // Priority: OpenAI > Anthropic > Gemini > DeepSeek > Lovable AI
    if (providers?.openai?.key) {
      console.log('Using OpenAI');
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${providers.openai.key}`;
      requestBody = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      };
    } else if (providers?.anthropic?.key) {
      console.log('Using Anthropic');
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = providers.anthropic.key;
      headers['anthropic-version'] = '2023-06-01';
      requestBody = {
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        stream: true,
      };
    } else if (providers?.gemini?.key) {
      console.log('Using Gemini');
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${providers.gemini.key}`;
      requestBody = {
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages.map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
        ],
      };
    } else if (providers?.deepseek?.key) {
      console.log('Using DeepSeek');
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${providers.deepseek.key}`;
      requestBody = {
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      };
    } else {
      console.log('Using Lovable AI');
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      headers['Authorization'] = `Bearer ${LOVABLE_API_KEY}`;
      requestBody = {
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});