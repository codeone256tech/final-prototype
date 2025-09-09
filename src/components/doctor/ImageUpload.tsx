import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import OCRProcessor from './OCRProcessor';

interface ImageUploadProps {
  onSuccess: () => void;
}

const ImageUpload = ({ onSuccess }: ImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (selectedImage && imagePreview) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Selected Image</h3>
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Change Image
              </Button>
            </div>
            <img 
              src={imagePreview} 
              alt="Selected medical record" 
              className="max-w-full h-auto rounded-lg border"
            />
          </CardContent>
        </Card>
        
        <OCRProcessor 
          imageFile={selectedImage}
          onSuccess={onSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-8">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-medical-blue/10 p-4 rounded-full">
                <Upload className="h-8 w-8 text-medical-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Medical Record Image</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop an image file, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, GIF files up to 10MB
                </p>
              </div>
              <Button variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Tips for better OCR results:</p>
        <ul className="mt-2 space-y-1">
          <li>• Ensure good lighting and focus</li>
          <li>• Keep the document flat and aligned</li>
          <li>• Use high resolution images when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;