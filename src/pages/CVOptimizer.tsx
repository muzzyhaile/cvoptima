import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  Zap, 
  Download, 
  Copy,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Link,
  ChevronRight
} from "lucide-react";

type Step = "upload" | "job-url" | "analysis" | "results";

interface Recommendation {
  type: "keyword" | "phrase" | "structure" | "achievement";
  original: string;
  suggested: string;
  reason: string;
  applied: boolean;
}

const CVOptimizer = () => {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [optimizedCV, setOptimizedCV] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      // Simulate reading file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCvText(content || "John Doe\nSoftware Engineer\n\nEXPERIENCE\nSoftware Developer at TechCorp\n- Developed web applications\n- Worked with team members\n- Fixed bugs and issues\n\nSKILLS\n- JavaScript\n- HTML/CSS\n- Problem solving");
      };
      reader.readAsText(file);
      
      toast({
        title: "CV Uploaded Successfully",
        description: `${file.name} has been uploaded and processed.`,
      });
    }
  };

  const proceedToJobUrl = () => {
    if (!cvFile) {
      toast({
        title: "No CV Uploaded",
        description: "Please upload your CV first.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("job-url");
  };

  const startAnalysis = () => {
    if (!jobUrl.trim()) {
      toast({
        title: "Missing Job URL",
        description: "Please provide the job advertisement URL.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("analysis");
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      const mockRecommendations: Recommendation[] = [
        {
          type: "keyword",
          original: "JavaScript",
          suggested: "React, TypeScript, JavaScript ES6+",
          reason: "Job requires React and TypeScript specifically",
          applied: false
        },
        {
          type: "phrase",
          original: "Worked with team members",
          suggested: "Collaborated with cross-functional teams of 5+ developers",
          reason: "More specific and quantified",
          applied: false
        },
        {
          type: "achievement",
          original: "Developed web applications",
          suggested: "Developed 3+ responsive web applications serving 10,000+ users",
          reason: "Quantified achievements are more impactful",
          applied: false
        },
        {
          type: "structure",
          original: "Software Developer",
          suggested: "Senior Software Engineer | React & TypeScript Specialist",
          reason: "Matches job title and emphasizes key technologies",
          applied: false
        }
      ];
      
      setRecommendations(mockRecommendations);
      setOptimizedCV(cvText);
      setIsAnalyzing(false);
      setCurrentStep("results");
    }, 3000);
  };

  const applyRecommendation = (index: number) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index].applied = !newRecommendations[index].applied;
    setRecommendations(newRecommendations);
    
    // Update optimized CV
    let updatedCV = cvText;
    newRecommendations.forEach(rec => {
      if (rec.applied) {
        updatedCV = updatedCV.replace(rec.original, rec.suggested);
      }
    });
    setOptimizedCV(updatedCV);
    
    toast({
      title: newRecommendations[index].applied ? "Change Applied" : "Change Reverted",
      description: `"${newRecommendations[index].original}" has been ${newRecommendations[index].applied ? 'updated' : 'reverted'}.`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(optimizedCV);
      toast({
        title: "Copied to clipboard",
        description: "The optimized CV has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadCV = () => {
    const element = document.createElement("a");
    const file = new Blob([optimizedCV], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "optimized-cv.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case "upload": return 25;
      case "job-url": return 50;
      case "analysis": return 75;
      case "results": return 100;
      default: return 0;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 shadow-soft">
              <div className="text-center mb-6">
                <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upload Your CV</h2>
                <p className="text-muted-foreground">
                  Start by uploading your current CV. We support PDF, DOC, and TXT files.
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                
                {cvFile && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-md border border-success/20">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">{cvFile.name}</span>
                    <Badge variant="secondary">Uploaded</Badge>
                  </div>
                )}
                
                <Button 
                  onClick={proceedToJobUrl}
                  disabled={!cvFile}
                  className="w-full"
                  size="lg"
                >
                  Continue to Job URL
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        );

      case "job-url":
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 shadow-soft">
              <div className="text-center mb-6">
                <Link className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Job Advertisement URL</h2>
                <p className="text-muted-foreground">
                  Provide the URL of the job you're applying for so we can tailor your CV accordingly.
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://example.com/job-posting"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="text-center"
                />
                
                <Button 
                  onClick={startAnalysis}
                  disabled={!jobUrl.trim()}
                  className="w-full"
                  size="lg"
                >
                  Start AI Analysis
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        );

      case "analysis":
        return (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8 shadow-soft">
              <Zap className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-4">Analyzing Your CV</h2>
              <p className="text-muted-foreground mb-6">
                Our AI is analyzing your CV against the job requirements and generating personalized recommendations.
              </p>
              <div className="w-full bg-secondary rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground">This usually takes 2-3 seconds...</p>
            </Card>
          </div>
        );

      case "results":
        return (
          <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            {/* Recommendations Panel */}
            <Card className="p-6 shadow-soft overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
                <Badge variant="secondary">
                  {recommendations.filter(r => r.applied).length}/{recommendations.length} Applied
                </Badge>
              </div>
              
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="capitalize">
                        {rec.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant={rec.applied ? "default" : "outline"}
                        onClick={() => applyRecommendation(index)}
                      >
                        {rec.applied ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Applied
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-3 w-3 mr-1" />
                            Apply
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Original:</p>
                        <p className="text-sm bg-muted/50 p-2 rounded">{rec.original}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suggested:</p>
                        <p className="text-sm bg-primary/10 p-2 rounded border border-primary/20">{rec.suggested}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reason:</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* CV Preview Panel */}
            <Card className="p-6 shadow-soft overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">CV Preview</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={downloadCV}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {optimizedCV}
                </pre>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            CV Optimizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow our step-by-step process to optimize your CV for any job opportunity
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{getStepProgress()}%</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CVOptimizer;