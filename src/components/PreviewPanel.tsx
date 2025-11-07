import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PreviewPanelProps {
  code: string;
  language: string;
}

export const PreviewPanel = ({ code, language }: PreviewPanelProps) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    if (language === "html" || language === "javascript") {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: system-ui, -apple-system, sans-serif;
              }
            </style>
          </head>
          <body>
            ${language === "html" ? code : `<div id="app"></div>`}
            ${language === "javascript" ? `<script>${code}</script>` : ""}
          </body>
        </html>
      `;
      setPreviewContent(htmlContent);
    } else {
      setPreviewContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: 'Fira Code', monospace;
                background: #1a1a1a;
                color: #e0e0e0;
              }
              pre {
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <pre>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          </body>
        </html>
      `);
    }
  }, [code, language]);

  const refresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-preview-bg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <h3 className="text-sm font-semibold">Preview</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          key={iframeKey}
          srcDoc={previewContent}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts"
          title="Code Preview"
        />
      </div>
    </div>
  );
};
