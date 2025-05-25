import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Merge, 
  Split, 
  RefreshCw, 
  Type, 
  Download,
  Upload,
  Clock,
  CheckCircle,
  ArrowLeft,
  Moon,
  Sun,
  Minimize2,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

const Features = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const features = [
    {
      icon: Merge,
      title: "Document Merging",
      description: "Combine multiple PDF files into a single document with customizable order and page selection.",
      capabilities: [
        "Merge unlimited PDF files",
        "Custom page ordering",
        "Bookmark preservation",
        "Metadata retention"
      ]
    },
    {
      icon: Split,
      title: "Document Splitting",
      description: "Extract specific pages or split documents into multiple files with flexible naming options.",
      capabilities: [
        "Page range extraction",
        "Single page splitting",
        "Custom file naming",
        "Batch processing"
      ]
    },
    {
      icon: Type,
      title: "Text Extraction",
      description: "Extract text content from any document format with formatting preservation options.",
      capabilities: [
        "OCR text recognition",
        "Format preservation",
        "Multi-language support",
        "Searchable output"
      ]
    },
    {
      icon: RefreshCw,
      title: "Format Conversion",
      description: "Convert documents between different formats while maintaining quality and structure.",
      capabilities: [
        "High-quality conversion",
        "Layout preservation",
        "Font compatibility",
        "Image optimization"
      ]
    },
    {
      icon: Minimize2,
      title: "Compress Files",
      description: "Reduce file sizes while maintaining quality with our compression tool. Supports PDF, PNG, and JPG files. Perfect for saving storage space and faster file sharing.",
      capabilities: [
        "PDF, PNG, and JPG support",
        "Multiple compression levels",
        "Quality preservation",
        "Batch compression"
      ]
    }
  ];

  const supportedFormats = [
    {
      category: "PDF Documents",
      formats: [
        { name: "PDF", extension: ".pdf", description: "Portable Document Format - Full support for all operations" }
      ],
      color: "bg-red-500/10 border-red-500/20 text-red-600"
    },
    {
      category: "Microsoft Office",
      formats: [
        { name: "Word Document", extension: ".docx", description: "Microsoft Word 2007+ format" },
        { name: "PowerPoint", extension: ".pptx", description: "Microsoft PowerPoint 2007+ format" },
        { name: "Excel", extension: ".xlsx", description: "Microsoft Excel 2007+ format" }
      ],
      color: "bg-blue-500/10 border-blue-500/20 text-blue-600"
    },
    {
      category: "Text Formats",
      formats: [
        { name: "Plain Text", extension: ".txt", description: "Simple text files" },
        { name: "Rich Text", extension: ".rtf", description: "Rich Text Format with formatting" },
        { name: "HTML", extension: ".html", description: "HyperText Markup Language" }
      ],
      color: "bg-green-500/10 border-green-500/20 text-green-600"
    },
    {
      category: "Image Formats",
      formats: [
        { name: "JPEG", extension: ".jpg/.jpeg", description: "Joint Photographic Experts Group" },
        { name: "PNG", extension: ".png", description: "Portable Network Graphics" },
        { name: "TIFF", extension: ".tiff", description: "Tagged Image File Format" }
      ],
      color: "bg-purple-500/10 border-purple-500/20 text-purple-600"
    }
  ];

  const performanceFeatures = [
    { icon: Clock, title: "Lightning Fast", description: "Process documents in seconds with optimized algorithms" },
    { icon: ShieldCheck, title: "Secure & Private", description: "Your documents are encrypted and automatically deleted" },
    { icon: CheckCircle, title: "High Quality", description: "Maintain document quality and formatting during processing" },
    { icon: Download, title: "Easy Download", description: "Direct download with no additional software required" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">DocForge</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost">Login</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Comprehensive Document Features
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover all the powerful document transformation and editing capabilities DocForge offers. 
            From basic operations to advanced processing, we've got you covered.
          </p>
        </section>

        {/* Core Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Document Transformation Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-blue-500" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.capabilities.map((capability, capIndex) => (
                        <li key={capIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Performance Features */}
        <section className="py-16 bg-muted/20 rounded-lg">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DocForge?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {performanceFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Documents?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start using DocForge today and experience the power of advanced document processing.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl">
              Start Editing Documents
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold">DocForge</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 DocForge. All rights reserved. Transform your documents with ease.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Features;
