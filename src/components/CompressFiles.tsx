
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, FileImage, FileText, Download, X } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { downloadFile, createMockDocument } from "@/utils/downloadUtils";
import { useToast } from "@/hooks/use-toast";

interface CompressedFile {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  blob: Blob;
  type: string;
}

interface CompressionOptions {
  level: 'light' | 'medium' | 'high' | 'custom';
  customSize?: number;
}

const CompressFiles = ({ onBack }: { onBack: () => void }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    level: 'medium'
  });
  const [customSize, setCustomSize] = useState<number>(50);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const { toast } = useToast();

  const supportedFormats = ['pdf', 'jpg', 'jpeg', 'png'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const getCompressionRatio = (level: string): number => {
    switch (level) {
      case 'light': return 0.7;
      case 'medium': return 0.5;
      case 'high': return 0.3;
      default: return 0.5;
    }
  };

  const handleFileUpload = (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isValidFormat = extension && supportedFormats.includes(extension);
      const isValidSize = file.size <= maxFileSize;
      
      if (!isValidFormat) {
        toast({
          title: "Invalid file format",
          description: `${file.name} is not a supported format. Please use PDF, JPG, or PNG files.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 50MB limit.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const compressFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files to compress.",
        variant: "destructive"
      });
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);
    
    try {
      const compressed: CompressedFile[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const progress = ((i + 1) / uploadedFiles.length) * 100;
        setCompressionProgress(progress);
        
        // Simulate compression delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const ratio = compressionOptions.level === 'custom' 
          ? Math.min(customSize / 100, 1)
          : getCompressionRatio(compressionOptions.level);
        
        const compressedSize = Math.floor(file.size * ratio);
        const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        
        // Create compressed file blob (mock implementation)
        const compressedBlob = createMockDocument(file.name, extension);
        
        compressed.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          originalSize: file.size,
          compressedSize: compressedSize,
          compressionRatio: Math.round((1 - ratio) * 100),
          blob: compressedBlob,
          type: file.type
        });
      }
      
      setCompressedFiles(compressed);
      toast({
        title: "Compression completed",
        description: `Successfully compressed ${compressed.length} file(s).`
      });
    } catch (error) {
      toast({
        title: "Compression failed",
        description: "An error occurred during compression. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const downloadCompressed = (file: CompressedFile) => {
    const fileName = file.name.replace(/\.[^/.]+$/, "") + "_compressed." + file.name.split('.').pop();
    downloadFile(file.blob, fileName, file.type);
    
    toast({
      title: "Download started",
      description: `Downloading ${fileName}`
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tools</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Upload className="h-6 w-6 text-blue-500" />
            <span>Compress Files</span>
          </h1>
          <p className="text-muted-foreground">Reduce file size while maintaining quality</p>
        </div>
      </div>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span>PDF documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5 text-blue-500" />
              <span>JPG images</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5 text-green-500" />
              <span>PNG images</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Maximum file size: 50MB per file
          </p>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFilesSelected={handleFileUpload}
            acceptedFormats={supportedFormats}
            maxFileSize={maxFileSize}
            multiple={true}
          />
          
          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compression Options */}
      <Card>
        <CardHeader>
          <CardTitle>Compression Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Compression Level</Label>
            <RadioGroup
              value={compressionOptions.level}
              onValueChange={(value) => setCompressionOptions({ 
                ...compressionOptions, 
                level: value as 'light' | 'medium' | 'high' | 'custom' 
              })}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light (70% of original size)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium (50% of original size)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High (30% of original size)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom</Label>
              </div>
            </RadioGroup>
          </div>

          {compressionOptions.level === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customSize">Target Size (% of original)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="customSize"
                  type="number"
                  min="10"
                  max="90"
                  value={customSize}
                  onChange={(e) => setCustomSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compression Progress */}
      {isCompressing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compressing files...</span>
                <span>{Math.round(compressionProgress)}%</span>
              </div>
              <Progress value={compressionProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compress Button */}
      <Button 
        onClick={compressFiles}
        disabled={uploadedFiles.length === 0 || isCompressing}
        className="w-full"
        size="lg"
      >
        {isCompressing ? "Compressing..." : "Compress Files"}
      </Button>

      {/* Compressed Files Results */}
      {compressedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compression Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {compressedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Original: {formatFileSize(file.originalSize)}</p>
                        <p>Compressed: {formatFileSize(file.compressedSize)}</p>
                        <p className="text-green-600">Reduced by {file.compressionRatio}%</p>
                      </div>
                    </div>
                    <Button onClick={() => downloadCompressed(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompressFiles;
