import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FileText, Briefcase, Zap, Users, Target, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "CV Analysis",
      description: "AI-powered analysis of your CV content and structure"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Job Matching",
      description: "Match your CV to specific job requirements and keywords"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Instant Optimization",
      description: "Get optimized CV content in seconds with AI assistance"
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "ATS-Friendly",
      description: "Ensure your CV passes through applicant tracking systems"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/30">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Professional CV Optimizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transform your CV with AI-powered optimization. Tailor your resume to any job opportunity 
            and increase your chances of landing interviews with our professional career coaching tool.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/cv-optimizer")}
            className="px-8 py-6 text-lg font-semibold shadow-elegant"
          >
            <Briefcase className="mr-2 h-5 w-5" />
            Start Optimizing Your CV
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center shadow-soft hover:shadow-elegant transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold">Paste Your CV</h3>
              <p className="text-muted-foreground">
                Copy and paste your current CV content into our secure platform
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold">Add Job Description</h3>
              <p className="text-muted-foreground">
                Include the job advertisement you want to apply for
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold">Get Optimized CV</h3>
              <p className="text-muted-foreground">
                Receive your tailored CV with improved keywords and structure
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <p className="text-muted-foreground">ATS Compatibility</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3x</div>
              <p className="text-muted-foreground">Higher Interview Rate</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10k+</div>
              <p className="text-muted-foreground">CVs Optimized</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="p-8 shadow-soft max-w-2xl mx-auto">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of professionals who have successfully optimized their CVs 
              and secured interviews at top companies.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/cv-optimizer")}
              className="shadow-elegant"
            >
              Get Started Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
