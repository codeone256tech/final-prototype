import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  User, 
  Calendar, 
  Eye, 
  RefreshCw,
  Stethoscope
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  age: number | null;
  gender: string | null;
  diagnosis: string | null;
  prescription: string | null;
  record_date: string | null;
  created_at: string;
}

interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  loading: boolean;
  onRefresh: () => void;
}

const MedicalRecordsTable = ({ records, loading, onRefresh }: MedicalRecordsTableProps) => {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading medical records...</p>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No records found</h3>
          <p className="text-muted-foreground mb-4">
            No medical records match your search criteria or no records have been created yet.
          </p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                {records.length} record{records.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="bg-medical-blue/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-medical-blue" />
                        </div>
                        <div>
                          <p className="font-medium">{record.patient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.patient_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {record.age && <p>{record.age} years</p>}
                        {record.gender && <p className="text-muted-foreground">{record.gender}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {record.diagnosis ? (
                          <p className="text-sm truncate" title={record.diagnosis}>
                            {record.diagnosis}
                          </p>
                        ) : (
                          <span className="text-muted-foreground">No diagnosis</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {record.record_date 
                            ? new Date(record.record_date).toLocaleDateString()
                            : 'Not set'
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewDetails(record)}
                        size="sm"
                        variant="ghost"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-medical-blue/10 p-2 rounded-full">
                <Stethoscope className="h-5 w-5 text-medical-blue" />
              </div>
              Medical Record Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedRecord?.patient_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Patient Name</h4>
                  <p className="font-medium">{selectedRecord.patient_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Patient ID</h4>
                  <Badge variant="outline">{selectedRecord.patient_id}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Age</h4>
                  <p>{selectedRecord.age ? `${selectedRecord.age} years` : 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Gender</h4>
                  <p>{selectedRecord.gender || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Record Date</h4>
                  <p>
                    {selectedRecord.record_date 
                      ? new Date(selectedRecord.record_date).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Created</h4>
                  <p>{new Date(selectedRecord.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Diagnosis</h4>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm">
                    {selectedRecord.diagnosis || 'No diagnosis provided'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Prescription</h4>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedRecord.prescription || 'No prescription provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecordsTable;