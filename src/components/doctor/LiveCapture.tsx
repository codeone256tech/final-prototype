import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CameraOff, RotateCcw, Check } from 'lucide-react';
import OCRProcessor from './OCRProcessor';

interface LiveCaptureProps {
  onSuccess: () => void;
}

const LiveCapture = ({ onSuccess }: LiveCaptureProps) => {
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreamActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        
        // Convert to File object
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `medical_record_${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            setCapturedFile(file);
          }
        }, 'image/jpeg', 0.8);
        
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  }, [startCamera]);

  // Cleanup on unmount
  useState(() => {
    return () => {
      stopCamera();
    };
  });

  if (capturedImage && capturedFile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Captured Image</h3>
              <Button variant="outline" size="sm" onClick={retakePhoto}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
            <img 
              src={capturedImage} 
              alt="Captured medical record" 
              className="max-w-full h-auto rounded-lg border"
            />
          </CardContent>
        </Card>
        
        <OCRProcessor 
          imageFile={capturedFile}
          onSuccess={onSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          {!isStreamActive ? (
            <div className="text-center py-12">
              <div className="bg-medical-blue/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Camera className="h-8 w-8 text-medical-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Camera Capture</h3>
              <p className="text-muted-foreground mb-6">
                Capture a medical record directly using your device's camera
              </p>
              <Button onClick={startCamera}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={stopCamera}>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
                <Button onClick={capturePhoto}>
                  <Check className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!isStreamActive && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Tips for better capture:</p>
          <ul className="mt-2 space-y-1">
            <li>• Ensure good lighting</li>
            <li>• Hold the device steady</li>
            <li>• Position the document flat and centered</li>
            <li>• Make sure all text is clearly visible</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LiveCapture;