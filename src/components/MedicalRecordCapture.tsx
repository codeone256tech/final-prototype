import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  FileText, 
  Save, 
  X, 
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ExtractedData {
  patient_name: string;
  patient_id: string;
  age: string;
  gender: string;
  diagnosis: string;
  prescription: string;
  record_date: string;
}

interface MedicalRecordCaptureProps {
  onRecordSaved: () => void;
  onCancel: () => void;
}

const MedicalRecordCapture = ({ onRecordSaved, onCancel }: MedicalRecordCaptureProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    patient_name: '',
    patient_id: '',
    age: '',
    gender: '',
    diagnosis: '',
    prescription: '',
    record_date: new Date().toISOString().split('T')[0]
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'capture' | 'review' | 'preview'>('capture');

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCapturedImage(imageUrl);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      // Simulate OCR processing - In a real app, this would call an OCR API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data - Replace with actual OCR results
      const mockData: ExtractedData = {
        patient_name: 'John Smith',
        patient_id: 'PAT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        age: '45',
        gender: 'Male',
        diagnosis: 'Hypertension, Type 2 Diabetes',
        prescription: 'Metformin 500mg - Take twice daily, Lisinopril 10mg - Take once daily',
        record_date: new Date().toISOString().split('T')[0]
      };
      
      setExtractedData(mockData);
      setStep('review');
      
      toast({
        title: "OCR Processing Complete",
        description: "Please review and edit the extracted information before saving."
      });
    } catch (error: any) {
      toast({
        title: "OCR Processing Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: extractedData.patient_id,
          patient_name: extractedData.patient_name,
          age: extractedData.age ? parseInt(extractedData.age) : null,
          gender: extractedData.gender || null,
          diagnosis: extractedData.diagnosis || null,
          prescription: extractedData.prescription || null,
          record_date: extractedData.record_date || null,
          image_url: capturedImage, // In a real app, upload to storage first
          created_by: user?.id || ''
        });

      if (error) throw error;

      toast({
        title: "Record Saved",
        description: "Medical record has been successfully saved to the database."
      });

      onRecordSaved();
    } catch (error: any) {
      toast({
        title: "Error saving record",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setExtractedData({
      patient_name: '',
      patient_id: '',
      age: '',
      gender: '',
      diagnosis: '',
      prescription: '',
      record_date: new Date().toISOString().split('T')[0]
    });
    setStep('capture');
  };

  const renderCaptureStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Capture Medical Record</h2>
        <p className="text-muted-foreground">
          Take a photo or upload an image of the handwritten medical record
        </p>
      </div>

      <div className="grid gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="h-32 bg-medical-blue hover:bg-medical-blue/90 flex-col gap-3"
          size="lg"
        >
          <Camera className="h-8 w-8" />
          <span>Take Photo / Upload Image</span>
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
          className="hidden"
        />
      </div>

      {capturedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Captured Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={capturedImage}
              alt="Captured medical record"
              className="w-full max-h-64 object-contain rounded-lg border"
            />
            {isProcessing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-medical-blue">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing with AI OCR...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Extracted Data</h2>
          <p className="text-muted-foreground">
            Please review and edit the information before saving
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-medical-green" />
          OCR Complete
        </Badge>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_name">Patient Name</Label>
            <Input
              id="patient_name"
              value={extractedData.patient_name}
              onChange={(e) => setExtractedData({ ...extractedData, patient_name: e.target.value })}
              placeholder="Enter patient name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient ID</Label>
            <Input
              id="patient_id"
              value={extractedData.patient_id}
              onChange={(e) => setExtractedData({ ...extractedData, patient_id: e.target.value })}
              placeholder="Enter patient ID"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={extractedData.age}
              onChange={(e) => setExtractedData({ ...extractedData, age: e.target.value })}
              placeholder="Enter age"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              value={extractedData.gender}
              onChange={(e) => setExtractedData({ ...extractedData, gender: e.target.value })}
              placeholder="Enter gender"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="record_date">Record Date</Label>
            <Input
              id="record_date"
              type="date"
              value={extractedData.record_date}
              onChange={(e) => setExtractedData({ ...extractedData, record_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            value={extractedData.diagnosis}
            onChange={(e) => setExtractedData({ ...extractedData, diagnosis: e.target.value })}
            placeholder="Enter diagnosis"
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
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={() => setStep('preview')}
          className="flex-1 bg-medical-green hover:bg-medical-green/90"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Record
        </Button>
        <Button onClick={resetCapture} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Preview Medical Record</h2>
        <Button 
          onClick={() => setStep('review')} 
          variant="outline"
          size="sm"
        >
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Review all details before saving</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Patient Name:</span>
              <p className="text-muted-foreground">{extractedData.patient_name || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Patient ID:</span>
              <p className="text-muted-foreground">{extractedData.patient_id || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Age:</span>
              <p className="text-muted-foreground">{extractedData.age || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Gender:</span>
              <p className="text-muted-foreground">{extractedData.gender || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Record Date:</span>
              <p className="text-muted-foreground">{extractedData.record_date || 'Not specified'}</p>
            </div>
          </div>
          
          <div>
            <span className="font-medium">Diagnosis:</span>
            <p className="text-muted-foreground mt-1">{extractedData.diagnosis || 'Not specified'}</p>
          </div>
          
          <div>
            <span className="font-medium">Prescription:</span>
            <p className="text-muted-foreground mt-1">{extractedData.prescription || 'Not specified'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-medical-blue hover:bg-medical-blue/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Record
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {step === 'capture' && renderCaptureStep()}
      {step === 'review' && renderReviewStep()}
      {step === 'preview' && renderPreviewStep()}
    </div>
  );
};

export default MedicalRecordCapture;