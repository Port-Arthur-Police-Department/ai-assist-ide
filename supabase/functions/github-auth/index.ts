import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, token, owner, repo, path } = await req.json();

    if (!token) {
      throw new Error('GitHub token is required');
    }

    // Get user repositories
    if (action === 'repos') {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Assist-IDE'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error:', response.status, errorText);
        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
      }

      const repos = await response.json();
      return new Response(JSON.stringify(repos), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get repository contents
    if (action === 'contents') {
      if (!owner || !repo) {
        throw new Error('Owner and repo are required');
      }

      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path || ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Assist-IDE'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error:', response.status, errorText);
        throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`);
      }

      const contents = await response.json();
      return new Response(JSON.stringify(contents), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get file content
    if (action === 'file') {
      if (!owner || !repo || !path) {
        throw new Error('Owner, repo, and path are required');
      }

      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'AI-Assist-IDE'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error:', response.status, errorText);
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Invalid action: ${action}`);

  } catch (error) {
    console.error('Error in github-auth function:', error);
    
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
