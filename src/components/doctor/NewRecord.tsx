import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, Upload, Camera } from 'lucide-react';
import ManualEntry from './ManualEntry';
import ImageUpload from './ImageUpload';
import LiveCapture from './LiveCapture';

interface NewRecordProps {
  onSuccess: () => void;
}

const NewRecord = ({ onSuccess }: NewRecordProps) => {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Medical Record</CardTitle>
        <CardDescription>
          Choose your preferred method to create a new medical record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="capture" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Live Capture
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <ManualEntry onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <ImageUpload onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="capture" className="mt-6">
            <LiveCapture onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NewRecord;