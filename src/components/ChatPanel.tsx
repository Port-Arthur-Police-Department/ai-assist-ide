import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  code: string;
  language: string;
  onApplyCode: (code: string) => void;
}

export const ChatPanel = ({ code, language, onApplyCode }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simple mock AI response for when Edge Function is not available
  const getMockAIResponse = (userInput: string, currentCode: string, currentLanguage: string): string => {
    const responses = [
      `I can see you're working with ${currentLanguage} code! Currently, the AI assistant is being set up.\n\nYour code:\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`\n\nTo enable full AI features, please deploy the Edge Function in your Supabase project.`,
      `Thanks for your message about "${userInput}". The AI functionality requires the Edge Function to be deployed.\n\nYou can deploy it by running:\n\`\`\`bash\nsupabase functions deploy ai-assist\n\`\`\``,
      `I'd love to help you with your ${currentLanguage} code! Currently, the backend AI service is being configured.\n\nIn the meantime, you can:\n1. Deploy the Edge Function\n2. Add your API keys in settings\n3. Start chatting with AI!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use hardcoded values for GitHub Pages deployment
      const supabaseUrl = 'https://kcdpdexzzoxaifabcqet.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZHBkZXh6em94YWlmYWJjcWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTc2MTgsImV4cCI6MjA3ODczMzYxOH0.1UpK0nife4Je1UD_S57UVy-tMkLJLYQL7kwUGIFRFxk';

      // Get enabled provider settings
      const openaiEnabled = localStorage.getItem("openai_enabled") === "true";
      const anthropicEnabled = localStorage.getItem("anthropic_enabled") === "true";
      const geminiEnabled = localStorage.getItem("gemini_enabled") === "true";
      const deepseekEnabled = localStorage.getItem("deepseek_enabled") === "true";

      const openaiKey = localStorage.getItem("openai_api_key") || "";
      const anthropicKey = localStorage.getItem("anthropic_api_key") || "";
      const geminiKey = localStorage.getItem("gemini_api_key") || "";
      const deepseekKey = localStorage.getItem("deepseek_api_key") || "";

      // Check if any provider is actually configured
      const hasConfiguredProvider = (openaiEnabled && openaiKey) || 
                                   (anthropicEnabled && anthropicKey) || 
                                   (geminiEnabled && geminiKey) || 
                                   (deepseekEnabled && deepseekKey);

      if (!hasConfiguredProvider) {
        // No providers configured, use mock response
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate thinking
        const mockResponse = getMockAIResponse(input, code, language);
        setMessages((prev) => [...prev, { role: "assistant", content: mockResponse }]);
        return;
      }

      // Try to call the Edge Function
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
              openai: openaiEnabled && openaiKey ? { key: openaiKey } : null,
              anthropic: anthropicEnabled && anthropicKey ? { key: anthropicKey } : null,
              gemini: geminiEnabled && geminiKey ? { key: geminiKey } : null,
              deepseek: deepseekEnabled && deepseekKey ? { key: deepseekKey } : null,
            },
          }),
        }
      );

      // Check if we got an HTML error page (function not deployed)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('EDGE_FUNCTION_NOT_DEPLOYED');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Try to parse as SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body received");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          if (line.startsWith(":") || line.trim() === "") continue;
          if (line.startsWith("data: ")) {
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
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      
      let errorMessage = "Failed to get AI response";
      let assistantResponse = "I encountered an error while processing your request.";

      if (error instanceof Error) {
        if (error.message === 'EDGE_FUNCTION_NOT_DEPLOYED') {
          errorMessage = "Edge Function not deployed";
          assistantResponse = `## Edge Function Required 🔧\n\nTo use the AI assistant, you need to deploy the Edge Function:\n\n\`\`\`bash\nsupabase functions deploy ai-assist\n\`\`\`\n\n**Steps:**\n1. Install Supabase CLI\n2. Run the deploy command above\n3. Add your API keys in settings\n4. Start chatting!`;
        } else if (error.message.includes('HTTP 405')) {
          errorMessage = "Method not allowed - Function may not exist";
          assistantResponse = `## Setup Required ⚙️\n\nThe AI assistant function isn't deployed yet. Please deploy the Edge Function in your Supabase project to enable AI features.`;
        } else {
          errorMessage = error.message;
          assistantResponse = `I encountered an error: ${error.message}\n\nPlease check that:\n- The Edge Function is deployed\n- You have valid API keys configured\n- The function URL is correct`;
        }
      }

      // Add error message to chat
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: assistantResponse }
      ]);

      toast({
        title: "AI Assistant Setup Required",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractCode = (text: string): string | null => {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  };

  const openSettings = () => {
    // Trigger settings dialog open - you might need to adjust this based on your app structure
    const event = new CustomEvent('open-settings');
    window.dispatchEvent(event);
  };

  return (
    <div className="h-full flex flex-col bg-chat-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-sm font-semibold">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={openSettings}
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium mb-2">AI Code Assistant</p>
              <p className="text-xs mb-4">Get help with your code using AI</p>
              <div className="text-left text-xs space-y-2 bg-muted/50 p-3 rounded-lg">
                <p>🔧 <strong>Setup required:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Deploy Edge Function in Supabase</li>
                  <li>Add API keys in settings</li>
                  <li>Start chatting with AI</li>
                </ol>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && extractCode(msg.content) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      const extractedCode = extractCode(msg.content);
                      if (extractedCode) {
                        onApplyCode(extractedCode);
                        toast({
                          title: "Code Applied",
                          description: "The AI's code has been inserted into the editor",
                        });
                      }
                    }}
                  >
                    Apply Code
                  </Button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask AI to help with your code..."
            className="min-h-[60px] resize-none bg-background"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="h-[60px] w-[60px] p-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
