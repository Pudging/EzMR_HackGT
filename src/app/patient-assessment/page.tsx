"use client";

import { useState } from "react";
import { HumanBodyModel } from "@/components/patient/human-body-model";
import { PatientDataEntry } from "@/components/patient/patient-data-entry";

type PatientData = Record<string, string>;

export default function PatientAssessmentPage() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({});

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleDataUpdate = (bodyPart: string, description: string) => {
    setPatientData((prev: PatientData) => ({
      ...prev,
      [bodyPart]: description,
    }));
  };

  return (
    <main className="flex h-screen flex-col bg-black">
      {/* Navigation */}
      <nav className="flex flex-shrink-0 items-center justify-between border-b border-white p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center border border-white bg-black">
            <span className="font-mono font-bold text-white">MR</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Patient Assessment
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Side - Human Body Model */}
          <div className="flex h-full flex-col border border-white bg-black">
            <div className="flex-shrink-0 border-b border-white p-4">
              <h2 className="font-mono text-lg font-bold text-white">
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
          <div className="h-full border border-white bg-black">
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
