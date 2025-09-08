import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Camera, FileText, Shield, UserCheck, Scan } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-medical-blue text-white p-2 rounded-lg">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediScan AI</h1>
              <p className="text-sm text-muted-foreground">Medical Records Digitization</p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="bg-medical-blue hover:bg-medical-blue/90">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            Digitize Medical Records
            <br />
            with AI Intelligence
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform handwritten medical records into searchable digital data using advanced OCR technology. 
            Secure, efficient, and designed for healthcare professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-medical-blue hover:bg-medical-blue/90">
                <UserCheck className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <FileText className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-medical-blue/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Camera className="h-8 w-8 text-medical-blue" />
              </div>
              <CardTitle>Mobile Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Capture handwritten medical records with your smartphone camera or upload existing images
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-medical-green/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Scan className="h-8 w-8 text-medical-green" />
              </div>
              <CardTitle>AI-Powered OCR</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced optical character recognition that works with both printed and handwritten text
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-medical-orange/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-medical-orange" />
              </div>
              <CardTitle>Smart Field Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically detect and extract patient details, diagnosis, prescriptions, and more
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-medical-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-medical-red" />
              </div>
              <CardTitle>Secure & Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                HIPAA-compliant secure storage with role-based access control for healthcare professionals
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-medical-blue/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-medical-blue" />
              </div>
              <CardTitle>Review & Edit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review extracted data and make corrections before saving to ensure accuracy
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-medical-green/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-medical-green" />
              </div>
              <CardTitle>Search & Retrieve</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Quickly search patient records by name, ID, diagnosis, or date with instant results
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-medical-blue/10 to-medical-green/10 rounded-2xl p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Medical Records?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join healthcare professionals who are already using MediScan AI to digitize and manage their medical records efficiently.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-medical-blue hover:bg-medical-blue/90">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 MediScan AI. All rights reserved.</p>
          <p className="mt-2 text-sm">For healthcare professionals only</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
