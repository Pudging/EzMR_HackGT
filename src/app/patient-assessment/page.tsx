"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HybridBodyModel } from "@/components/patient/hybrid-body-model";
import { PatientDataEntry } from "@/components/patient/patient-data-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  User,
  Stethoscope,
  ArrowLeft,
  AlertCircle,
  Shield,
  Pill,
  Activity,
  Calendar,
  Users,
  FileDigit,
  Bell,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

type PatientData = Record<string, string>;

interface SelectedPatient {
  id: string;
  name: string;
  patientId: string;
  dob: string;
  sex: string;
  bloodType?: string;
  address?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
}

interface Allergy {
  substance: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string;
  notedOn: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  lastTaken: string;
  active: boolean;
}

interface MedicalCondition {
  condition: string;
  diagnosisDate: string;
  status: "active" | "resolved" | "chronic";
  notes: string;
}

interface AdvanceCarePlan {
  dnr: boolean;
  molst: boolean;
  dnrDate?: string;
  molstDate?: string;
  notes?: string;
}

interface BreakGlassAudit {
  timestamp: string;
  username: string;
  reason: string;
  patientId: string;
}

export default function PatientAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIssue, setCurrentIssue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] =
    useState<SelectedPatient | null>(null);
  const [history, setHistory] = useState<
    Array<{ timestamp: string; note: string }>
  >([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [highlightedParts, setHighlightedParts] = useState<string[]>([]);
  const [skeletonFile, setSkeletonFile] = useState<string>(
    "overview-skeleton.glb",
  );

  // Patient assessment data for body parts
  const [patientData, setPatientData] = useState<Record<string, string>>({});
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<
    Record<string, "idle" | "pending" | "saving" | "saved">
  >({});

  // EMS-specific state
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalCondition[]>([]);
  const [advanceCarePlan, setAdvanceCarePlan] = useState<AdvanceCarePlan>({
    dnr: false,
    molst: false,
  });
  const [breakGlassOverride, setBreakGlassOverride] = useState<boolean>(false);
  const [breakGlassUsername, setBreakGlassUsername] = useState<string>("");
  const [breakGlassReason, setBreakGlassReason] = useState<string>("");
  const [showBreakGlassModal, setShowBreakGlassModal] =
    useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<BreakGlassAudit[]>([]);

  // Debounce timer for auto-analysis
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch existing assessment history from the API
  const fetchPatientHistory = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/assessment`);
      if (response.ok) {
        const assessmentData = await response.json();

        // Set patient data for the hybrid model
        setPatientData(assessmentData);

        // Convert body part data to history format
        const historyEntries = Object.entries(assessmentData)
          .filter(
            ([_, value]) => value && typeof value === "string" && value.trim(),
          )
          .map(([bodyPart, note]) => ({
            timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
            note: `${bodyPart}: ${note as string}`,
          }));
        setHistory(historyEntries);
      } else {
        console.log("No existing assessment history found");
      }
    } catch (error) {
      console.error("Error fetching assessment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update patient data for a specific body part
  const handleDataUpdate = async (bodyPart: string, data: string) => {
    if (!selectedPatient) return;

    // Update local state immediately
    setPatientData((prev) => ({
      ...prev,
      [bodyPart]: data,
    }));

    // Set saving status
    setSavingStatus((prev) => ({ ...prev, [bodyPart]: "saving" }));

    try {
      // Save to API
      const response = await fetch(
        `/api/patients/${selectedPatient.patientId}/assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [bodyPart]: data,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save assessment data");
      }

      console.log(`✅ Saved assessment data for ${bodyPart}`);

      // Set saved status
      setSavingStatus((prev) => ({ ...prev, [bodyPart]: "saved" }));

      // Clear saved status after 2 seconds
      setTimeout(() => {
        setSavingStatus((prev) => ({ ...prev, [bodyPart]: "idle" }));
      }, 2000);
    } catch (error) {
      console.error("Error saving assessment data:", error);
      // Revert local state on error
      setPatientData((prev) => {
        const updated = { ...prev };
        if (data.trim() === "") {
          delete updated[bodyPart];
        } else {
          updated[bodyPart] = data;
        }
        return updated;
      });

      // Set error status (using idle as fallback)
      setSavingStatus((prev) => ({ ...prev, [bodyPart]: "idle" }));
    }
  };

  // Function to load comprehensive patient data for EMS
  const loadPatientEMSData = async (patientId: string) => {
    try {
      // Load mock EMS data - in real app this would be API calls
      const mockData = {
        allergies: [
          {
            substance: "Penicillin",
            severity: "severe" as const,
            reaction: "Anaphylaxis",
            notedOn: "2023-01-15",
          },
          {
            substance: "Shellfish",
            severity: "moderate" as const,
            reaction: "Hives, difficulty breathing",
            notedOn: "2022-06-10",
          },
        ],
        medications: [
          {
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            lastTaken: "2024-12-15",
            active: true,
          },
          {
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            lastTaken: "2024-12-15",
            active: true,
          },
          {
            name: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily",
            lastTaken: "2024-12-14",
            active: true,
          },
        ],
        medicalHistory: [
          {
            condition: "Type 2 Diabetes",
            diagnosisDate: "2020-03-15",
            status: "chronic" as const,
            notes: "Well controlled with medication",
          },
          {
            condition: "Hypertension",
            diagnosisDate: "2019-08-22",
            status: "chronic" as const,
            notes: "Stable on ACE inhibitor",
          },
          {
            condition: "Appendectomy",
            diagnosisDate: "2015-06-10",
            status: "resolved" as const,
            notes: "Laparoscopic procedure, no complications",
          },
        ],
        advanceCarePlan: {
          dnr: false,
          molst: true,
          molstDate: "2024-01-15",
          notes: "Full code, comfort measures only if terminal",
        },
      };

      setAllergies(mockData.allergies);
      setMedications(mockData.medications);
      setMedicalHistory(mockData.medicalHistory);
      setAdvanceCarePlan(mockData.advanceCarePlan);
    } catch (error) {
      console.error("Error loading EMS data:", error);
    }
  };

  // Break-glass override functions
  const handleBreakGlassOverride = () => {
    if (!breakGlassUsername.trim() || !breakGlassReason.trim()) {
      alert("Please provide both username and reason for break-glass override");
      return;
    }

    const auditEntry: BreakGlassAudit = {
      timestamp: new Date().toISOString(),
      username: breakGlassUsername,
      reason: breakGlassReason,
      patientId: selectedPatient?.patientId ?? "",
    };

    setAuditLog((prev) => [auditEntry, ...prev]);
    setBreakGlassOverride(true);
    setShowBreakGlassModal(false);
    setBreakGlassUsername("");
    setBreakGlassReason("");
  };

  const resetBreakGlassOverride = () => {
    setBreakGlassOverride(false);
  };

  useEffect(() => {
    // Check for selected patient in sessionStorage or URL params
    const patientFromStorage = sessionStorage.getItem("selectedPatient");
    const patientIdFromUrl = searchParams.get("patientId");

    if (patientFromStorage) {
      const patient = JSON.parse(patientFromStorage);
      setSelectedPatient(patient);
      // Fetch existing assessment history for this patient
      void fetchPatientHistory(patient.patientId);
      // Load EMS data
      void loadPatientEMSData(patient.patientId);
    } else if (patientIdFromUrl) {
      // Mock data lookup by ID - in real app this would be an API call
      const mockPatients: SelectedPatient[] = [
        {
          id: "pat_1",
          name: "Kevin Ketong Gao",
          patientId: "1",
          dob: "1995-03-15",
          sex: "Male",
          bloodType: "O+",
          address: "123 Main St, Atlanta, GA 30309",
          phone: "(555) 123-4567",
          email: "kevin.gao@email.com",
          emergencyContact: "Jane Doe (Spouse) - (555) 234-5678",
        },
      ];

      const patient = mockPatients.find(
        (p) => p.patientId === patientIdFromUrl,
      );
      if (patient) {
        setSelectedPatient(patient);
        sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
        // Fetch existing assessment history for this patient
        void fetchPatientHistory(patient.patientId);
        // Load EMS data
        void loadPatientEMSData(patient.patientId);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Submit current issue to assessment database
  const submitCurrentIssue = async () => {
    if (!currentIssue.trim() || !selectedPatient) return;

    setIsSubmitting(true);

    // Trigger analysis for 3D highlighting
    setSearchText(currentIssue);
    void analyzeInjury();

    try {
      // Save to assessment API with real-time feedback
      const response = await fetch(
        `/api/patients/${selectedPatient.patientId}/assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "general-status": currentIssue.trim(), // Save as general status in assessment
          }),
        },
      );

      if (response.ok) {
        // Update local patient data for real-time feedback
        setPatientData((prev) => ({
          ...prev,
          "general-status": currentIssue.trim(),
        }));

        setCurrentIssue(""); // Clear input
        console.log("✅ Patient status update saved to assessment database");
      } else {
        console.error("Failed to save patient status update");
        throw new Error("Failed to save status update");
      }
    } catch (error) {
      console.error("Error saving patient status update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Analyze injury text and highlight specific parts
  const analyzeInjury = async () => {
    if (!searchText.trim()) {
      setAnalysisResult("Please enter an injury description");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("Analyzing injury...");

    try {
      const response = await fetch("/api/analyze-injury", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: searchText }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.message);

        // Set highlighted parts for 3D model
        if (result.injuredParts && result.injuredParts.length > 0) {
          console.log("API returned injured parts:", result.injuredParts);
          setHighlightedParts(result.injuredParts);
        }

        // Set skeleton file for 3D model
        if (result.skeletonFile) {
          console.log("API returned skeleton file:", result.skeletonFile);
          setSkeletonFile(result.skeletonFile);
          console.log("Skeleton file state updated to:", result.skeletonFile);
        }
      } else {
        setAnalysisResult(result.message ?? "No injuries detected");
        setHighlightedParts([]);
      }
    } catch (error) {
      console.error("Error analyzing injury:", error);
      setAnalysisResult("Error analyzing injury. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="mx-4 max-w-md gap-0 py-4">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <CardTitle className="mb-2">No Patient Selected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-4 text-center">
            <p className="text-muted-foreground">
              Please select a patient before accessing the assessment page.
            </p>
            <Button onClick={() => router.push("/patient-lookup")}>
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
                  ID: {selectedPatient.patientId} • DOB: {selectedPatient.dob} •{" "}
                  {selectedPatient.sex}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!breakGlassOverride && (
                <Button
                  variant="outline"
                  onClick={() => setShowBreakGlassModal(true)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Break-Glass Override
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/patient-lookup")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Patient
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Break-Glass Override Banner */}
        {breakGlassOverride && (
          <div className="border-destructive bg-destructive/10 mb-6 rounded-lg border-2 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-destructive h-6 w-6" />
                <div>
                  <h3 className="text-destructive font-semibold">
                    Break-Glass Override Active
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Emergency access granted to {auditLog[0]?.username} -{" "}
                    {auditLog[0]?.reason}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetBreakGlassOverride}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Lock className="mr-2 h-4 w-4" />
                End Override
              </Button>
            </div>
          </div>
        )}

        {/* Patient Demographics */}
        <div
          className="border-foreground mb-4 overflow-hidden border-2"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
          }}
        >
          <div className="border-foreground bg-background border-b-2 px-4 py-3">
            <h2
              className="text-foreground flex items-center text-lg font-black tracking-wide uppercase"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: "none",
              }}
            >
              <User className="text-primary mr-2 h-5 w-5" />
              PATIENT DEMOGRAPHICS
            </h2>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-3">
                <User className="text-primary h-5 w-5" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {selectedPatient.name.split(" ")[0]}{" "}
                    {selectedPatient.name.split(" ").pop()}
                  </p>
                  <p className="text-muted-foreground text-xs">Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="text-primary h-5 w-5" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(selectedPatient.dob).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000),
                    )}{" "}
                    years
                  </p>
                  <p className="text-muted-foreground text-xs">Age</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="text-primary h-5 w-5" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {selectedPatient.sex}
                  </p>
                  <p className="text-muted-foreground text-xs">Sex</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileDigit className="text-primary h-5 w-5" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    MRN: {selectedPatient.patientId}
                  </p>
                  <p className="text-muted-foreground text-xs">ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Side - Medical Imaging */}
          <div>
            <div
              className="border-foreground h-[800px] overflow-hidden border-2"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
              }}
            >
              <div className="border-foreground bg-background border-b-2 px-4 py-3">
                <h2
                  className="text-foreground flex items-center text-lg font-black tracking-wide uppercase"
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: "none",
                  }}
                >
                  <Stethoscope className="text-primary mr-2 h-5 w-5" />
                  MEDICAL IMAGING
                </h2>
              </div>
              <div className="h-[calc(100%-60px)] overflow-hidden">
                <HybridBodyModel
                  selectedBodyPart={selectedBodyPart}
                  onBodyPartSelect={setSelectedBodyPart}
                  patientData={patientData}
                  skeletonFile={skeletonFile}
                  analysisText={currentIssue}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Assessment Controls */}
          <div className="space-y-4">
            {/* Patient Status Update */}
            <div
              className="border-foreground overflow-hidden border-2 p-4"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              <h3
                className="text-foreground mb-3 flex items-center text-base font-black tracking-wide uppercase"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: "none",
                }}
              >
                <Stethoscope className="text-primary mr-2 h-5 w-5" />
                PATIENT STATUS UPDATE
              </h3>
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter patient status, symptoms, or observations for hospital records..."
                  value={currentIssue}
                  onChange={(e) => {
                    setCurrentIssue(e.target.value);
                    // Auto-analyze injury when typing
                    if (e.target.value.trim()) {
                      setSearchText(e.target.value);
                      // Debounce the API call
                      if (debounceTimer.current) {
                        clearTimeout(debounceTimer.current);
                      }
                      debounceTimer.current = setTimeout(() => {
                        void analyzeInjury();
                      }, 500);
                    }
                  }}
                  className="border-foreground bg-background text-foreground min-h-[80px] border-2 text-sm"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  }}
                />
                <div className="flex items-center justify-between">
                  <Button
                    onClick={submitCurrentIssue}
                    disabled={!currentIssue.trim() || isSubmitting}
                    className="border-foreground text-foreground border-2 bg-transparent px-4 py-2 uppercase hover:bg-white hover:text-black"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    }}
                  >
                    {isSubmitting ? "TRANSMITTING..." : "SEND STATUS"}
                  </Button>
                  <span className="text-muted-foreground font-mono text-sm">
                    {currentIssue.length} chars
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Notes */}
            <div
              className="border-foreground h-[580px] overflow-hidden border-2"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              <div className="border-foreground bg-background border-b-2 px-4 py-3">
                <h3
                  className="text-foreground flex items-center text-base font-black tracking-wide uppercase"
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: "none",
                  }}
                >
                  <User className="text-primary mr-2 h-5 w-5" />
                  ASSESSMENT NOTES
                </h3>
              </div>
              <div className="h-[calc(100%-60px)] overflow-auto p-4">
                <PatientDataEntry
                  selectedBodyPart={selectedBodyPart}
                  patientData={patientData}
                  onDataUpdate={handleDataUpdate}
                  savingStatus={savingStatus}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Patient Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Severe Allergies */}
          <div
            className="border-foreground overflow-hidden border-2 p-3"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <h3
              className="text-foreground mb-2 flex items-center text-sm font-black tracking-wide uppercase"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: "none",
              }}
            >
              <Bell className="text-destructive mr-2 h-4 w-4" />
              ALLERGIES
            </h3>
            {allergies.filter((allergy) => allergy.severity === "severe")
              .length > 0 ? (
              allergies
                .filter((allergy) => allergy.severity === "severe")
                .map((allergy, index) => (
                  <div
                    key={index}
                    className="border-foreground bg-destructive/10 mb-1 overflow-hidden border-2 p-1"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                    }}
                  >
                    <p className="text-destructive text-xs font-semibold">
                      {allergy.substance}
                    </p>
                  </div>
                ))
            ) : (
              <div className="py-1 text-center">
                <CheckCircle className="mx-auto mb-1 h-4 w-4 text-green-500" />
                <p className="text-muted-foreground text-xs">None</p>
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div
            className="border-foreground overflow-hidden border-2 p-3"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <h3
              className="text-foreground mb-2 flex items-center text-sm font-black tracking-wide uppercase"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: "none",
              }}
            >
              <Pill className="mr-2 h-4 w-4 text-blue-500" />
              MEDICATIONS
            </h3>
            {medications.filter((med) => med.active).length > 0 ? (
              <div className="space-y-1">
                {medications
                  .filter((med) => med.active)
                  .slice(0, 3)
                  .map((medication, index) => (
                    <div
                      key={index}
                      className="border-foreground overflow-hidden border-2 bg-blue-100 p-1 dark:bg-blue-900"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                      }}
                    >
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                        {medication.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {medication.dosage}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-1 text-center">
                <p className="text-muted-foreground text-xs">None</p>
              </div>
            )}
          </div>

          {/* Critical Medical Conditions */}
          <div
            className="border-foreground overflow-hidden border-2 p-3"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <h3
              className="text-foreground mb-2 flex items-center text-sm font-black tracking-wide uppercase"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: "none",
              }}
            >
              <Activity className="mr-2 h-4 w-4 text-green-500" />
              CONDITIONS
            </h3>
            {medicalHistory.filter(
              (condition) =>
                condition.status === "active" || condition.status === "chronic",
            ).length > 0 ? (
              <div className="space-y-1">
                {medicalHistory
                  .filter(
                    (condition) =>
                      condition.status === "active" ||
                      condition.status === "chronic",
                  )
                  .slice(0, 2)
                  .map((condition, index) => (
                    <div
                      key={index}
                      className={`border-foreground overflow-hidden border-2 p-1 ${
                        condition.status === "active"
                          ? "bg-destructive/10"
                          : "bg-orange-100 dark:bg-orange-900"
                      }`}
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                      }}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          condition.status === "active"
                            ? "text-destructive"
                            : "text-orange-800 dark:text-orange-200"
                        }`}
                      >
                        {condition.condition}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-1 text-center">
                <CheckCircle className="mx-auto mb-1 h-4 w-4 text-green-500" />
                <p className="text-muted-foreground text-xs">None</p>
              </div>
            )}
          </div>

          {/* Advance Care Plans */}
          <div
            className="border-foreground overflow-hidden border-2 p-3"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            <h3
              className="text-foreground mb-2 flex items-center text-sm font-black tracking-wide uppercase"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: "none",
              }}
            >
              <Shield className="mr-2 h-4 w-4 text-purple-500" />
              CARE PLANS
            </h3>
            <div className="space-y-1">
              {advanceCarePlan.dnr && (
                <div
                  className="border-foreground bg-destructive/10 overflow-hidden border-2 p-1"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                  }}
                >
                  <p className="text-destructive text-xs font-semibold">DNR</p>
                </div>
              )}

              {advanceCarePlan.molst && (
                <div
                  className="border-foreground overflow-hidden border-2 bg-orange-100 p-1 dark:bg-orange-900"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                  }}
                >
                  <p className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                    MOLST
                  </p>
                </div>
              )}

              {!advanceCarePlan.dnr && !advanceCarePlan.molst && (
                <div className="py-1 text-center">
                  <CheckCircle className="mx-auto mb-1 h-4 w-4 text-green-500" />
                  <p className="text-muted-foreground text-xs">None</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Break-Glass Override Modal */}
      {showBreakGlassModal && (
        <div className="bg-opacity-50 bg-background fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-background border-foreground mx-4 w-full max-w-md rounded-lg border-2 p-6">
            <div className="mb-4 flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-foreground text-lg font-semibold">
                Break-Glass Override
              </h3>
            </div>
            <div className="space-y-4">
              <div className="border-foreground bg-background rounded-lg border-2 p-4">
                <p className="text-foreground mb-2 text-sm font-medium">
                  ⚠️ Emergency Access Required
                </p>
                <p className="text-muted-foreground text-xs">
                  This action will grant emergency access to patient data
                  without explicit consent. This access will be logged and
                  audited. Use only in life-critical situations.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={breakGlassUsername}
                    onChange={(e) => setBreakGlassUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Override</Label>
                  <Textarea
                    id="reason"
                    value={breakGlassReason}
                    onChange={(e) => setBreakGlassReason(e.target.value)}
                    placeholder="Describe the emergency situation requiring immediate access"
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleBreakGlassOverride}
                  className="bg-destructive hover:bg-destructive/90 flex-1"
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Grant Emergency Access
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBreakGlassModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
