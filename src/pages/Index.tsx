import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Merge, Split, RefreshCw, Upload, Moon, Sun, Menu, X } from "lucide-react";
import { MergeDocuments } from "@/components/MergeDocuments";
import { SplitDocuments } from "@/components/SplitDocuments";
import { ExtractText } from "@/components/ExtractText";
import { ConvertFormat } from "@/components/ConvertFormat";
import { useTheme } from "next-themes";

const Index = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const tools = [
    {
      id: "merge",
      title: "Merge Documents",
      description: "Combine multiple PDFs into one",
      icon: Merge,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "split",
      title: "Split Documents",
      description: "Extract pages from PDFs",
      icon: Split,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10 border-green-500/20",
    },
    {
      id: "extract",
      title: "Extract Text",
      description: "Get text from any document",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "convert",
      title: "Convert Format",
      description: "Change document formats",
      icon: RefreshCw,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10 border-orange-500/20",
    },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const renderSelectedTool = () => {
    switch (selectedTool) {
      case "merge":
        return <MergeDocuments onBack={handleBackToTools} />;
      case "split":
        return <SplitDocuments onBack={handleBackToTools} />;
      case "extract":
        return <ExtractText onBack={handleBackToTools} />;
      case "convert":
        return <ConvertFormat onBack={handleBackToTools} />;
      default:
        return null;
    }
  };

  if (selectedTool) {
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

        <main className="max-w-6xl mx-auto px-4 py-8">
          {renderSelectedTool()}
        </main>
      </div>
    );
  }

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
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </nav>
              
              <div className="flex items-center space-x-4">
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border/50 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <div className="flex space-x-4 pt-4">
                  <Button variant="ghost">Login</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5"></div>
        <div className="relative max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
            🚀 New: AI-Powered Document Processing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Transform Your Documents with DocForge
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Merge, split, convert, and extract text from your documents with ease.
            <br />
            Support for PDF, DOCX, and PPTX files with lightning-fast processing.
          </p>
          
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl"
            onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Editing Docs
          </Button>
        </div>
      </section>

      {/* Document Tools Section */}
      <section id="tools" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              Document Tools
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose an operation to perform on your documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className={`${tool.bgColor} border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${tool.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose DocForge?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">Process documents in seconds with our optimized algorithms</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Multiple Formats</h3>
              <p className="text-muted-foreground">Support for PDF, DOCX, PPTX files up to 10MB each</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                <RefreshCw className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold">Secure Processing</h3>
              <p className="text-muted-foreground">Your documents are processed securely and deleted after use</p>
            </div>
          </div>
        </div>
      </section>

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

export default Index;
