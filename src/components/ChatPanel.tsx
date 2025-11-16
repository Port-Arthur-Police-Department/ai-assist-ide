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
  onOpenSettings?: () => void;
}

export const ChatPanel = ({ code, language, onApplyCode, onOpenSettings }: ChatPanelProps) => {
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
    // More helpful responses based on user input
    if (userInput.toLowerCase().includes('help') || userInput.toLowerCase().includes('how')) {
      return `## Getting Started with AI Assistant 🚀

I can help you with your ${currentLanguage} code! To enable full AI features:

1. **Click the gear icon** ⚙️ in the top-right of this panel
2. **Enable at least one AI provider** (OpenAI, Anthropic, Gemini, or DeepSeek)
3. **Add your API key** for the enabled provider
4. **Start chatting!**

**Language:** ${currentLanguage}

Try asking me to:
- Explain the code
- Suggest improvements  
- Help debug issues
- Generate new features`;
    }

    // Default helpful response
    return `## Welcome to AI Assist! 👋

I see you're working with **${currentLanguage}** code. The AI assistant is ready to help!

**To unlock full AI capabilities:**
1. Open Settings (gear icon ⚙️)
2. Enable your preferred AI provider
3. Add your API key

**Quick tips:**
- Ask me to explain, improve, or debug your code
- Use "Apply Code" to insert AI suggestions
- I can help with multiple programming languages

Your current code is ${currentCode.length} characters long. Need help with anything specific?`;
  };

  const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage: Message = { role: "user", content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

  try {
    // Get enabled provider settings
    const openaiEnabled = localStorage.getItem("openai_enabled") === "true";
    const anthropicEnabled = localStorage.getItem("anthropic_enabled") === "true";
    const geminiEnabled = localStorage.getItem("gemini_enabled") === "true";
    const deepseekEnabled = localStorage.getItem("deepseek_enabled") === "true";

    const openaiKey = localStorage.getItem("openai_api_key") || "";
    const anthropicKey = localStorage.getItem("anthropic_api_key") || "";
    const geminiKey = localStorage.getItem("gemini_api_key") || "";
    const deepseekKey = localStorage.getItem("deepseek_api_key") || "";

    // Check if any provider is actually configured with valid keys
    const hasConfiguredProvider = 
      (openaiEnabled && openaiKey && openaiKey.length > 10) || 
      (anthropicEnabled && anthropicKey && anthropicKey.length > 10) || 
      (geminiEnabled && geminiKey && geminiKey.length > 10) || 
      (deepseekEnabled && deepseekKey && deepseekKey.length > 10);

    console.log('AI Provider Check:', {
      openaiEnabled, openaiKeyLength: openaiKey.length,
      anthropicEnabled, anthropicKeyLength: anthropicKey.length,
      geminiEnabled, geminiKeyLength: geminiKey.length,
      deepseekEnabled, deepseekKeyLength: deepseekKey.length,
      hasConfiguredProvider
    });

    if (!hasConfiguredProvider) {
      // No providers configured, use mock response
      console.log('No configured providers found, using mock response');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = getMockAIResponse(input, code, language);
      setMessages((prev) => [...prev, { role: "assistant", content: mockResponse }]);
      return;
    }

    // Call the Edge Function
    console.log('Calling Edge Function with providers');
    const { data, error } = await supabase.functions.invoke('ai-assist', {
      body: {
        messages: [...messages, userMessage],
        code,
        language,
        providers: {
          openai: openaiEnabled && openaiKey ? { key: openaiKey } : null,
          anthropic: anthropicEnabled && anthropicKey ? { key: anthropicKey } : null,
          gemini: geminiEnabled && geminiKey ? { key: geminiKey } : null,
          deepseek: deepseekEnabled && deepseekKey ? { key: deepseekKey } : null,
        },
      },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error(`Edge Function Error: ${error.message}`);
    }

    // Handle streaming response
    if (data && typeof data.text === 'function') {
      // This is a ReadableStream
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      // Add initial assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                assistantContent += content;
                // Update the last message with new content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.log('Non-JSON line:', data);
            }
          }
        }
      }
    } else {
      // Handle non-streaming response
      const responseContent = data?.choices?.[0]?.message?.content || 
                            data?.content || 
                            "I received your message but couldn't generate a response.";
      
      setMessages((prev) => [...prev, { role: "assistant", content: responseContent }]);
    }

  } catch (error) {
    console.error("Chat error:", error);
    
    let errorMessage = "Failed to get AI response";
    let assistantResponse = "I encountered an error while processing your request.";

    if (error instanceof Error) {
      errorMessage = error.message;
      assistantResponse = `## API Error ⚠️\n\nError: ${error.message}\n\nPlease check:\n- Your API keys are valid\n- You have sufficient credits\n- The service is available`;
    }

    setMessages((prev) => [
      ...prev, 
      { role: "assistant", content: assistantResponse }
    ]);

    toast({
      title: "AI Assistant Error",
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

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      // Fallback to custom event
      const event = new CustomEvent('open-settings');
      window.dispatchEvent(event);
    }
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
          onClick={handleSettingsClick}
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
