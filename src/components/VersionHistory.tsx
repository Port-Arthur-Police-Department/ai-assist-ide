import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  timestamp: number;
  files: any[];
  description: string;
}

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFiles: any[];
  onRestore: (files: any[]) => void;
}

export const VersionHistory = ({ open, onOpenChange, currentFiles, onRestore }: VersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = () => {
    const saved = localStorage.getItem("version_history");
    if (saved) {
      setVersions(JSON.parse(saved));
    }
  };

  const saveVersion = (description: string = "Auto-save") => {
    const newVersion: Version = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      files: currentFiles,
      description,
    };

    const updated = [newVersion, ...versions].slice(0, 50); // Keep last 50 versions
    setVersions(updated);
    localStorage.setItem("version_history", JSON.stringify(updated));

    toast({
      title: "Version Saved",
      description: "Project snapshot created successfully",
    });
  };

  const restoreVersion = (version: Version) => {
    onRestore(version.files);
    onOpenChange(false);
    
    toast({
      title: "Version Restored",
      description: `Restored to ${new Date(version.timestamp).toLocaleString()}`,
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            Restore your project to a previous state
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={() => saveVersion("Manual save")} className="w-full">
            Save Current Version
          </Button>

          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-4 space-y-2">
              {versions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No versions saved yet
                </p>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{version.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(version.timestamp)} • {version.files.length} files
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreVersion(version)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};