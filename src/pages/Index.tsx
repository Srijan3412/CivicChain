import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Shield, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Municipal Budget Transparency
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Access and analyze your local ward's budget data with AI-powered insights. 
          Promoting transparency and accountability in municipal spending.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Budget Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interactive charts and tables to visualize municipal budget allocation across categories.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get intelligent insights about spending patterns, anomalies, and optimization opportunities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Secure authentication system to protect access to municipal budget information.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Ward-Based Data</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Filter and analyze budget data by specific wards and fiscal years for targeted insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Your Municipal Budget?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of citizens promoting transparency in local government.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Start Analyzing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
