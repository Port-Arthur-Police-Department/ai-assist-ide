import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { Settings, Code2, FileCode } from "lucide-react";
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

const Index = () => {
  const [code, setCode] = useState(DEFAULT_CODE.html);
  const [language, setLanguage] = useState("html");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang as keyof typeof DEFAULT_CODE] || "");
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
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content - Three Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={35} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-card border-b border-border">
                <h3 className="text-sm font-semibold">Code Editor</h3>
              </div>
              <div className="flex-1">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={35} minSize={20}>
            <PreviewPanel code={code} language={language} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <ChatPanel
              code={code}
              language={language}
              onApplyCode={setCode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
