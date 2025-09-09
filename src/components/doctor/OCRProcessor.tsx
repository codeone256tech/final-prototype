import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Brain, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Tesseract from 'tesseract.js';

interface OCRProcessorProps {
  imageFile: File;
  onSuccess: () => void;
}

interface ExtractedData {
  patientName: string;
  patientId: string;
  age: string;
  gender: string;
  diagnosis: string;
  prescription: string;
  recordDate: string;
  extractedText: string;
}

const OCRProcessor = ({ imageFile, onSuccess }: OCRProcessorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const processOCR = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: OCR with Tesseract
      toast({
        title: "Processing",
        description: "Extracting text from image..."
      });

      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log(m)
      });

      // Step 2: AI Processing with mock extraction (replace with actual AI service)
      toast({
        title: "Processing",
        description: "Analyzing extracted text with AI..."
      });

      // Mock AI extraction - in real implementation, send to Hugging Face or OpenAI
      const extractedFields = extractFieldsFromText(text);
      
      setExtractedData({
        ...extractedFields,
        extractedText: text
      });
      
      setIsEditing(true);
      
      toast({
        title: "Success",
        description: "Text extracted and processed successfully"
      });
      
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock AI field extraction - replace with actual AI service
  const extractFieldsFromText = (text: string): Omit<ExtractedData, 'extractedText'> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Simple pattern matching - replace with proper AI model
    let patientName = '';
    let patientId = '';
    let age = '';
    let gender = '';
    let diagnosis = '';
    let prescription = '';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Look for patient name
      if (lowerLine.includes('name') || lowerLine.includes('patient')) {
        const nameMatch = line.match(/name[:\s]+([a-zA-Z\s]+)/i);
        if (nameMatch) patientName = nameMatch[1].trim();
      }
      
      // Look for patient ID
      if (lowerLine.includes('id') || lowerLine.includes('number')) {
        const idMatch = line.match(/id[:\s]+([0-9a-zA-Z]+)/i);
        if (idMatch) patientId = idMatch[1].trim();
      }
      
      // Look for age
      if (lowerLine.includes('age')) {
        const ageMatch = line.match(/age[:\s]+(\d+)/i);
        if (ageMatch) age = ageMatch[1];
      }
      
      // Look for gender
      if (lowerLine.includes('male') || lowerLine.includes('female')) {
        if (lowerLine.includes('female')) gender = 'Female';
        else if (lowerLine.includes('male')) gender = 'Male';
      }
      
      // Look for diagnosis
      if (lowerLine.includes('diagnosis') || lowerLine.includes('condition')) {
        diagnosis += line + ' ';
      }
      
      // Look for prescription
      if (lowerLine.includes('prescription') || lowerLine.includes('medication') || lowerLine.includes('treatment')) {
        prescription += line + ' ';
      }
    });
    
    return {
      patientName: patientName || 'Not found',
      patientId: patientId || 'Not found',
      age: age || '',
      gender: gender || '',
      diagnosis: diagnosis.trim() || 'Not found',
      prescription: prescription.trim() || 'Not found',
      recordDate: new Date().toISOString().split('T')[0]
    };
  };

  const handleSave = async () => {
    if (!user || !extractedData) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_name: extractedData.patientName,
          patient_id: extractedData.patientId,
          age: extractedData.age ? parseInt(extractedData.age) : null,
          gender: extractedData.gender || null,
          diagnosis: extractedData.diagnosis || null,
          prescription: extractedData.prescription || null,
          record_date: extractedData.recordDate,
          extracted_text: extractedData.extractedText,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record saved successfully"
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save medical record",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!extractedData || !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Processing
          </CardTitle>
          <CardDescription>
            Extract and process text from the medical record image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-medical-blue" />
                <p className="text-muted-foreground">Processing image with OCR and AI...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-medical-blue/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <FileText className="h-8 w-8 text-medical-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ready to Process</h3>
                  <p className="text-muted-foreground mb-4">
                    Click below to extract text and analyze the medical record using OCR and AI
                  </p>
                </div>
                <Button onClick={processOCR}>
                  <Brain className="h-4 w-4 mr-2" />
                  Process with AI
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Edit Extracted Data</CardTitle>
        <CardDescription>
          Review the AI-extracted information and make any necessary corrections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={extractedData.patientName}
                onChange={(e) => setExtractedData({ ...extractedData, patientName: e.target.value })}
                placeholder="Enter patient's full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={extractedData.patientId}
                onChange={(e) => setExtractedData({ ...extractedData, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={extractedData.age}
                onChange={(e) => setExtractedData({ ...extractedData, age: e.target.value })}
                placeholder="Patient age"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={extractedData.gender} onValueChange={(value) => setExtractedData({ ...extractedData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recordDate">Record Date</Label>
              <Input
                id="recordDate"
                type="date"
                value={extractedData.recordDate}
                onChange={(e) => setExtractedData({ ...extractedData, recordDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={extractedData.diagnosis}
              onChange={(e) => setExtractedData({ ...extractedData, diagnosis: e.target.value })}
              placeholder="Enter diagnosis details"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              value={extractedData.prescription}
              onChange={(e) => setExtractedData({ ...extractedData, prescription: e.target.value })}
              placeholder="Enter prescription details"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Record...
              </>
            ) : (
              'Save Medical Record'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OCRProcessor;