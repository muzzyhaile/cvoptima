import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FileText, Briefcase, Zap, Users, Target, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="h-12 w-12 text-primary" />,
      title: "CV ANALYSIS",
      description: "AI ALGORITHM SCANS YOUR CV STRUCTURE AND CONTENT"
    },
    {
      icon: <Target className="h-12 w-12 text-primary" />,
      title: "JOB MATCHING",
      description: "MATCH CV TO JOB REQUIREMENTS AND KEYWORDS"
    },
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "INSTANT OPTIMIZATION", 
      description: "GET OPTIMIZED CV CONTENT IN SECONDS WITH AI"
    },
    {
      icon: <Award className="h-12 w-12 text-primary" />,
      title: "ATS-FRIENDLY",
      description: "ENSURE CV PASSES THROUGH TRACKING SYSTEMS"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Brutal Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-foreground mb-8 text-brutal leading-none">
            CV<br/>
            <span className="text-primary">OPTIMIZER</span>
          </h1>
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl md:text-2xl text-muted-foreground font-mono uppercase tracking-wide mb-8">
              TRANSFORM YOUR CV WITH AI-POWERED OPTIMIZATION.<br/>
              TAILOR YOUR RESUME TO ANY JOB OPPORTUNITY.<br/>
              INCREASE YOUR CHANCES OF LANDING INTERVIEWS.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate("/cv-optimizer")}
            className="px-12 py-6 text-xl font-black shadow-brutal btn-primary-brutal"
          >
            <Briefcase className="mr-4 h-8 w-8" />
            START OPTIMIZATION
          </Button>
        </div>

        {/* Brutal Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card p-8 bg-card border-4 border-foreground shadow-brutal">
              <div className="flex items-start gap-6">
                <div className="bg-primary p-4 border-4 border-foreground">
                  {feature.icon}
                </div>
                <div>
                  <h3 
                    className="text-2xl font-black mb-4 text-brutal"
                    style={{ 
                      WebkitUserSelect: 'text',
                      userSelect: 'text'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-muted-foreground font-mono text-sm uppercase tracking-wide"
                    style={{ 
                      WebkitUserSelect: 'text',
                      userSelect: 'text',
                      WebkitTextFillColor: 'inherit'
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* How It Works - Brutal Style */}
        <div className="mb-20">
          <h2 className="text-5xl font-black text-center mb-16 text-brutal">HOW IT WORKS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary border-4 border-foreground flex items-center justify-center mx-auto mb-6 shadow-brutal">
                <span className="text-6xl font-black text-primary-foreground">1</span>
              </div>
              <h3 className="text-2xl font-black mb-4 text-brutal">PASTE YOUR CV</h3>
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-wide">
                COPY AND PASTE YOUR CV CONTENT INTO OUR SECURE PLATFORM
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary border-4 border-foreground flex items-center justify-center mx-auto mb-6 shadow-brutal">
                <span className="text-6xl font-black text-primary-foreground">2</span>
              </div>
              <h3 className="text-2xl font-black mb-4 text-brutal">ADD JOB URL</h3>
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-wide">
                INCLUDE THE JOB ADVERTISEMENT URL YOU WANT TO APPLY FOR
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary border-4 border-foreground flex items-center justify-center mx-auto mb-6 shadow-brutal">
                <span className="text-6xl font-black text-primary-foreground">3</span>
              </div>
              <h3 className="text-2xl font-black mb-4 text-brutal">GET OPTIMIZED CV</h3>
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-wide">
                RECEIVE YOUR TAILORED CV WITH IMPROVED KEYWORDS AND STRUCTURE
              </p>
            </div>
          </div>
        </div>

        {/* Stats - Industrial Style */}
        <div className="bg-muted border-4 border-foreground p-12 mb-20 shadow-brutal">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-black text-primary mb-4 text-mono">95%</div>
              <p className="text-muted-foreground font-mono uppercase tracking-wide font-bold">ATS COMPATIBILITY</p>
            </div>
            <div>
              <div className="text-6xl font-black text-primary mb-4 text-mono">3X</div>
              <p className="text-muted-foreground font-mono uppercase tracking-wide font-bold">HIGHER INTERVIEW RATE</p>
            </div>
            <div>
              <div className="text-6xl font-black text-primary mb-4 text-mono">10K+</div>
              <p className="text-muted-foreground font-mono uppercase tracking-wide font-bold">CVS OPTIMIZED</p>
            </div>
          </div>
        </div>

        {/* Final CTA - Brutal */}
        <div className="text-center">
          <Card className="p-12 bg-card border-4 border-foreground shadow-brutal max-w-4xl mx-auto">
            <div className="mb-8">
              <Users className="h-16 w-16 text-primary mx-auto mb-6 bg-primary border-4 border-foreground p-2" />
              <h2 className="text-4xl font-black mb-6 text-brutal">READY TO LAND<br/>YOUR DREAM JOB?</h2>
              <p className="text-muted-foreground mb-8 font-mono text-lg uppercase tracking-wide max-w-2xl mx-auto">
                JOIN THOUSANDS OF PROFESSIONALS WHO HAVE SUCCESSFULLY OPTIMIZED THEIR CVS 
                AND SECURED INTERVIEWS AT TOP COMPANIES.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/cv-optimizer")}
                className="shadow-brutal btn-primary-brutal"
              >
                GET STARTED NOW
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
