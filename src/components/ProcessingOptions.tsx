
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Play, ArrowLeft } from "lucide-react";

interface ProcessingOptionsProps {
  selectedTool: string;
  uploadedFiles: File[];
  onBack: () => void;
  onProcess: () => void;
}

export const ProcessingOptions = ({ selectedTool, uploadedFiles, onBack, onProcess }: ProcessingOptionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartProcessing = () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      onProcess();
    }, 3000);
  };

  const getProcessingDescription = () => {
    switch (selectedTool) {
      case 'merge':
        return 'All uploaded PDF files will be merged in the order they were uploaded';
      case 'split':
        return 'Select pages or page ranges to extract from your PDF';
      case 'extract':
        return 'Text will be extracted from all uploaded documents';
      case 'convert':
        return 'Documents will be converted to your selected format';
      default:
        return 'Configure your processing options';
    }
  };

  const getFilesToProcess = () => {
    return uploadedFiles.map(file => file.name);
  };

  return (
    <div className="space-y-8">
      {/* Processing Configuration */}
      <Card className="border border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-blue-500" />
                  Processing Options
                </h2>
                <p className="text-muted-foreground">Configure your {selectedTool} operation</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400">{getProcessingDescription()}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Files to {selectedTool}:</h3>
              <ul className="space-y-2">
                {getFilesToProcess().map((filename, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{filename}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tool-specific options */}
            {selectedTool === 'split' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Split Options:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 cursor-pointer hover:bg-muted/20 border-2 border-transparent hover:border-blue-500/20">
                    <h4 className="font-medium mb-2">Split by Pages</h4>
                    <p className="text-sm text-muted-foreground">Extract specific page ranges</p>
                  </Card>
                  <Card className="p-4 cursor-pointer hover:bg-muted/20 border-2 border-transparent hover:border-blue-500/20">
                    <h4 className="font-medium mb-2">Split Every Page</h4>
                    <p className="text-sm text-muted-foreground">Create separate files for each page</p>
                  </Card>
                </div>
              </div>
            )}

            {selectedTool === 'convert' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Output Format:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['PDF', 'DOCX', 'PPTX'].map((format) => (
                    <Card key={format} className="p-4 cursor-pointer hover:bg-muted/20 border-2 border-transparent hover:border-blue-500/20">
                      <div className="text-center">
                        <Badge className="mb-2">{format}</Badge>
                        <p className="text-xs text-muted-foreground">Convert to {format}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Ready to Process */}
      <Card className="border border-green-500/20 bg-green-500/5">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-1">Ready to process</h3>
              <p className="text-sm text-muted-foreground">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <Button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Processing
                </>
              )}
            </Button>
          </div>
          
          {isProcessing && (
            <div className="mt-4">
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Processing your documents...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
