import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Calendar, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalRecords: number;
  thisMonth: number;
  commonDiagnoses: { diagnosis: string; count: number }[];
  monthlyTrends: { month: string; count: number }[];
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all records
      const { data: records, error } = await supabase
        .from('medical_records')
        .select('diagnosis, created_at');

      if (error) throw error;

      if (records) {
        const now = new Date();
        const thisMonth = records.filter(record => {
          const recordDate = new Date(record.created_at);
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear();
        }).length;

        // Calculate common diagnoses
        const diagnosisCount: { [key: string]: number } = {};
        records.forEach(record => {
          if (record.diagnosis && record.diagnosis.trim() !== '' && record.diagnosis !== 'Not found') {
            const diagnosis = record.diagnosis.toLowerCase().trim();
            diagnosisCount[diagnosis] = (diagnosisCount[diagnosis] || 0) + 1;
          }
        });

        const commonDiagnoses = Object.entries(diagnosisCount)
          .map(([diagnosis, count]) => ({ diagnosis, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate monthly trends (last 6 months)
        const monthlyTrends = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthRecords = records.filter(record => {
            const recordDate = new Date(record.created_at);
            return recordDate.getMonth() === date.getMonth() && 
                   recordDate.getFullYear() === date.getFullYear();
          }).length;
          
          monthlyTrends.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count: monthRecords
          });
        }

        setAnalytics({
          totalRecords: records.length,
          thisMonth,
          commonDiagnoses,
          monthlyTrends
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">No analytics data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-medical-blue" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">{analytics.totalRecords}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-medical-green" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-green">{analytics.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-medical-orange" />
              Average/Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-orange">
              {analytics.totalRecords > 0 ? Math.round(analytics.totalRecords / 6) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="h-4 w-4 text-medical-red" />
              Unique Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-red">{analytics.commonDiagnoses.length}</div>
            <p className="text-xs text-muted-foreground">Different conditions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
            <CardDescription>Records created per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trend.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-medical-blue/20 h-2 rounded-full" style={{ width: `${Math.max(trend.count * 20, 20)}px` }} />
                    <span className="text-sm text-muted-foreground">{trend.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Common Diagnoses
            </CardTitle>
            <CardDescription>Most frequent conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.commonDiagnoses.length > 0 ? (
                analytics.commonDiagnoses.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{item.diagnosis}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-medical-green/20 h-2 rounded-full" style={{ width: `${Math.max(item.count * 10, 20)}px` }} />
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No diagnosis data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;