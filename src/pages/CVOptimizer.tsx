import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Briefcase, 
  Zap, 
  Download, 
  Copy,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const CVOptimizer = () => {
  const [cvText, setCvText] = useState("");
  const [jobAdText, setJobAdText] = useState("");
  const [optimizedCV, setOptimizedCV] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    keywords: string[];
    improvements: string[];
    score: number;
  } | null>(null);
  const { toast } = useToast();

  const analyzeAndOptimize = async () => {
    if (!cvText.trim() || !jobAdText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both your CV and the job advertisement.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockKeywords = ["React", "TypeScript", "Leadership", "Project Management", "Agile"];
      const mockImprovements = [
        "Added relevant technical keywords",
        "Emphasized leadership experience",
        "Quantified achievements with metrics",
        "Aligned terminology with job requirements"
      ];
      
      setAnalysis({
        keywords: mockKeywords,
        improvements: mockImprovements,
        score: 85
      });

      // Mock optimized CV
      setOptimizedCV(`OPTIMIZED CV

John Doe
Senior Software Engineer | React & TypeScript Specialist

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 5+ years of experience in React and TypeScript development. Proven track record of leading cross-functional teams and delivering high-impact projects using Agile methodologies. Expert in modern front-end technologies with strong project management capabilities.

TECHNICAL SKILLS
• Frontend: React, TypeScript, JavaScript, HTML5, CSS3
• Backend: Node.js, Express.js, RESTful APIs
• Tools: Git, Docker, Jenkins, Jira
• Methodologies: Agile, Scrum, Test-Driven Development

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Led a team of 5 developers in migrating legacy systems to React/TypeScript, improving performance by 40%
• Implemented Agile practices that reduced development cycle time by 25%
• Managed project timelines and deliverables for 3 concurrent high-priority initiatives
• Mentored junior developers and conducted code reviews to maintain quality standards

Software Engineer | StartupXYZ | 2019 - 2020
• Developed responsive web applications using React and TypeScript
• Collaborated with cross-functional teams to deliver features on schedule
• Improved application performance through code optimization and best practices

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2019

ACHIEVEMENTS
• Increased team productivity by 30% through implementation of new development workflows
• Successfully delivered 15+ projects on time and within budget
• Recognized as "Employee of the Year" for exceptional leadership and technical contributions`);
      
      setIsAnalyzing(false);
      toast({
        title: "CV Optimized Successfully!",
        description: "Your CV has been tailored to match the job requirements.",
      });
    }, 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The optimized CV has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please select and copy manually.",
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
    
    toast({
      title: "CV Downloaded",
      description: "Your optimized CV has been downloaded successfully.",
    });
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
            Transform your CV to perfectly match any job opportunity with AI-powered optimization
          </p>
        </div>

        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your CV</h2>
            </div>
            <Textarea
              placeholder="Paste your current CV content here..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {cvText.length} characters
            </p>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Job Advertisement</h2>
            </div>
            <Textarea
              placeholder="Paste the job advertisement or description here..."
              value={jobAdText}
              onChange={(e) => setJobAdText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {jobAdText.length} characters
            </p>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <Button
            onClick={analyzeAndOptimize}
            disabled={isAnalyzing}
            size="lg"
            className="px-8 py-6 text-lg font-semibold"
          >
            {isAnalyzing ? (
              <>
                <Zap className="mr-2 h-5 w-5 animate-pulse" />
                Optimizing CV...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Optimize My CV
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <Card className="p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Optimization Analysis</h2>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Score: {analysis.score}%
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Key Improvements Made
                  </h3>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Keywords Added
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Side-by-side Comparison */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 shadow-soft">
                <h2 className="text-xl font-semibold mb-4">Original CV</h2>
                <div className="bg-muted/50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {cvText || "Your original CV will appear here..."}
                  </pre>
                </div>
              </Card>

              <Card className="p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Optimized CV</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(optimizedCV)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={downloadCV}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="bg-accent/30 p-4 rounded-md border-l-4 border-primary">
                  <pre className="whitespace-pre-wrap text-sm">
                    {optimizedCV}
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVOptimizer;