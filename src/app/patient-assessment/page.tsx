"use client";

import { useState } from "react";
import { HumanBodyModel } from "@/components/patient/human-body-model";
import { PatientDataEntry } from "@/components/patient/patient-data-entry";

interface PatientData {
  [key: string]: string;
}

export default function PatientAssessmentPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({});

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleDataUpdate = (bodyPart: string, description: string) => {
    setPatientData((prev: PatientData) => ({
      ...prev,
      [bodyPart]: description
    }));
  };

  return (
    <main className="h-screen bg-black flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center border border-white bg-black">
            <span className="text-white font-mono font-bold">MR</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Patient Assessment
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left Side - Human Body Model */}
          <div className="border border-white bg-black h-full flex flex-col">
            <div className="p-4 border-b border-white flex-shrink-0">
              <h2 className="text-lg font-mono font-bold text-white">
                3D BODY MODEL
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <HumanBodyModel
                selectedBodyPart={selectedBodyPart}
                onBodyPartSelect={handleBodyPartSelect}
                patientData={patientData}
              />
            </div>
          </div>

          {/* Right Side - Patient Data Entry */}
          <div className="border border-white bg-black h-full">
            <PatientDataEntry
              selectedBodyPart={selectedBodyPart}
              patientData={patientData}
              onDataUpdate={handleDataUpdate}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
