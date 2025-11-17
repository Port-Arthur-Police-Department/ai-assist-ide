import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { FileManager } from "@/components/FileManager";
import { GitHubConnect } from "@/components/GitHubConnect";
import { VersionHistory } from "@/components/VersionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Settings, Code2, FileCode, FolderOpen, Github, History, Eye, EyeOff, Monitor, MessageSquare, LogOut, User } from "lucide-react";
import type { User as UserType, Session } from '@supabase/supabase-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_CODE = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to AI-Powered Coding!</h1>
    <p>Start building amazing things with AI assistance.</p>
  </div>
</body>
</html>`,
  javascript: `// Interactive example
const greeting = "Hello, World!";
console.log(greeting);

const app = document.getElementById('app');
app.innerHTML = \`
  <div style="text-align: center; padding: 2rem;">
    <h1 style="color: #667eea;">✨ JavaScript Playground</h1>
    <p>Edit the code and see it run live!</p>
    <button onclick="alert('Hello from JS!')" 
      style="background: #667eea; color: white; border: none; 
      padding: 1rem 2rem; border-radius: 0.5rem; cursor: pointer;">
      Click Me!
    </button>
  </div>
\`;`,
  typescript: `// TypeScript example
interface User {
  name: string;
  age: number;
  email: string;
}

const user: User = {
  name: "Alex Developer",
  age: 28,
  email: "alex@example.com"
};

console.log(\`User: \${user.name}, Age: \${user.age}\`);`,
  python: `# Python example
def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))

# Calculate fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"Fib({i}) = {fibonacci(i)}")`,
};

interface FileItem {
  name: string;
  content: string;
  language: string;
}

interface IndexProps {
  user: UserType;
  session: Session;
  onSignOut: () => Promise<void>;
}

const Index = ({ user, session, onSignOut }: IndexProps) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: "index.html",
      content: DEFAULT_CODE.html,
      language: "html",
    },
  ]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showChat, setShowChat] = useState(true);

  const currentFile = files[currentFileIndex];

  useEffect(() => {
    const savedFiles = localStorage.getItem("ide_files");
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        if (parsed.length > 0) {
          setFiles(parsed);
        }
      } catch (e) {
        console.error("Failed to load saved files:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ide_files", JSON.stringify(files));
  }, [files]);

  // Add keyboard shortcuts for file navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        setCurrentFileIndex((prev) => (prev + 1) % files.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files.length]);

  const handleCodeChange = (newCode: string) => {
    setFiles((prev) =>
      prev.map((file, idx) =>
        idx === currentFileIndex ? { ...file, content: newCode } : file
      )
    );
  };

  const handleLanguageChange = (newLang: string) => {
    setFiles((prev) =>
      prev.map((file, idx) =>
        idx === currentFileIndex ? { ...file, language: newLang } : file
      )
    );
  };

  const handleFileSelect = (file: FileItem) => {
    const index = files.findIndex((f) => f.name === file.name);
    if (index !== -1) {
      setCurrentFileIndex(index);
    }
  };

  const handleFileCreate = (file: FileItem) => {
    setFiles((prev) => [...prev, file]);
    setCurrentFileIndex(files.length);
  };

  const handleFileDelete = (fileName: string) => {
    if (files.length === 1) return; // Don't delete the last file

    const index = files.findIndex((f) => f.name === fileName);
    if (index !== -1) {
      setFiles((prev) => prev.filter((_, idx) => idx !== index));
      if (currentFileIndex >= index && currentFileIndex > 0) {
        setCurrentFileIndex(currentFileIndex - 1);
      }
    }
  };

  const handleFilesImport = (importedFiles: FileItem[]) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      importedFiles.forEach((imported) => {
        const existingIndex = newFiles.findIndex((f) => f.name === imported.name);
        if (existingIndex !== -1) {
          newFiles[existingIndex] = imported;
        } else {
          newFiles.push(imported);
        }
      });
      return newFiles;
    });
  };

  const handleRepoLoad = (repoFiles: FileItem[]) => {
    setFiles(repoFiles);
    setCurrentFileIndex(0);
  };

  const handleVersionRestore = (versionFiles: FileItem[]) => {
    setFiles(versionFiles);
    setCurrentFileIndex(0);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">AI Coding IDE</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {/* File Switcher Dropdown */}
            <Select value={currentFile.name} onValueChange={(fileName) => {
              const index = files.findIndex(f => f.name === fileName);
              if (index !== -1) {
                setCurrentFileIndex(index);
              }
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    <span>{currentFile.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {files.map((file, index) => (
                  <SelectItem key={file.name} value={file.name}>
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({file.language})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language selector */}
            <Select value={currentFile.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button
            variant={showEditor ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowEditor(!showEditor)}
            title="Toggle Code Editor"
          >
            <Code2 className="h-5 w-5" />
          </Button>

          <Button
            variant={showPreview ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle Preview"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant={showChat ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowChat(!showChat)}
            title="Toggle AI Assistant"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFileManagerOpen(true)}
          >
            <FolderOpen className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGithubOpen(true)}
          >
            <Github className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHistoryOpen(true)}
          >
            <History className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            <User className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content - Three Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Code Editor Panel */}
          {showEditor && (
            <>
              <ResizablePanel defaultSize={35} minSize={20}>
                <div className="h-full flex flex-col">
                  <div className="px-4 py-2 bg-card border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Code Editor</h3>
                    <span className="text-xs text-muted-foreground">{currentFile.name}</span>
                  </div>
                  <div className="flex-1">
                    <CodeEditor
                      value={currentFile.content}
                      onChange={handleCodeChange}
                      language={currentFile.language}
                    />
                  </div>
                </div>
              </ResizablePanel>
              {(showPreview || showChat) && <ResizableHandle withHandle />}
            </>
          )}

          {/* Preview Panel */}
          {showPreview && (
            <>
              <ResizablePanel defaultSize={35} minSize={20}>
                <PreviewPanel code={currentFile.content} language={currentFile.language} />
              </ResizablePanel>
              {showChat && <ResizableHandle withHandle />}
            </>
          )}

          {/* AI Chat Panel */}
          {showChat && (
            <ResizablePanel defaultSize={30} minSize={20}>
              <ChatPanel
                code={currentFile.content}
                language={currentFile.language}
                onApplyCode={handleCodeChange}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FileManager
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        currentFile={currentFile}
        files={files}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileDelete={handleFileDelete}
        onFilesImport={handleFilesImport}
      />
      <GitHubConnect
        open={githubOpen}
        onOpenChange={setGithubOpen}
        onRepoLoad={handleRepoLoad}
      />
      <VersionHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        currentFiles={files}
        onRestore={handleVersionRestore}
      />
    </div>
  );
};

export default Index;
