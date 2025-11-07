import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const storedOpenai = localStorage.getItem("openai_api_key") || "";
      const storedAnthropic = localStorage.getItem("anthropic_api_key") || "";
      const storedGemini = localStorage.getItem("gemini_api_key") || "";
      const storedDeepseek = localStorage.getItem("deepseek_api_key") || "";
      setOpenaiKey(storedOpenai);
      setAnthropicKey(storedAnthropic);
      setGeminiKey(storedGemini);
      setDeepseekKey(storedDeepseek);
    }
  }, [open]);

  const saveSettings = () => {
    if (openaiKey) {
      localStorage.setItem("openai_api_key", openaiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }

    if (anthropicKey) {
      localStorage.setItem("anthropic_api_key", anthropicKey);
    } else {
      localStorage.removeItem("anthropic_api_key");
    }

    if (geminiKey) {
      localStorage.setItem("gemini_api_key", geminiKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }

    if (deepseekKey) {
      localStorage.setItem("deepseek_api_key", deepseekKey);
    } else {
      localStorage.removeItem("deepseek_api_key");
    }

    toast({
      title: "Settings Saved",
      description: "Your API keys have been stored locally",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider API keys. Keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="openai">OpenAI API Key</Label>
            <Input
              id="openai"
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional - for GPT models
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anthropic">Anthropic API Key</Label>
            <Input
              id="anthropic"
              type="password"
              placeholder="sk-ant-..."
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional - for Claude models
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gemini">Google Gemini API Key</Label>
            <Input
              id="gemini"
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional - for Gemini models
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deepseek">DeepSeek API Key</Label>
            <Input
              id="deepseek"
              type="password"
              placeholder="sk-..."
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional - for DeepSeek models
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This IDE uses Lovable AI by default, which doesn't require API keys. 
              Add your own keys only if you want to use specific AI providers.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
