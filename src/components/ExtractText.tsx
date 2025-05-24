
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, Download, Copy, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractTextProps {
  onBack: () => void;
}

export const ExtractText = ({ onBack }: ExtractTextProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [outputFormat, setOutputFormat] = useState<'txt' | 'docx' | 'csv'>('txt');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const { toast } = useToast();

  const acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.ppt', '.jpg', '.jpeg', '.png'];
  const maxFileSize = 25 * 1024 * 1024; // 25MB

  const validateFile = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word, TXT, PowerPoint, or image files only.",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 25MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (validateFile(file)) {
      setUploadedFile(file);
      setExtractedText('');
      setDetectedLanguage('');
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for text extraction.`,
      });
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleExtract = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate text extraction process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Mock extracted text
          const mockText = `This is extracted text from ${uploadedFile?.name}.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Key Points:
• Document processing complete
• Text successfully extracted
• Multiple format support available
• Language detection: English

Additional content would appear here based on the actual document content. This extraction supports various file formats including PDFs, Word documents, PowerPoint presentations, and images with OCR capability.`;

          setExtractedText(mockText);
          setDetectedLanguage('English');
          
          toast({
            title: "Text Extraction Complete!",
            description: "Text has been successfully extracted from your document.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (file: File) => {
    const imageTypes = ['.jpg', '.jpeg', '.png'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return imageTypes.includes(extension);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Extract Text</h2>
          <p className="text-muted-foreground">Extract text from documents and images</p>
        </div>
      </div>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card className="border-2 border-dashed border-border/50">
          <div className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-purple-500 bg-purple-500/5'
                  : 'border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Drop your file here, or click to browse</h3>
                  <p className="text-muted-foreground">
                    PDF, Word, TXT, PowerPoint, or Image files (max 25MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('extract-file-input')?.click()}
                  className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                >
                  Choose File
                </Button>
              </div>
              <input
                id="extract-file-input"
                type="file"
                accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* File Info */}
      {uploadedFile && (
        <Card className="border border-border/50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatFileSize(uploadedFile.size)}</span>
                    {isImageFile(uploadedFile) && (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">
                        OCR Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setUploadedFile(null)}
                className="text-red-500 hover:bg-red-500/10"
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Extract Options */}
      {uploadedFile && !extractedText && (
        <Card className="border border-border/50">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Extraction Options
            </h3>

            <div className="space-y-4">
              <Label>Output Format</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`p-4 cursor-pointer transition-all ${outputFormat === 'txt' ? 'border-purple-500 bg-purple-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => setOutputFormat('txt')}
                >
                  <h4 className="font-medium mb-2">Plain Text (.txt)</h4>
                  <p className="text-sm text-muted-foreground">Simple text format</p>
                </Card>
                <Card 
                  className={`p-4 cursor-pointer transition-all ${outputFormat === 'docx' ? 'border-purple-500 bg-purple-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => setOutputFormat('docx')}
                >
                  <h4 className="font-medium mb-2">Word Document (.docx)</h4>
                  <p className="text-sm text-muted-foreground">Formatted document</p>
                </Card>
                <Card 
                  className={`p-4 cursor-pointer transition-all ${outputFormat === 'csv' ? 'border-purple-500 bg-purple-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => setOutputFormat('csv')}
                >
                  <h4 className="font-medium mb-2">CSV Spreadsheet (.csv)</h4>
                  <p className="text-sm text-muted-foreground">Structured data format</p>
                </Card>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {isImageFile(uploadedFile) ? 'Running OCR analysis...' : 'Extracting text...'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleExtract}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? "Extracting..." : "Start Extraction"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <Card className="border border-border/50">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Extracted Text</h3>
                {detectedLanguage && (
                  <p className="text-sm text-muted-foreground">
                    Detected language: {detectedLanguage}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download {outputFormat.toUpperCase()}
                </Button>
              </div>
            </div>

            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Extracted text will appear here..."
            />

            <div className="text-sm text-muted-foreground">
              {extractedText.length} characters • {extractedText.split(/\s+/).length} words
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
