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
import { Switch } from "@/components/ui/switch";
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
  const [openaiEnabled, setOpenaiEnabled] = useState(false);
  const [anthropicEnabled, setAnthropicEnabled] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [deepseekEnabled, setDeepseekEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setOpenaiKey(localStorage.getItem("openai_api_key") || "");
      setAnthropicKey(localStorage.getItem("anthropic_api_key") || "");
      setGeminiKey(localStorage.getItem("gemini_api_key") || "");
      setDeepseekKey(localStorage.getItem("deepseek_api_key") || "");
      setOpenaiEnabled(localStorage.getItem("openai_enabled") === "true");
      setAnthropicEnabled(localStorage.getItem("anthropic_enabled") === "true");
      setGeminiEnabled(localStorage.getItem("gemini_enabled") === "true");
      setDeepseekEnabled(localStorage.getItem("deepseek_enabled") === "true");
    }
  }, [open]);

  const saveSettings = () => {
    if (openaiKey) localStorage.setItem("openai_api_key", openaiKey);
    else localStorage.removeItem("openai_api_key");

    if (anthropicKey) localStorage.setItem("anthropic_api_key", anthropicKey);
    else localStorage.removeItem("anthropic_api_key");

    if (geminiKey) localStorage.setItem("gemini_api_key", geminiKey);
    else localStorage.removeItem("gemini_api_key");

    if (deepseekKey) localStorage.setItem("deepseek_api_key", deepseekKey);
    else localStorage.removeItem("deepseek_api_key");

    localStorage.setItem("openai_enabled", openaiEnabled.toString());
    localStorage.setItem("anthropic_enabled", anthropicEnabled.toString());
    localStorage.setItem("gemini_enabled", geminiEnabled.toString());
    localStorage.setItem("deepseek_enabled", deepseekEnabled.toString());

    const enabledCount = [openaiEnabled, anthropicEnabled, geminiEnabled, deepseekEnabled].filter(Boolean).length;
    toast({
      title: "Settings Saved",
      description: enabledCount > 0 ? `Using ${enabledCount} custom AI provider(s)` : "Using default Lovable AI",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Enable and configure your AI providers. Toggle on to use custom API keys.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="openai-toggle" className="font-semibold">OpenAI</Label>
                <p className="text-xs text-muted-foreground">Enable to use GPT models</p>
              </div>
              <Switch id="openai-toggle" checked={openaiEnabled} onCheckedChange={setOpenaiEnabled} />
            </div>
            {openaiEnabled && (
              <div className="space-y-2">
                <Label htmlFor="openai">API Key</Label>
                <Input id="openai" type="password" placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="anthropic-toggle" className="font-semibold">Anthropic</Label>
                <p className="text-xs text-muted-foreground">Enable to use Claude models</p>
              </div>
              <Switch id="anthropic-toggle" checked={anthropicEnabled} onCheckedChange={setAnthropicEnabled} />
            </div>
            {anthropicEnabled && (
              <div className="space-y-2">
                <Label htmlFor="anthropic">API Key</Label>
                <Input id="anthropic" type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="gemini-toggle" className="font-semibold">Google Gemini</Label>
                <p className="text-xs text-muted-foreground">Enable to use Gemini models</p>
              </div>
              <Switch id="gemini-toggle" checked={geminiEnabled} onCheckedChange={setGeminiEnabled} />
            </div>
            {geminiEnabled && (
              <div className="space-y-2">
                <Label htmlFor="gemini">API Key</Label>
                <Input id="gemini" type="password" placeholder="AIza..." value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="deepseek-toggle" className="font-semibold">DeepSeek</Label>
                <p className="text-xs text-muted-foreground">Enable to use DeepSeek models</p>
              </div>
              <Switch id="deepseek-toggle" checked={deepseekEnabled} onCheckedChange={setDeepseekEnabled} />
            </div>
            {deepseekEnabled && (
              <div className="space-y-2">
                <Label htmlFor="deepseek">API Key</Label>
                <Input id="deepseek" type="password" placeholder="sk-..." value={deepseekKey} onChange={(e) => setDeepseekKey(e.target.value)} />
              </div>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Default:</strong> When all providers are disabled, the app uses Lovable AI (Gemini Flash) at no additional cost.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={saveSettings}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};