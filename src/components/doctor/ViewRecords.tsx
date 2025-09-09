import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Download, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalRecord {
  id: string;
  patient_name: string;
  patient_id: string;
  age?: number;
  gender?: string;
  diagnosis?: string;
  prescription?: string;
  record_date?: string;
  created_at: string;
}

interface ViewRecordsProps {
  searchTerm: string;
}

const ViewRecords = ({ searchTerm }: ViewRecordsProps) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
    if (searchTerm) {
      fetchRecords(searchTerm);
    }
  }, [searchTerm]);

  const fetchRecords = async (search?: string) => {
    try {
      let query = supabase
        .from('medical_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`patient_name.ilike.%${search}%,patient_id.ilike.%${search}%,diagnosis.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch medical records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRecords(localSearchTerm);
  };

  const handleExport = (record: MedicalRecord) => {
    const recordData = {
      patientName: record.patient_name,
      patientId: record.patient_id,
      age: record.age,
      gender: record.gender,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      recordDate: record.record_date,
      createdAt: record.created_at
    };

    const dataStr = JSON.stringify(recordData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_record_${record.patient_id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Medical record exported successfully"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading medical records...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Medical Records
        </CardTitle>
        <CardDescription>
          View and manage all patient medical records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search by patient name, ID, or diagnosis..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {localSearchTerm ? 'No records found matching your search.' : 'No medical records found. Add some records to get started.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <>
                  <TableRow 
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                  >
                    <TableCell className="font-medium">{record.patient_name}</TableCell>
                    <TableCell>{record.patient_id}</TableCell>
                    <TableCell>{record.age || 'N/A'}</TableCell>
                    <TableCell>
                      {record.gender && (
                        <Badge variant="outline">{record.gender}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {record.record_date ? new Date(record.record_date).toLocaleDateString() : new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(record);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRecord === record.id && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Diagnosis</h4>
                              <p className="text-sm text-muted-foreground">
                                {record.diagnosis || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Prescription</h4>
                              <p className="text-sm text-muted-foreground">
                                {record.prescription || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewRecords;