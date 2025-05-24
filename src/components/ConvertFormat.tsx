
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, X, FileText, ArrowLeft, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConvertFormatProps {
  onBack: () => void;
}

interface ConversionFile extends File {
  id: string;
  outputFormat: string;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
}

export const ConvertFormat = ({ onBack }: ConvertFormatProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<ConversionFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [compressionLevel, setCompressionLevel] = useState([75]);
  const [maintainFormatting, setMaintainFormatting] = useState(true);
  const { toast } = useToast();

  const acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.html', '.htm'];
  const maxTotalSize = 200 * 1024 * 1024; // 200MB
  const outputFormats = ['pdf', 'docx', 'txt', 'rtf', 'html'];

  const validateFile = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word, TXT, RTF, or HTML files only.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateTotalSize = (files: ConversionFile[]) => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      toast({
        title: "Files too large",
        description: "Total file size must be under 200MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: ConversionFile[] = [];
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        const conversionFile: ConversionFile = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9),
          outputFormat: outputFormat,
          progress: 0,
          status: 'pending' as const
        });
        validFiles.push(conversionFile);
      }
    });

    const newFiles = [...uploadedFiles, ...validFiles];
    if (validateTotalSize(newFiles)) {
      setUploadedFiles(newFiles);
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) added for conversion.`,
      });
    }
  }, [uploadedFiles, outputFormat, toast]);

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

  const removeFile = (id: string) => {
    const newFiles = uploadedFiles.filter(file => file.id !== id);
    setUploadedFiles(newFiles);
  };

  const updateFileOutputFormat = (id: string, format: string) => {
    const newFiles = uploadedFiles.map(file => 
      file.id === id ? { ...file, outputFormat: format } : file
    );
    setUploadedFiles(newFiles);
  };

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    setOverallProgress(0);

    // Update all files to converting status
    setUploadedFiles(files => files.map(file => ({ ...file, status: 'converting' as const })));

    // Simulate conversion process for each file
    const totalFiles = uploadedFiles.length;
    let completedFiles = 0;

    for (const file of uploadedFiles) {
      // Simulate individual file conversion
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setUploadedFiles(files => files.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      // Mark file as completed
      setUploadedFiles(files => files.map(f => 
        f.id === file.id ? { ...f, status: 'completed' as const, progress: 100 } : f
      ));

      completedFiles++;
      setOverallProgress((completedFiles / totalFiles) * 100);
    }

    setIsProcessing(false);
    toast({
      title: "Conversion Complete!",
      description: `${totalFiles} file(s) converted successfully.`,
    });
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

  const getFileIcon = (filename: string | undefined) => {
    if (!filename) return <FileText className="h-5 w-5 text-orange-500" />;
    const extension = filename.split('.').pop()?.toLowerCase();
    return <FileText className="h-5 w-5 text-orange-500" />;
  };

  const getStatusColor = (status: ConversionFile['status']) => {
    switch (status) {
      case 'pending': return 'text-muted-foreground';
      case 'converting': return 'text-orange-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: ConversionFile['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'converting': return 'Converting...';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Convert Format</h2>
          <p className="text-muted-foreground">Convert documents between different formats</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-border/50">
        <div className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-orange-500 bg-orange-500/5'
                : 'border-border/50 hover:border-orange-500/50 hover:bg-orange-500/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Drop your files here, or click to browse</h3>
                <p className="text-muted-foreground">
                  PDF, Word, TXT, RTF, or HTML files (max 200MB total)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('convert-file-input')?.click()}
                className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
              >
                Choose Files
              </Button>
            </div>
            <input
              id="convert-file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.rtf,.html,.htm"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </div>
      </Card>

      {/* Conversion Settings */}
      <Card className="border border-border/50">
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-500" />
            Conversion Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Default Output Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {outputFormats.map((format) => (
                  <Button
                    key={format}
                    variant={outputFormat === format ? "default" : "outline"}
                    onClick={() => setOutputFormat(format)}
                    className="justify-start"
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Compression Level: {compressionLevel[0]}%</Label>
              <Slider
                value={compressionLevel}
                onValueChange={setCompressionLevel}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Better Quality</span>
                <span>Smaller Size</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maintain-formatting"
              checked={maintainFormatting}
              onChange={(e) => setMaintainFormatting(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="maintain-formatting">
              Maintain original formatting where possible
            </Label>
          </div>
        </div>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card className="border border-border/50">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Files to Convert ({uploadedFiles.length})</h3>
              <div className="text-sm text-muted-foreground">
                Total size: {formatFileSize(getTotalSize())} / 200MB
              </div>
            </div>
            
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                          {file.name?.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span>{formatFileSize(file.size)}</span>
                        <span className={getStatusColor(file.status)}>
                          {getStatusText(file.status)}
                        </span>
                      </div>
                      {file.status === 'converting' && (
                        <Progress value={file.progress} className="w-full mt-2 h-1" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={file.outputFormat}
                      onChange={(e) => updateFileOutputFormat(file.id, e.target.value)}
                      disabled={isProcessing}
                      className="text-xs bg-background border border-border rounded px-2 py-1"
                    >
                      {outputFormats.map(format => (
                        <option key={format} value={format}>
                          {format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    
                    {file.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      disabled={isProcessing}
                      className="h-8 w-8 hover:bg-red-500/20 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            {isProcessing && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="w-full" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-6 pt-4 border-t border-border/50">
              <Button
                onClick={handleConvert}
                disabled={uploadedFiles.length === 0 || isProcessing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing ? "Converting..." : "Start Conversion"}
              </Button>
              
              {uploadedFiles.some(f => f.status === 'completed') && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All as ZIP
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
