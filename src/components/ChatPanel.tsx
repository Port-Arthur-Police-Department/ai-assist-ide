const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage: Message = { role: "user", content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

  let assistantContent = "";

  try {
    // Use the CORRECT Supabase project URL and key
    const supabaseUrl = 'https://kcdpdexzzoxaifabcqet.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZHBkZXh6em94YWlmYWJjcWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTc2MTgsImV4cCI6MjA3ODczMzYxOH0.1UpK0nife4Je1UD_S57UVy-tMkLJLYQL7kwUGIFRFxk';

    console.log('Calling Edge Function at:', `${supabaseUrl}/functions/v1/ai-assist`);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/ai-assist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          code,
          language,
          providers: {
            openai: { key: localStorage.getItem("openai_api_key") || "" },
            anthropic: { key: localStorage.getItem("anthropic_api_key") || "" },
            gemini: { key: localStorage.getItem("gemini_api_key") || "" },
            deepseek: { key: localStorage.getItem("deepseek_api_key") || "" },
          },
        }),
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      throw new Error(`Edge function failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No response body");

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (let line of lines) {
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === "assistant") {
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: assistantContent,
                };
              } else {
                newMessages.push({ role: "assistant", content: assistantContent });
              }
              return newMessages;
            });
          }
        } catch (e) {
          console.error("Error parsing SSE:", e, "Line:", line);
        }
      }
    }
  } catch (error) {
    console.error("Chat error:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to send message",
      variant: "destructive",
    });
    
    // Add error message to chat
    setMessages((prev) => [
      ...prev, 
      { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please check that your Edge Function is deployed to the correct project and try again." 
      }
    ]);
  } finally {
    setIsLoading(false);
  }
};
