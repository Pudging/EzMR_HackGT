"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SkeletonBodyModel } from "@/components/patient/skeleton-body-model";
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

  // Submit current issue to history
  const submitCurrentIssue = async () => {
    if (!currentIssue.trim() || !selectedPatient) return;

    setIsSubmitting(true);

    // Trigger analysis for 3D highlighting
    setSearchText(currentIssue);
    void analyzeInjury();

    try {
      // Add to local history immediately
      const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      const newEntry = { timestamp, note: currentIssue.trim() };
      setHistory((prev) => [newEntry, ...prev]);

      // Save to API
      const response = await fetch(
        `/api/patients/${selectedPatient.patientId}/assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_issue: currentIssue.trim(),
            timestamp: new Date().toISOString(),
          }),
        },
      );

      if (response.ok) {
        setCurrentIssue(""); // Clear input
      } else {
        console.error("Failed to save current issue");
        // Remove from local history if API failed
        setHistory((prev) => prev.slice(1));
      }
    } catch (error) {
      console.error("Error saving current issue:", error);
      // Remove from local history if API failed
      setHistory((prev) => prev.slice(1));
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
        <Card className="mx-4 max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <CardTitle>No Patient Selected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
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
                  className="border-red-300 text-red-600 hover:bg-red-50"
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Break-Glass Override Banner */}
        {breakGlassOverride && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">
                    Break-Glass Override Active
                  </h3>
                  <p className="text-sm text-red-700">
                    Emergency access granted to {auditLog[0]?.username} -{" "}
                    {auditLog[0]?.reason}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetBreakGlassOverride}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Lock className="mr-2 h-4 w-4" />
                End Override
              </Button>
            </div>
          </div>
        )}

        {/* Patient Demographics */}
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <User className="text-primary h-5 w-5" />
              <span>Patient Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side - Dashboard Panel */}
          <div className="space-y-6">
            {/* Severe Allergies - Most Critical */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  <span>Severe Allergies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {allergies.filter((allergy) => allergy.severity === "severe")
                  .length > 0 ? (
                  <div className="space-y-3">
                    {allergies
                      .filter((allergy) => allergy.severity === "severe")
                      .map((allergy, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-red-200 bg-red-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-red-800">
                                {allergy.substance}
                              </p>
                              <p className="text-xs text-red-600">
                                {allergy.reaction}
                              </p>
                            </div>
                            <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                              SEVERE
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="text-muted-foreground text-sm">
                      No severe allergies
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Update Textbox - Second Most Important */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Stethoscope className="text-primary h-5 w-5" />
                  <span>Patient Status Update</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter patient status, symptoms, or observations for hospital records..."
                    value={currentIssue}
                    onChange={(e) => {
                      setCurrentIssue(e.target.value);
                      // Auto-analyze injury when typing (like the Injury Analysis textbox)
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
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        onClick={submitCurrentIssue}
                        disabled={!currentIssue.trim() || isSubmitting}
                        className="px-6"
                      >
                        {isSubmitting
                          ? "Transmitting to hospital..."
                          : "Send Status Update"}
                      </Button>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {currentIssue.length} characters
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-500" />
                  <span>Current Medications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {medications.filter((med) => med.active).length > 0 ? (
                  <div className="space-y-3">
                    {medications
                      .filter((med) => med.active)
                      .map((medication, index) => (
                        <div
                          key={index}
                          className="rounded-lg border bg-blue-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {medication.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {medication.dosage} - {medication.frequency}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground text-xs">
                                Last taken:
                              </p>
                              <p className="text-xs font-medium">
                                {medication.lastTaken}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      No current medications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Medical Conditions */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span>Critical Medical Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {medicalHistory.filter(
                  (condition) =>
                    condition.status === "active" ||
                    condition.status === "chronic",
                ).length > 0 ? (
                  <div className="space-y-3">
                    {medicalHistory
                      .filter(
                        (condition) =>
                          condition.status === "active" ||
                          condition.status === "chronic",
                      )
                      .map((condition, index) => (
                        <div
                          key={index}
                          className={`rounded-lg border p-3 ${
                            condition.status === "active"
                              ? "border-red-200 bg-red-50"
                              : "border-orange-200 bg-orange-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {condition.condition}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {condition.notes}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${
                                  condition.status === "active"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {condition.status.toUpperCase()}
                              </span>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {condition.diagnosisDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="text-muted-foreground text-sm">
                      No critical conditions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advance Care Plans */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span>Advance Care Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {advanceCarePlan.dnr && (
                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-semibold">
                            DNR (Do Not Resuscitate)
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Effective: {advanceCarePlan.dnrDate}
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        ACTIVE
                      </span>
                    </div>
                  )}

                  {advanceCarePlan.molst && (
                    <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-semibold">
                            MOLST (Medical Orders for Life-Sustaining Treatment)
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Effective: {advanceCarePlan.molstDate}
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                        ACTIVE
                      </span>
                    </div>
                  )}

                  {advanceCarePlan.notes && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Notes:
                      </p>
                      <p className="text-xs">{advanceCarePlan.notes}</p>
                    </div>
                  )}

                  {!advanceCarePlan.dnr && !advanceCarePlan.molst && (
                    <div className="py-4 text-center">
                      <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                      <p className="text-muted-foreground text-sm">
                        No active advance care plans
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Medical Imaging */}
          <div>
            <Card className="h-[600px]">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Stethoscope className="text-primary h-5 w-5" />
                  <span>Medical Imaging</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <SkeletonBodyModel
                  selectedBodyPart={null}
                  onBodyPartSelect={() => {
                    void 0;
                  }}
                  patientData={{}}
                  skeletonFile={skeletonFile}
                  analysisText={currentIssue}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status History */}
        <Card className="mt-6">
          <CardHeader className="border-b">
            <CardTitle className="text-card-foreground flex items-center space-x-2">
              <Clock className="text-primary h-5 w-5" />
              <span>Status History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-48 space-y-3 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <p className="text-sm">No status updates recorded yet</p>
                  <p className="mt-1 text-xs">
                    Send status updates to build history
                  </p>
                </div>
              ) : (
                history.map((entry, index) => (
                  <div
                    key={index}
                    className="border-primary border-l-2 py-2 pl-3"
                  >
                    <div className="text-muted-foreground font-mono text-xs">
                      [{entry.timestamp}]
                    </div>
                    <div className="mt-1 text-sm">{entry.note}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Break-Glass Override Modal */}
      {showBreakGlassModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800">
                Break-Glass Override
              </h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-sm font-medium text-red-800">
                  ⚠️ Emergency Access Required
                </p>
                <p className="text-xs text-red-700">
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
                  className="flex-1 bg-red-600 hover:bg-red-700"
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
