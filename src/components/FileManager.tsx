import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  FileCode,
  Trash2,
  Plus,
  Download,
  Upload,
  FolderOpen,
} from "lucide-react";
import JSZip from "jszip";

interface FileItem {
  name: string;
  content: string;
  language: string;
}

interface FileManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFile: FileItem;
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onFileCreate: (file: FileItem) => void;
  onFileDelete: (fileName: string) => void;
  onFilesImport: (files: FileItem[]) => void;
}

export const FileManager = ({
  open,
  onOpenChange,
  currentFile,
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFilesImport,
}: FileManagerProps) => {
  const [newFileName, setNewFileName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("html");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name",
        variant: "destructive",
      });
      return;
    }

    if (files.some((f) => f.name === newFileName)) {
      toast({
        title: "Error",
        description: "File already exists",
        variant: "destructive",
      });
      return;
    }

    onFileCreate({
      name: newFileName,
      content: "",
      language: newFileLanguage,
    });

    setNewFileName("");
    toast({
      title: "File Created",
      description: `${newFileName} has been created`,
    });
  };

  const handleExportProject = async () => {
    try {
      const zip = new JSZip();

      files.forEach((file) => {
        zip.file(file.name, file.content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project.zip";
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Project Exported",
        description: "Your project has been downloaded as a ZIP file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export project",
        variant: "destructive",
      });
    }
  };

  const handleImportFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const importedFiles: FileItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const content = await file.text();
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        const language = getLanguageFromExtension(extension);

        importedFiles.push({
          name: file.name,
          content,
          language,
        });
      } catch (error) {
        console.error(`Failed to read file ${file.name}:`, error);
      }
    }

    if (importedFiles.length > 0) {
      onFilesImport(importedFiles);
      toast({
        title: "Files Imported",
        description: `${importedFiles.length} file(s) imported successfully`,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      toast({
        title: "Invalid File",
        description: "Please select a ZIP file",
        variant: "destructive",
      });
      return;
    }

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const importedFiles: FileItem[] = [];

      for (const [filename, fileData] of Object.entries(contents.files)) {
        if (!fileData.dir) {
          const content = await fileData.async("text");
          const extension = filename.split(".").pop()?.toLowerCase() || "";
          const language = getLanguageFromExtension(extension);

          importedFiles.push({
            name: filename,
            content,
            language,
          });
        }
      }

      if (importedFiles.length > 0) {
        onFilesImport(importedFiles);
        toast({
          title: "Project Imported",
          description: `${importedFiles.length} file(s) imported from ZIP`,
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import project ZIP file",
        variant: "destructive",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getLanguageFromExtension = (ext: string): string => {
    const languageMap: { [key: string]: string } = {
      html: "html",
      htm: "html",
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return languageMap[ext] || "plaintext";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>File Manager</DialogTitle>
          <DialogDescription>
            Manage your project files, import and export your work
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProject}
              disabled={files.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Project
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Files
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".zip";
                input.onchange = handleImportProject as any;
                input.click();
              }}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Import ZIP
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleImportFiles}
              accept=".html,.htm,.js,.jsx,.ts,.tsx,.py,.css,.json,.md,.txt"
            />
          </div>

          {/* File List */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Files</h4>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {files.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No files yet. Create one below!
                </div>
              ) : (
                <div className="space-y-1">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={`flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer ${
                        currentFile.name === file.name ? "bg-accent" : ""
                      }`}
                      onClick={() => onFileSelect(file)}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({file.language})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDelete(file.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Create New File */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-semibold">Create New File</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="filename" className="sr-only">
                  File name
                </Label>
                <Input
                  id="filename"
                  placeholder="index.html"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFile();
                  }}
                />
              </div>
              <select
                className="px-3 py-2 border rounded-md bg-background"
                value={newFileLanguage}
                onChange={(e) => setNewFileLanguage(e.target.value)}
              >
                <option value="html">HTML</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="css">CSS</option>
              </select>
              <Button onClick={handleCreateFile}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
