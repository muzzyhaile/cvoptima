import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { analyzeCVWithJob } from "@/services/openai";
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
  ChevronRight,
  Maximize2,
  Minimize2
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [openAIConnected, setOpenAIConnected] = useState<boolean | null>(true);
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const docxViewerRef = useRef<HTMLDivElement>(null);

  // UseEffect to render Word document when buffer and ref are ready
  useEffect(() => {
    if (originalWordBuffer && docxViewerRef.current && viewMode === "original" && !showHighlights) {
      // Only render DOCX when not showing highlights (highlights use text view)
      setTimeout(() => renderDocxPreview(originalWordBuffer), 100);
    }
  }, [originalWordBuffer, viewMode, showHighlights]);

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

  const startAnalysis = async () => {
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

    try {
      // Always attempt real analysis; fall back on failure
      const resp = await analyzeCVWithJob(cvText, jobUrl);
      const recs = (resp.recommendations || []).map(r => ({ ...r, applied: !!r.applied }));
      const optimized = resp.optimizedCV || cvText;

      setRecommendations(recs);
      setOptimizedCV(optimized);
      setOptimizedCVHtml(buildBaseHtml(optimized, ""));
      setViewMode("original");
      setCurrentStep("results");
      toast({
        title: "AI analysis complete",
        description: "Recommendations generated from your CV and the job ad.",
      });
      return;
    } catch (error) {
      console.error("AI analysis failed, showing error:", error);
      toast({
        title: "AI analysis failed",
        description: "Please check your Supabase Function URL or try again shortly.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      setCurrentStep("job-url");
      return;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyRecommendation = (index: number) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index].applied = !newRecommendations[index].applied;
    setRecommendations(newRecommendations);

    // Recompute optimized text and html
    let updatedCV = cvText;
    let updatedHtml = buildBaseHtml(cvText, cvHtml);

    newRecommendations.forEach((rec, i) => {
      if (rec.applied) {
        const pattern = escapeRegExp(rec.original);
        const regex = new RegExp(pattern, 'g');
        updatedCV = updatedCV.replace(regex, rec.suggested);
        updatedHtml = updatedHtml.replace(new RegExp(pattern, 'g'), `<strong>${rec.suggested}</strong>`);
      }
    });

    setOptimizedCV(updatedCV);
    setOptimizedCVHtml(updatedHtml);

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

  // Helpers for highlights
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripExistingHighlights = (html: string) => html
    ? html.replace(/<span[^>]*class=\"[^\"]*ai-highlight[^\"]*\"[^>]*>([\s\S]*?)<\/span>/gi, "$1")
    : html;

  const buildBaseHtml = (text: string, html: string) => {
    if (html) return html;
    return `<div class="cv-content">${(text || '').split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}</div>`;
  };

  const buildHighlightedHtml = (mode: "original" | "optimized") => {
    if (!showHighlights) return mode === "optimized" ? optimizedCVHtml || buildBaseHtml(cvText, cvHtml) : buildBaseHtml(cvText, cvHtml);
    let html = stripExistingHighlights(buildBaseHtml(cvText, cvHtml));

    recommendations.forEach((rec, index) => {
      const pattern = escapeRegExp(rec.original);
      const regex = new RegExp(pattern, 'gi');

      if (mode === "optimized" && rec.applied) {
        // Replace with suggested and strong highlight for applied
        html = html.replace(regex, `<span class="ai-highlight" data-rec-index="${index}" data-active="true">${rec.suggested}</span>`);
      } else {
        // Highlight original occurrences
        html = html.replace(regex, `<span class="ai-highlight" data-rec-index="${index}" data-active="${rec.applied ? 'true' : 'false'}">$&</span>`);
      }
    });
    return html;
  };

  const onPreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const el = target.closest('.ai-highlight') as HTMLElement | null;
    if (!el) return;
    const idx = Number(el.dataset.recIndex);
    if (!Number.isNaN(idx)) {
      applyRecommendation(idx);
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
          <div className="max-w-3xl mx-auto text-center">
            <Card className="p-8 shadow-soft">
              <Zap className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-4">AI Analysis in Progress</h2>
              <div className="space-y-4">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm">Extracting job requirements from URL...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                    <span className="text-sm">Analyzing CV content structure...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                    <span className="text-sm">Generating AI-powered recommendations...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm">Optimizing for ATS compatibility...</span>
                  </div>
                </div>
                
                <div className="w-full bg-secondary rounded-full h-3 mt-6">
                  <div className="bg-primary h-3 rounded-full animate-pulse" style={{ width: "75%" }}></div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Our AI is carefully analyzing your CV against the job requirements. This may take 10-30 seconds...
                </p>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">What we're analyzing:</h3>
                  <div className="text-sm text-blue-700 text-left">
                    <p>• Keywords matching job requirements</p>
                    <p>• Action verbs and professional language</p>
                    <p>• Quantified achievements and metrics</p>
                    <p>• ATS-friendly formatting</p>
                    <p>• Industry-specific terminology</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case "results":
        if (isFullscreen) {
          return (
            <div className="fixed inset-0 z-50 bg-background">
              <div className="h-full flex flex-col">
                {/* Fullscreen Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-semibold">CV Preview - Fullscreen</h2>
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
                    <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                      <Minimize2 className="h-4 w-4 mr-1" />
                      Exit Fullscreen
                    </Button>
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
                  </div>
                </div>
                
                {/* Fullscreen Content */}
                <div className="flex-1 p-6 overflow-auto bg-white">
                  {viewMode === "original" ? (
                    <>
                      {originalWordBuffer ? (
                        <div className="w-full max-w-5xl mx-auto">
                          <div 
                            ref={docxViewerRef}
                            className="docx-preview w-full"
                            style={{ 
                              minHeight: '600px',
                              border: '1px solid #e5e5e5',
                              width: '100%',
                              maxWidth: '100%'
                            }}
                          />
                        </div>
                      ) : (
                        <div 
                          className="original-text-preview w-full max-w-5xl mx-auto"
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
                      className="cv-preview-content w-full max-w-5xl mx-auto"
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
                          className="prose prose-sm max-w-none w-full [&>p]:mb-2 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mb-1"
                        />
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          Your optimized CV content will appear here after applying recommendations...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="cv-comparison-grid grid lg:grid-cols-4 gap-4 lg:gap-6 h-[calc(100vh-12rem)]">
            {/* Recommendations Panel */}
            <Card className="recommendations-panel p-3 lg:p-6 shadow-soft overflow-auto lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base lg:text-lg font-semibold">AI Recommendations</h2>
                <Badge variant="secondary" className="text-xs">
                  {recommendations.filter(r => r.applied).length}/{recommendations.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="capitalize text-xs">
                        {rec.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant={rec.applied ? "default" : "outline"}
                        onClick={() => applyRecommendation(index)}
                        className="text-xs px-2 py-1"
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
                    
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Original:</p>
                        <p className="text-xs bg-muted/50 p-2 rounded">{rec.original}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Suggested:</p>
                        <p className="text-xs bg-primary/10 p-2 rounded border border-primary/20">{rec.suggested}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Reason:</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* CV Preview Panel */}
            <Card className="cv-preview-panel p-3 lg:p-6 shadow-soft overflow-auto lg:col-span-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3">
                <h2 className="text-lg lg:text-xl font-semibold">CV Preview</h2>
                <div className="flex gap-2 flex-wrap justify-start lg:justify-end">
                  <div className="flex rounded-md border border-input bg-background">
                    <Button
                      variant={viewMode === "original" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("original")}
                      className="rounded-r-none border-r text-xs lg:text-sm"
                    >
                      <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                      Original
                    </Button>
                    <Button
                      variant={viewMode === "optimized" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("optimized")}
                      className="rounded-l-none text-xs lg:text-sm"
                    >
                      <Edit3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                      Optimized
                    </Button>
                  </div>

                  <Button
                    variant={showHighlights ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowHighlights(v => !v)}
                    className="text-xs lg:text-sm"
                  >
                    {showHighlights ? 'Highlights: On' : 'Highlights: Off'}
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="text-xs px-2 py-1">
                    <Maximize2 className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs px-2 py-1">
                    <Copy className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsWord} className="text-xs px-2 py-1">
                    <Download className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Word</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsPDF} className="text-xs px-2 py-1">
                    <Download className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsText} className="text-xs px-2 py-1">
                    <Download className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Text</span>
                  </Button>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-2 lg:p-4 min-h-[400px] max-w-none w-full" onClick={onPreviewClick}>
                {viewMode === "original" ? (
                  <>
                    {showHighlights ? (
                      <div
                        className="prose prose-sm max-w-none w-full"
                        dangerouslySetInnerHTML={{ __html: buildHighlightedHtml("original") }}
                      />
                    ) : originalWordBuffer ? (
                      <div className="w-full" style={{ minHeight: '400px' }}>
                        <div
                          ref={docxViewerRef}
                          className="docx-preview w-full"
                          style={{ minHeight: '400px', border: '1px solid #e5e5e5', width: '100%', maxWidth: '100%', overflow: 'auto' }}
                        />
                      </div>
                    ) : (
                      <div
                        className="original-text-preview w-full"
                        style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap', maxWidth: '100%', wordWrap: 'break-word' }}
                      >
                        {cvText || "No original document to display"}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    ref={cvPreviewRef}
                    className="cv-preview-content w-full"
                    style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#ffffff', maxWidth: '100%' }}
                  >
                    {showHighlights ? (
                      <div
                        className="prose prose-sm max-w-none w-full"
                        dangerouslySetInnerHTML={{ __html: buildHighlightedHtml("optimized") }}
                      />
                    ) : optimizedCVHtml ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: optimizedCVHtml }}
                        className="prose prose-sm max-w-none w-full [&>p]:mb-2 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mb-1 [&_*]:max-w-none"
                      />
                    ) : (
                      <div className="text-gray-500 text-center py-8">Your optimized CV content will appear here after applying recommendations...</div>
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