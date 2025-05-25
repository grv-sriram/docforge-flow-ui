
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, ArrowLeft, Download, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadFile, createMergedDocument } from "@/utils/downloadUtils";

interface MergeDocumentsProps {
  onBack: () => void;
}

export const MergeDocuments = ({ onBack }: MergeDocumentsProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFilename, setOutputFilename] = useState("merged-document");
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.ppt'];
  const maxTotalSize = 100 * 1024 * 1024; // 100MB

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
    return true;
  };

  const validateTotalSize = (files: File[]) => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      toast({
        title: "Files too large",
        description: "Total file size must be under 100MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const canMergeFiles = (files: File[]) => {
    if (files.length < 2) return false;
    const extensions = files.map(file => file.name.split('.').pop()?.toLowerCase());
    const uniqueExtensions = new Set(extensions);
    return uniqueExtensions.size === 1; // All files must have same extension
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    const newFiles = [...uploadedFiles, ...validFiles];
    if (validateTotalSize(newFiles)) {
      setUploadedFiles(newFiles);
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) added.`,
      });
    }
  }, [uploadedFiles, toast]);

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

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    // Reset merged file if files are removed
    setMergedBlob(null);
    setProgress(0);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...uploadedFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setUploadedFiles(newFiles);
    // Reset merged file if order changes
    setMergedBlob(null);
    setProgress(0);
  };

  const handleMerge = async () => {
    if (!canMergeFiles(uploadedFiles)) {
      toast({
        title: "Cannot merge files",
        description: "All files must be of the same type to merge.",
        variant: "destructive",
      });
      return;
    }

    if (!outputFilename.trim()) {
      toast({
        title: "Invalid filename",
        description: "Please enter a valid filename for the merged document.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setMergedBlob(null);

    try {
      // Create merged file using actual file content
      const fileExtension = uploadedFiles[0].name.split('.').pop()?.toLowerCase() || 'pdf';
      const mergedFile = await createMergedDocument(uploadedFiles, `${outputFilename}.${fileExtension}`);
      
      // Simulate progress for UI feedback
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setMergedBlob(mergedFile);
            setIsProcessing(false);
            toast({
              title: "Merge Complete!",
              description: "Your documents have been merged successfully.",
            });
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } catch (error) {
      console.error('Merge error:', error);
      setIsProcessing(false);
      toast({
        title: "Merge Failed",
        description: "An error occurred while merging the documents.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) {
      toast({
        title: "Download Error",
        description: "No merged file available for download.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExtension = uploadedFiles[0].name.split('.').pop()?.toLowerCase() || 'pdf';
      const filename = `${outputFilename}.${fileExtension}`;
      
      downloadFile(mergedBlob, filename, mergedBlob.type);
      
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
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

  const getTotalSize = () => {
    return uploadedFiles.reduce((sum, file) => sum + file.size, 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Merge Documents</h2>
          <p className="text-muted-foreground">Combine multiple documents of the same type</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-border/50">
        <div className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-border/50 hover:border-blue-500/50 hover:bg-blue-500/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Drop your files here, or click to browse</h3>
                <p className="text-muted-foreground">
                  Supports PDF, Word, TXT, and PowerPoint files (max 100MB total)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('merge-file-input')?.click()}
                className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
              >
                Choose Files
              </Button>
            </div>
            <input
              id="merge-file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </div>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card className="border border-border/50">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Files to Merge ({uploadedFiles.length})</h3>
              <div className="text-sm text-muted-foreground">
                Total size: {formatFileSize(getTotalSize())} / 100MB
              </div>
            </div>
            
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveFile(fromIndex, index);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Merge Options */}
      {uploadedFiles.length > 1 && (
        <Card className="border border-border/50">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Merge Options</h3>
            
            <div className="space-y-2">
              <Label htmlFor="output-filename">Output Filename</Label>
              <Input
                id="output-filename"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="Enter filename for merged document"
              />
            </div>

            {!canMergeFiles(uploadedFiles) && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  All files must be of the same type to merge. Please remove files of different types.
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Merging documents...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleMerge}
                disabled={!canMergeFiles(uploadedFiles) || isProcessing || !outputFilename.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Merging..." : "Start Merge"}
              </Button>
              
              {progress === 100 && mergedBlob && (
                <Button 
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Merged File
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
