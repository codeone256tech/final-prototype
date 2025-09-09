import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ManualEntryProps {
  onSuccess: () => void;
}

const ManualEntry = ({ onSuccess }: ManualEntryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    age: '',
    gender: '',
    diagnosis: '',
    prescription: '',
    recordDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create records",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_name: formData.patientName,
          patient_id: formData.patientId,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          diagnosis: formData.diagnosis || null,
          prescription: formData.prescription || null,
          record_date: formData.recordDate,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record created successfully"
      });

      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        age: '',
        gender: '',
        diagnosis: '',
        prescription: '',
        recordDate: new Date().toISOString().split('T')[0]
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name *</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            placeholder="Enter patient's full name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID *</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            placeholder="Enter patient ID"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Patient age"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
            value={formData.recordDate}
            onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          placeholder="Enter diagnosis details"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prescription">Prescription</Label>
        <Textarea
          id="prescription"
          value={formData.prescription}
          onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
          placeholder="Enter prescription details"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Record...' : 'Create Medical Record'}
      </Button>
    </form>
  );
};

export default ManualEntry;