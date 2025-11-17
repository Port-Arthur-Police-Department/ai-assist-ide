import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface ProfileData {
  username: string;
  avatar_url: string;
  preferred_language: string;
  theme_preference: string;
}

interface SettingsData {
  editor_font_size: number;
  editor_theme: string;
  auto_save: boolean;
  line_numbers: boolean;
  word_wrap: boolean;
  ai_model_preference: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    avatar_url: "",
    preferred_language: "javascript",
    theme_preference: "dark",
  });

  const [settings, setSettings] = useState<SettingsData>({
    editor_font_size: 14,
    editor_theme: "vs-dark",
    auto_save: true,
    line_numbers: true,
    word_wrap: false,
    ai_model_preference: "gpt-4",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          username: profileData.username || "",
          avatar_url: profileData.avatar_url || "",
          preferred_language: profileData.preferred_language || "javascript",
          theme_preference: profileData.theme_preference || "dark",
        });
      }

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      if (settingsData) {
        setSettings({
          editor_font_size: settingsData.editor_font_size || 14,
          editor_theme: settingsData.editor_theme || "vs-dark",
          auto_save: settingsData.auto_save ?? true,
          line_numbers: settingsData.line_numbers ?? true,
          word_wrap: settingsData.word_wrap ?? false,
          ai_model_preference: settingsData.ai_model_preference || "gpt-4",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          avatar_url: profile.avatar_url,
          preferred_language: profile.preferred_language,
          theme_preference: profile.theme_preference,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          editor_font_size: settings.editor_font_size,
          editor_theme: settings.editor_theme,
          auto_save: settings.auto_save,
          line_numbers: settings.line_numbers,
          word_wrap: settings.word_wrap,
          ai_model_preference: settings.ai_model_preference,
        }, {
          onConflict: "user_id",
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to IDE
        </Button>

        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={profile.preferred_language}
                  onValueChange={(value) => setProfile({ ...profile, preferred_language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme Preference</Label>
                <Select
                  value={profile.theme_preference}
                  onValueChange={(value) => setProfile({ ...profile, theme_preference: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Editor Settings</CardTitle>
              <CardDescription>Customize your coding environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="10"
                  max="24"
                  value={settings.editor_font_size}
                  onChange={(e) => setSettings({ ...settings, editor_font_size: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorTheme">Editor Theme</Label>
                <Select
                  value={settings.editor_theme}
                  onValueChange={(value) => setSettings({ ...settings, editor_theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="hc-black">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiModel">AI Model Preference</Label>
                <Select
                  value={settings.ai_model_preference}
                  onValueChange={(value) => setSettings({ ...settings, ai_model_preference: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave">Auto Save</Label>
                <Switch
                  id="autoSave"
                  checked={settings.auto_save}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_save: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lineNumbers">Show Line Numbers</Label>
                <Switch
                  id="lineNumbers"
                  checked={settings.line_numbers}
                  onCheckedChange={(checked) => setSettings({ ...settings, line_numbers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="wordWrap">Word Wrap</Label>
                <Switch
                  id="wordWrap"
                  checked={settings.word_wrap}
                  onCheckedChange={(checked) => setSettings({ ...settings, word_wrap: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
