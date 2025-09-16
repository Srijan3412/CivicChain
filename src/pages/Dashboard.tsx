import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SummaryCards from '@/components/budget/SummaryCards';
import BudgetTable from '@/components/budget/BudgetTable';
import BudgetChart from '@/components/budget/BudgetChart';
import AiInsights from '@/components/budget/AiInsights';
import { CsvImport } from '@/components/budget/CsvImport';
import DepartmentSelector from '@/components/budget/DepartmentSelector';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  ward: number;
  year: number;
}

interface BudgetSummary {
  totalBudget: number;
  largestCategory: {
    category: string;
    amount: number;
  } | null;
  yearOverYearChange: number;
}

const Dashboard = () => {
  const [department, setDepartment] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const fetchBudgetData = async () => {
    if (!department) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a department.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-budget', {
        body: {
          department: department
        }
      });

      if (error) {
        throw error;
      }

      setBudgetData(data.budgetData || []);
      setSummary(data.summary || null);
      
      toast({
        title: "Data Loaded",
        description: `Found ${data.budgetData?.length || 0} budget items for ${department}.`,
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Failed to fetch budget data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Municipal Budget Portal</h1>
            <p className="text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Data Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <DepartmentSelector value={department} onChange={setDepartment} />
                  <Button onClick={fetchBudgetData} disabled={loading || !department}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? 'Fetching...' : 'Fetch Budget Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <CsvImport />
          </div>
        </div>

        {/* Summary Cards */}
        {summary && <SummaryCards summary={summary} />}

        {/* Main Content Grid */}
        {budgetData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <BudgetTable budgetData={budgetData} department={department} />
            <BudgetChart budgetData={budgetData} />
          </div>
        )}

        {/* AI Insights */}
        <AiInsights budgetData={budgetData} department={department} />

        {/* Empty State */}
        {!summary && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Loaded</h3>
              <p className="text-muted-foreground">
                Select a department, then click "Fetch Budget Data" to view municipal budget information.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;