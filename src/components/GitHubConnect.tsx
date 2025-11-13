import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Github, FolderGit2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GitHubConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepoLoad: (files: any[]) => void;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  updated_at: string;
}

export const GitHubConnect = ({ open, onOpenChange, onRepoLoad }: GitHubConnectProps) => {
  const [token, setToken] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem("github_token");
    if (savedToken) {
      setToken(savedToken);
      fetchRepos(savedToken);
    }
  }, []);

  const fetchRepos = async (accessToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("github-auth", {
        body: { action: "repos", token: accessToken },
      });

      if (error) throw error;
      setRepos(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch repositories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    localStorage.setItem("github_token", token);
    fetchRepos(token);
    toast({
      title: "Connected",
      description: "GitHub token saved successfully",
    });
  };

  const loadRepoFiles = async (repoFullName: string) => {
    setLoading(true);
    setSelectedRepo(repoFullName);
    try {
      const [owner, repo] = repoFullName.split("/");
      const files: any[] = [];

      const loadDirectory = async (path = "") => {
        const { data, error } = await supabase.functions.invoke("github-auth", {
          body: { action: "contents", token, owner, repo, path },
        });

        if (error) throw error;

        for (const item of data) {
          if (item.type === "file") {
            const { data: fileData } = await supabase.functions.invoke("github-auth", {
              body: { action: "file", token, owner, repo, path: item.path },
            });

            const language = item.name.split(".").pop() || "text";
            files.push({
              name: item.path,
              content: fileData?.content || "",
              language,
            });
          } else if (item.type === "dir") {
            await loadDirectory(item.path);
          }
        }
      };

      await loadDirectory();
      onRepoLoad(files);
      onOpenChange(false);
      
      toast({
        title: "Repository Loaded",
        description: `Loaded ${files.length} files from ${repoFullName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load repository files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedRepo(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect to GitHub
          </DialogTitle>
          <DialogDescription>
            Enter your GitHub personal access token to load repositories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="GitHub Personal Access Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={handleConnect} disabled={!token || loading}>
              Connect
            </Button>
          </div>

          {repos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Your Repositories</h3>
              <ScrollArea className="h-[400px] border rounded-md">
                <div className="p-4 space-y-2">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => !loading && loadRepoFiles(repo.full_name)}
                    >
                      <div className="flex items-center gap-3">
                        <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {repo.description || "No description"}
                          </p>
                        </div>
                      </div>
                      {loading && selectedRepo === repo.full_name && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Create a token at:{" "}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              github.com/settings/tokens
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};