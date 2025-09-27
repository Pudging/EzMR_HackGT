"use client";

import { useState } from "react";
import { HumanBodyModel } from "@/components/patient/human-body-model";
import { PatientDataEntry } from "@/components/patient/patient-data-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { User, Stethoscope } from "lucide-react";

type PatientData = Record<string, string>;

export default function PatientAssessmentPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({});
  const [isLoading, setIsLoading] = useState(true);

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
                  Patient Assessment
                </h1>
                <p className="text-muted-foreground text-sm">
                  Interactive Body Analysis
                </p>
              </div>
            </div>
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
