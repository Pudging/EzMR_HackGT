"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HumanBodyModel } from "@/components/patient/human-body-model";
import { PatientDataEntry } from "@/components/patient/patient-data-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, ArrowLeft, AlertCircle } from "lucide-react";

type PatientData = Record<string, string>;

interface SelectedPatient {
  id: string;
  name: string;
  patientId: string;
  dob: string;
  sex: string;
  bloodType?: string;
}

export default function PatientAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);

  useEffect(() => {
    // Check for selected patient in sessionStorage or URL params
    const patientFromStorage = sessionStorage.getItem('selectedPatient');
    const patientIdFromUrl = searchParams.get('patientId');
    
    if (patientFromStorage) {
      const patient = JSON.parse(patientFromStorage);
      setSelectedPatient(patient);
      setIsLoading(false);
    } else if (patientIdFromUrl) {
      // Mock data lookup by ID - in real app this would be an API call
      const mockPatients: SelectedPatient[] = [
        {
          id: "pat_1",
          name: "Kevin Ketong Gao",
          patientId: "1", 
          dob: "1995-03-15",
          sex: "Male",
          bloodType: "O+"
        }
      ];
      
      const patient = mockPatients.find(p => p.patientId === patientIdFromUrl);
      if (patient) {
        setSelectedPatient(patient);
        sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleDataUpdate = (bodyPart: string, description: string) => {
    setPatientData((prev: PatientData) => ({
      ...prev,
      [bodyPart]: description,
    }));
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading animation first
  if (isLoading) {
    return (
      <LoadingAnimation onComplete={handleLoadingComplete} duration={3500} />
    );
  }

  // Redirect to patient lookup if no patient selected
  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>No Patient Selected</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please select a patient before accessing the assessment page.
            </p>
            <Button onClick={() => router.push('/patient-lookup')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Patient Lookup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <header className="bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <User className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-semibold">
                  Patient Assessment - {selectedPatient.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  ID: {selectedPatient.patientId} • DOB: {selectedPatient.dob} • {selectedPatient.sex}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/patient-lookup')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Patient
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side - Human Body Model */}
          <Card className="flex h-full flex-col gap-0 border pb-0">
            <CardHeader className="border-b">
              <CardTitle className="text-card-foreground flex items-center space-x-2">
                <Stethoscope className="text-primary h-5 w-5" />
                <span>3D Body Model</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <HumanBodyModel
                selectedBodyPart={selectedBodyPart}
                onBodyPartSelect={handleBodyPartSelect}
                patientData={patientData}
              />
            </CardContent>
          </Card>

          {/* Right Side - Patient Data Entry */}
          <Card className="h-full border py-0">
            <PatientDataEntry
              selectedBodyPart={selectedBodyPart}
              patientData={patientData}
              onDataUpdate={handleDataUpdate}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
