import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { renderAsync } from 'docx-preview';
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
  const [cvHtml, setCvHtml] = useState("");
  const [originalWordBuffer, setOriginalWordBuffer] = useState<ArrayBuffer | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [optimizedCV, setOptimizedCV] = useState("");
  const [optimizedCVHtml, setOptimizedCVHtml] = useState("");
  const [fileError, setFileError] = useState("");
  const [viewMode, setViewMode] = useState<"original" | "optimized">("original");
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const docxViewerRef = useRef<HTMLDivElement>(null);

  // UseEffect to render Word document when buffer and ref are ready
  useEffect(() => {
    if (originalWordBuffer && docxViewerRef.current && viewMode === "original") {
      console.log('useEffect: Rendering DOCX preview...');
      // Add small delay to ensure DOM is ready
      setTimeout(() => renderDocxPreview(originalWordBuffer), 100);
    }
  }, [originalWordBuffer, viewMode]);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str);
        fullText += textItems.join(' ') + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  };

  const extractFromWord = async (file: File): Promise<{ text: string; html: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      return {
        text: textResult.value.trim(),
        html: htmlResult.value
      };
    } catch (error) {
      console.error('Error extracting Word document:', error);
      throw new Error('Failed to extract content from Word document');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileError("");
      setCvFile(file);
      setOriginalFileName(file.name.split('.')[0]);
      
      try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let extractedText = '';
        let extractedHtml = '';
        
        if (fileExtension === 'txt') {
          // Read plain text files
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            setCvText(content);
            setCvHtml(`<div class="cv-content">${content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}</div>`);
          };
          reader.readAsText(file);
          return;
        } else if (fileExtension === 'pdf') {
          // Fix PDF.js worker version mismatch
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
          extractedText = await extractTextFromPDF(file);
          extractedHtml = `<div class="cv-content">${extractedText.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}</div>`;
        } else if (fileExtension === 'docx' || fileExtension === 'doc') {
          const fileArrayBuffer = await file.arrayBuffer();
          setOriginalWordBuffer(fileArrayBuffer);
          const wordContent = await extractFromWord(file);
          extractedText = wordContent.text;
          extractedHtml = wordContent.html;
        } else {
          setFileError("Unsupported file format. Please upload a TXT, PDF, DOC, or DOCX file.");
          setCvFile(null);
          return;
        }
        
        setCvText(extractedText);
        setCvHtml(extractedHtml);
        
        // Render original document if it's a Word file
        console.log('File processing complete:', {
          fileExtension,
          hasDocxViewerRef: !!docxViewerRef.current,
          hasOriginalWordBuffer: !!originalWordBuffer,
          bufferSize: originalWordBuffer?.byteLength
        });
        
        // Word document rendering is now handled by useEffect
        
        console.log('File processed successfully:', {
          fileType: fileExtension,
          textLength: extractedText.length,
          hasWordBuffer: !!originalWordBuffer
        });
        
        toast({
          title: "CV Uploaded Successfully",
          description: `${file.name} has been processed and your CV content has been extracted.`,
        });
        
      } catch (error) {
        console.error('File processing error:', error);
        setFileError(`Error processing ${file.name}. Please try a different file or format.`);
        setCvFile(null);
        setCvText("");
        setCvHtml("");
        
        toast({
          title: "File Processing Failed",
          description: "Unable to extract text from the uploaded file. Please try a different format.",
          variant: "destructive",
        });
      }
    }
  };

  const renderDocxPreview = async (arrayBuffer: ArrayBuffer) => {
    console.log('renderDocxPreview called with buffer size:', arrayBuffer.byteLength);
    
    try {
      if (!docxViewerRef.current) {
        console.error('docxViewerRef.current is null');
        return;
      }

      console.log('docxViewerRef.current exists, starting render...');
      docxViewerRef.current.innerHTML = '<div class="text-center py-4 text-blue-600">Loading Word document...</div>';
      
      // Try the simplest possible rendering first
      console.log('Calling renderAsync...');
      await renderAsync(arrayBuffer, docxViewerRef.current);
      
      console.log('DOCX preview rendered successfully!');
      
      // Verify content was actually rendered
      if (docxViewerRef.current.children.length === 0) {
        console.warn('No content rendered in docx viewer');
        throw new Error('No content was rendered');
      }
      
    } catch (error) {
      console.error('DOCX rendering failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (docxViewerRef.current) {
        docxViewerRef.current.innerHTML = `
          <div class="p-4 bg-red-50 border border-red-200 rounded">
            <div class="text-red-800">
              <h3 class="font-semibold">Word Document Preview Failed</h3>
              <p class="text-sm mt-1">Error: ${error.message}</p>
              <details class="mt-2">
                <summary class="cursor-pointer text-xs">Technical Details</summary>
                <pre class="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-32">${error.stack}</pre>
              </details>
              <p class="text-sm mt-2 text-red-600">The document text has been extracted and is available for optimization.</p>
            </div>
          </div>
        `;
      }
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
      setOptimizedCVHtml(cvHtml);
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
    let updatedCVHtml = cvHtml;
    newRecommendations.forEach(rec => {
      if (rec.applied) {
        updatedCV = updatedCV.replace(rec.original, rec.suggested);
        updatedCVHtml = updatedCVHtml.replace(rec.original, `<strong>${rec.suggested}</strong>`);
      }
    });
    setOptimizedCV(updatedCV);
    setOptimizedCVHtml(updatedCVHtml);
    
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

  const downloadAsWord = async () => {
    try {
      if (!originalWordBuffer) {
        // Fallback to creating new document if no original buffer
        const paragraphs = optimizedCV.split('\n\n').map(paragraph => {
          const trimmed = paragraph.trim();
          if (!trimmed) return new Paragraph({ children: [new TextRun(" ")] });
          
          const isHeading = trimmed.length < 50 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'));
          
          return new Paragraph({
            children: [new TextRun({
              text: trimmed,
              bold: isHeading,
              size: isHeading ? 28 : 24
            })],
            heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
            spacing: { after: isHeading ? 240 : 120 }
          });
        });

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs
          }]
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = `${originalFileName || 'optimized-cv'}.docx`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        toast({
          title: "CV downloaded as Word",
          description: "Your optimized CV has been downloaded as a Word document.",
        });
        return;
      }

      // Work with original Word document and apply text replacements
      await createOptimizedWordDocument();
      
    } catch (error) {
      console.error('Error creating Word document:', error);
      toast({
        title: "Download failed",
        description: "Failed to create Word document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createOptimizedWordDocument = async () => {
    try {
      if (!originalWordBuffer) {
        throw new Error("Original Word document buffer not available");
      }

      // Load the original document as a zip file
      const zip = new PizZip(originalWordBuffer);
      
      // Create a docxtemplater instance with the original document
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Read the document.xml content to apply text replacements
      let documentXml = zip.files["word/document.xml"].asText();
      
      // Apply all approved recommendations to the document XML while preserving formatting
      recommendations.forEach(rec => {
        if (rec.applied) {
          // Escape special XML characters in the original text
          const escapedOriginal = rec.original
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
          
          const escapedSuggested = rec.suggested
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

          // Replace the text in the XML while preserving formatting
          const regex = new RegExp(escapedOriginal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          documentXml = documentXml.replace(regex, escapedSuggested);
        }
      });

      // Update the document.xml in the zip
      zip.file("word/document.xml", documentXml);

      // Generate the updated document
      const buf = zip.generate({ 
        type: "uint8array",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      
      // Convert to blob for download
      const blob = new Blob([buf], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = `${originalFileName || 'optimized-cv'}.docx`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({
        title: "CV downloaded as Word",
        description: "Your optimized CV has been downloaded with exact formatting preserved.",
      });
      
    } catch (error) {
      console.error('Error in createOptimizedWordDocument:', error);
      
      // Fallback to creating a new document if direct XML manipulation fails
      try {
        const paragraphs = optimizedCV.split('\n').filter(line => line.trim()).map(line => {
          const trimmed = line.trim();
          const isHeading = trimmed.length < 60 && (
            trimmed === trimmed.toUpperCase() ||
            trimmed.endsWith(':') ||
            /^[A-Z][A-Z\s&]+$/.test(trimmed)
          );
          
          return new Paragraph({
            children: [new TextRun({
              text: trimmed,
              bold: isHeading,
              size: isHeading ? 24 : 22
            })],
            spacing: { 
              after: isHeading ? 200 : 100,
              before: isHeading ? 100 : 0
            }
          });
        });

        const newDoc = new Document({
          sections: [{
            properties: {
              page: {
                margin: {
                  top: 720,
                  right: 720,
                  bottom: 720,
                  left: 720,
                }
              }
            },
            children: paragraphs
          }]
        });

        const buffer = await Packer.toBuffer(newDoc);
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        const element = document.createElement('a');
        element.href = URL.createObjectURL(blob);
        element.download = `${originalFileName || 'optimized-cv'}.docx`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        toast({
          title: "CV downloaded as Word",
          description: "Your optimized CV has been downloaded (fallback formatting).",
        });
        
      } catch (fallbackError) {
        console.error('Fallback creation also failed:', fallbackError);
        throw new Error("Failed to create Word document with both methods");
      }
    }
  };

  const downloadAsPDF = async () => {
    try {
      if (!cvPreviewRef.current) return;
      
      const canvas = await html2canvas(cvPreviewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${originalFileName || 'optimized-cv'}.pdf`);
      
      toast({
        title: "CV downloaded as PDF",
        description: "Your optimized CV has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Download failed",
        description: "Failed to create PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([optimizedCV], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${originalFileName || 'optimized-cv'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "CV downloaded as text",
      description: "Your optimized CV has been downloaded as a text file.",
    });
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
                <div>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </p>
                </div>
                
                {fileError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{fileError}</span>
                  </div>
                )}
                
                {cvFile && !fileError && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-md border border-success/20">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">{cvFile.name}</span>
                    <Badge variant="secondary">Processed</Badge>
                  </div>
                )}
                
                <Button 
                  onClick={proceedToJobUrl}
                  disabled={!cvFile || !!fileError}
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
                <p className="text-xs text-muted-foreground text-center">
                  Paste the full URL of the job advertisement you're applying for
                </p>
                
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
                <div className="flex gap-2 flex-wrap">
                  <div className="flex rounded-md border border-input bg-background">
                    <Button
                      variant={viewMode === "original" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("original")}
                      className="rounded-r-none border-r"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Original
                    </Button>
                    <Button
                      variant={viewMode === "optimized" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("optimized")}
                      className="rounded-l-none"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Optimized
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsWord}>
                    <Download className="h-4 w-4 mr-1" />
                    Word
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsPDF}>
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsText}>
                    <Download className="h-4 w-4 mr-1" />
                    Text
                  </Button>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-6 min-h-[400px]">
                {viewMode === "original" ? (
                  <>
                    {originalWordBuffer ? (
                      <div style={{ minHeight: '400px' }}>
                        <div 
                          ref={docxViewerRef}
                          className="docx-preview"
                          style={{ minHeight: '400px', border: '1px solid #e5e5e5' }}
                        />
                        {/* Fallback text preview */}
                        <div className="mt-4 p-4 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
                          <div className="text-xs text-gray-500">
                            <div>Buffer Size: {originalWordBuffer.byteLength} bytes</div>
                            <div>File Name: {originalFileName}</div>
                            <div>Text Length: {cvText.length} characters</div>
                          </div>
                          <details className="mt-2">
                            <summary className="text-sm cursor-pointer">Show extracted text (fallback)</summary>
                            <div 
                              className="mt-2 p-2 bg-white rounded text-sm max-h-48 overflow-y-auto"
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {cvText}
                            </div>
                          </details>
                        </div>
                      </div>
                    ) : cvFile?.name.endsWith('.pdf') ? (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">PDF Preview</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Original PDF format preserved for download
                        </p>
                      </div>
                    ) : (
                      <div 
                        className="original-text-preview"
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: '1.6',
                          color: '#333',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {cvText || "No original document to display"}
                      </div>
                    )}
                  </>
                ) : (
                  <div 
                    ref={cvPreviewRef}
                    className="cv-preview-content"
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      lineHeight: '1.6',
                      color: '#333',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {optimizedCVHtml ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: optimizedCVHtml }}
                        className="prose prose-sm max-w-none [&>p]:mb-2 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mb-1"
                      />
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        Your optimized CV content will appear here after applying recommendations...
                      </div>
                    )}
                  </div>
                )}
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
            Upload your Word CV, get AI recommendations, and download as Word or PDF
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