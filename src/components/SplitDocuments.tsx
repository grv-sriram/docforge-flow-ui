import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, ArrowLeft, Download, FileText, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadFile, createSplitDocuments } from "@/utils/downloadUtils";

interface SplitDocumentsProps {
  onBack: () => void;
}

export const SplitDocuments = ({ onBack }: SplitDocumentsProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMethod, setSplitMethod] = useState<'pages' | 'ranges' | 'count'>('pages');
  const [pageRanges, setPageRanges] = useState('');
  const [pageCount, setPageCount] = useState(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [namingPattern, setNamingPattern] = useState('page_{n}');
  const [splitFiles, setSplitFiles] = useState<{ name: string; content: Blob }[]>([]);
  const { toast } = useToast();

  const acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.ppt'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  // Mock page data (in real implementation, this would come from document parsing)
  const totalPages = 12;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const validateFile = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word, TXT, or PowerPoint files only.",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 50MB.",
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
      setSelectedPages([]);
      setSplitFiles([]);
      setProgress(0);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for splitting.`,
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

  const togglePageSelection = (page: number) => {
    setSelectedPages(prev => 
      prev.includes(page) 
        ? prev.filter(p => p !== page)
        : [...prev, page].sort((a, b) => a - b)
    );
  };

  const parsePageRanges = (ranges: string): number[] => {
    const pages: number[] = [];
    const parts = ranges.split(',').map(part => part.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= Math.min(end, totalPages); i++) {
            if (!pages.includes(i)) pages.push(i);
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= totalPages && !pages.includes(page)) {
          pages.push(page);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!uploadedFile) return;

    let pagesToSplit: number[] = [];
    
    switch (splitMethod) {
      case 'pages':
        pagesToSplit = selectedPages;
        break;
      case 'ranges':
        pagesToSplit = parsePageRanges(pageRanges);
        break;
      case 'count':
        // Split by page count (every N pages)
        for (let i = 1; i <= totalPages; i += pageCount) {
          pagesToSplit.push(i);
        }
        break;
    }

    if (pagesToSplit.length === 0) {
      toast({
        title: "No pages selected",
        description: "Please select pages to split.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSplitFiles([]);

    try {
      // Create split files using actual file content
      const files = await createSplitDocuments(uploadedFile, pagesToSplit, namingPattern);
      
      // Simulate progress for UI feedback
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setSplitFiles(files);
            setIsProcessing(false);
            toast({
              title: "Split Complete!",
              description: `Document split into ${pagesToSplit.length} files.`,
            });
            return 100;
          }
          return prev + 8;
        });
      }, 200);
    } catch (error) {
      console.error('Split error:', error);
      setIsProcessing(false);
      toast({
        title: "Split Failed",
        description: "An error occurred while splitting the document.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = (file: { name: string; content: Blob }) => {
    try {
      downloadFile(file.content, file.name, file.content.type);
      toast({
        title: "Download Started",
        description: `Downloading ${file.name}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the file.",
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Split Documents</h2>
          <p className="text-muted-foreground">Extract pages from your document</p>
        </div>
      </div>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card className="border-2 border-dashed border-border/50">
          <div className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-border/50 hover:border-green-500/50 hover:bg-green-500/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Drop your file here, or click to browse</h3>
                  <p className="text-muted-foreground">
                    Single PDF, Word, TXT, or PowerPoint file (max 50MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('split-file-input')?.click()}
                  className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                >
                  Choose File
                </Button>
              </div>
              <input
                id="split-file-input"
                type="file"
                accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
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
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)} • {totalPages} pages
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFile(null);
                  setSplitFiles([]);
                  setProgress(0);
                }}
                className="text-red-500 hover:bg-red-500/10"
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Split Options */}
      {uploadedFile && (
        <Card className="border border-border/50">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scissors className="h-5 w-5 text-green-500" />
              Split Options
            </h3>

            {/* Split Method Selection */}
            <div className="space-y-4">
              <Label>Split Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`p-4 cursor-pointer transition-all ${splitMethod === 'pages' ? 'border-green-500 bg-green-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => setSplitMethod('pages')}
                >
                  <h4 className="font-medium mb-2">Select Pages</h4>
                  <p className="text-sm text-muted-foreground">Choose specific pages to extract</p>
                </Card>
                <Card 
                  className={`p-4 cursor-pointer transition-all ${splitMethod === 'ranges' ? 'border-green-500 bg-green-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => setSplitMethod('ranges')}
                >
                  <h4 className="font-medium mb-2">Page Ranges</h4>
                  <p className="text-sm text-muted-foreground">Use ranges like 1-5, 8, 11-13</p>
                </Card>
                <Card 
                  className={`p-4 cursor-pointer transition-all ${splitMethod === 'count' ? 'border-green-500 bg-green-500/5' : 'hover:bg-muted/20'}`}
                  onClick={() => setSplitMethod('count')}
                >
                  <h4 className="font-medium mb-2">Every N Pages</h4>
                  <p className="text-sm text-muted-foreground">Split by page count intervals</p>
                </Card>
              </div>
            </div>

            {/* Method-specific Options */}
            {splitMethod === 'pages' && (
              <div className="space-y-4">
                <Label>Select Pages to Extract</Label>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {pages.map(page => (
                    <div key={page} className="flex items-center space-x-2">
                      <Checkbox
                        id={`page-${page}`}
                        checked={selectedPages.includes(page)}
                        onCheckedChange={() => togglePageSelection(page)}
                      />
                      <Label htmlFor={`page-${page}`} className="text-sm cursor-pointer">
                        {page}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedPages.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected pages: {selectedPages.join(', ')}
                  </p>
                )}
              </div>
            )}

            {splitMethod === 'ranges' && (
              <div className="space-y-2">
                <Label htmlFor="page-ranges">Page Ranges</Label>
                <Input
                  id="page-ranges"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  placeholder="e.g., 1-5, 8, 11-13"
                />
                <p className="text-xs text-muted-foreground">
                  Use commas to separate ranges. Example: 1-3, 5, 7-9
                </p>
              </div>
            )}

            {splitMethod === 'count' && (
              <div className="space-y-2">
                <Label htmlFor="page-count">Pages per split</Label>
                <Input
                  id="page-count"
                  type="number"
                  min="1"
                  max="10"
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            {/* Naming Pattern */}
            <div className="space-y-2">
              <Label htmlFor="naming-pattern">File Naming Pattern</Label>
              <Input
                id="naming-pattern"
                value={namingPattern}
                onChange={(e) => setNamingPattern(e.target.value)}
                placeholder="page_{n}"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{n}'} for page numbers. Example: document_page_{'{n}'}
              </p>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Splitting document...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleSplit}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Splitting..." : "Start Split"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Split Files Results */}
      {splitFiles.length > 0 && (
        <Card className="border border-border/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Split Files ({splitFiles.length})</h3>
            <div className="space-y-3">
              {splitFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.content.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownloadFile(file)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
