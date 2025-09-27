"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Heart,
  Shield,
  Calendar,
  Upload,
  Plus,
  FileText,
  Activity,
  X,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { VoiceToText } from "@/components/ui/voice-to-text";
import { SmartNotesParser } from "@/components/ui/smart-notes-parser";
import { saveEmr, type SaveEmrResult } from "./actions";
import { CldUploadButton } from "next-cloudinary";
import type { CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useTheme } from "next-themes";

interface PatientData {
  // Demographics
  name: string;
  dob: string;
  sex: string;
  address: string;
  phone: string;
  insurance: string;
  emergencyContact: string;
  patientId: string;

  // Vitals
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
    bmi: string;
    bloodType: string;
  };

  // Medications
  medications: Array<{
    name: string;
    dosage: string;
    schedule: string;
  }>;

  // Medical History
  socialHistory: {
    smoking: string;
    drugs: string;
    alcohol: string;
  };
  pastConditions: Array<{
    date: string;
    bodyPart: string;
    notes: string;
  }>;
  immunizations: Array<{
    date: string;
    notes: string;
  }>;
  familyHistory: Array<{
    date: string;
    bodyPart: string;
    notes: string;
  }>;
  allergies: string;
  generalNotes: string;

  // Care Plans
  dnr: boolean;
  preventiveCare: string;

  // File Uploads
  uploadedFiles: string[];
}

export default function EMRUploadPage() {
  const [smartNotes, setSmartNotes] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [saveResult, setSaveResult] = useState<SaveEmrResult | null>(null);
  const { theme } = useTheme();

  // Cloudinary styles for light and dark mode
  const cloudinaryDarkStyles = {
    palette: {
      window: "#0f172a",
      sourceBg: "#1e293b",
      windowBorder: "#9ca3af",
      tabIcon: "#FFFFFF",
      inactiveTabIcon: "#8E9FBF",
      menuIcons: "#FFFFFF",
      link: "#08C0FF",
      action: "#336BFF",
      inProgress: "#00BFFF",
      complete: "#33ff00",
      error: "#EA2727",
      textDark: "#000000",
      textLight: "#FFFFFF",
    },
  };

  const cloudinaryLightStyles = {
    palette: {
      window: "#ffffff",
      sourceBg: "#f8fafc",
      windowBorder: "#e2e8f0",
      tabIcon: "#1e293b",
      inactiveTabIcon: "#64748b",
      menuIcons: "#1e293b",
      link: "#2563eb",
      action: "#3b82f6",
      inProgress: "#0ea5e9",
      complete: "#22c55e",
      error: "#ef4444",
      textDark: "#ffffff",
      textLight: "#1e293b",
    },
  };

  const currentCloudinaryStyles =
    theme === "dark" ? cloudinaryDarkStyles : cloudinaryLightStyles;

  // Helper function to get file info and preview
  const getFileInfo = (fileUrl: string) => {
    const filename = fileUrl.split("/").pop() ?? "Unknown File";
    const extension = filename.includes(".")
      ? filename.split(".").pop()?.toLowerCase()
      : "";

    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
      extension ?? "",
    );
    const isPdf = extension === "pdf";
    const isDoc = ["doc", "docx"].includes(extension ?? "");

    return {
      filename,
      extension,
      isImage,
      isPdf,
      isDoc,
      displayName: filename.includes(".")
        ? filename.substring(0, filename.lastIndexOf("."))
        : filename,
    };
  };

  const [patientData, setPatientData] = useState<PatientData>({
    name: "",
    dob: "",
    sex: "",
    address: "",
    phone: "",
    insurance: "",
    emergencyContact: "",
    patientId: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      bmi: "",
      bloodType: "",
    },
    medications: [],
    socialHistory: {
      smoking: "",
      drugs: "",
      alcohol: "",
    },
    pastConditions: [],
    immunizations: [],
    familyHistory: [],
    allergies: "",
    generalNotes: "",
    dnr: false,
    preventiveCare: "",
    uploadedFiles: [],
  });

  // State for adding new items
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    schedule: "",
  });
  const [newCondition, setNewCondition] = useState({
    date: "",
    bodyPart: "",
    notes: "",
  });
  const [newImmunization, setNewImmunization] = useState({
    date: "",
    notes: "",
  });
  const [newFamilyHistory, setNewFamilyHistory] = useState({
    date: "",
    bodyPart: "",
    notes: "",
  });

  // Add functions
  const addMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.schedule) {
      setPatientData((prev) => ({
        ...prev,
        medications: [...prev.medications, newMedication],
      }));
      setNewMedication({ name: "", dosage: "", schedule: "" });
    }
  };

  const addCondition = () => {
    if (newCondition.date && newCondition.notes) {
      setPatientData((prev) => ({
        ...prev,
        pastConditions: [...prev.pastConditions, newCondition],
      }));
      setNewCondition({ date: "", bodyPart: "", notes: "" });
    }
  };

  const addImmunization = () => {
    if (newImmunization.date && newImmunization.notes) {
      setPatientData((prev) => ({
        ...prev,
        immunizations: [...prev.immunizations, newImmunization],
      }));
      setNewImmunization({ date: "", notes: "" });
    }
  };

  const addFamilyHistory = () => {
    if (
      newFamilyHistory.date &&
      newFamilyHistory.bodyPart &&
      newFamilyHistory.notes
    ) {
      setPatientData((prev) => ({
        ...prev,
        familyHistory: [...prev.familyHistory, newFamilyHistory],
      }));
      setNewFamilyHistory({ date: "", bodyPart: "", notes: "" });
    }
  };

  // Handle AI-extracted data from Mastra agent
  const handleExtractedData = (extractedData: {
    demographics?: Record<string, string>;
    vitals?: Record<string, string>;
    medications?: Array<{ name: string; dosage?: string; schedule?: string }>;
    socialHistory?: Record<string, string>;
    pastConditions?: Array<{ date?: string; bodyPart?: string; notes: string }>;
    immunizations?: Array<{ date?: string; notes: string }>;
    familyHistory?: Array<{ date?: string; bodyPart?: string; notes: string }>;
    allergies?: string;
    generalNotes?: string;
    preventiveCare?: string;
    dnr?: boolean;
  }) => {
    setPatientData((prev) => {
      const updated = { ...prev };

      // Merge demographics
      if (extractedData.demographics) {
        Object.entries(extractedData.demographics).forEach(([key, value]) => {
          if (value && typeof value === "string") {
            (updated as Record<string, unknown>)[key] = value;
          }
        });
      }

      // Merge vitals
      if (extractedData.vitals) {
        updated.vitals = {
          ...updated.vitals,
          ...Object.fromEntries(
            Object.entries(extractedData.vitals).map(([key, value]) => [
              key,
              value ?? "",
            ]),
          ),
        };
      }

      // Add medications
      if (
        extractedData.medications &&
        Array.isArray(extractedData.medications)
      ) {
        const normalizedMedications = extractedData.medications.map((med) => ({
          name: med.name,
          dosage: med.dosage ?? "",
          schedule: med.schedule ?? "",
        }));
        updated.medications = [
          ...updated.medications,
          ...normalizedMedications,
        ];
      }

      // Merge social history
      if (extractedData.socialHistory) {
        updated.socialHistory = {
          ...updated.socialHistory,
          ...Object.fromEntries(
            Object.entries(extractedData.socialHistory).map(([key, value]) => [
              key,
              value ?? "",
            ]),
          ),
        };
      }

      // Add conditions
      if (
        extractedData.pastConditions &&
        Array.isArray(extractedData.pastConditions)
      ) {
        const normalizedConditions = extractedData.pastConditions.map(
          (condition) => ({
            date: condition.date ?? "",
            bodyPart: condition.bodyPart ?? "",
            notes: condition.notes,
          }),
        );
        updated.pastConditions = [
          ...updated.pastConditions,
          ...normalizedConditions,
        ];
      }

      // Add immunizations
      if (
        extractedData.immunizations &&
        Array.isArray(extractedData.immunizations)
      ) {
        const normalizedImmunizations = extractedData.immunizations.map(
          (immunization) => ({
            date: immunization.date ?? "",
            notes: immunization.notes,
          }),
        );
        updated.immunizations = [
          ...updated.immunizations,
          ...normalizedImmunizations,
        ];
      }

      // Add family history
      if (
        extractedData.familyHistory &&
        Array.isArray(extractedData.familyHistory)
      ) {
        const normalizedFamilyHistory = extractedData.familyHistory.map(
          (history) => ({
            date: history.date ?? "",
            bodyPart: history.bodyPart ?? "",
            notes: history.notes,
          }),
        );
        updated.familyHistory = [
          ...updated.familyHistory,
          ...normalizedFamilyHistory,
        ];
      }

      // Update other fields
      if (extractedData.allergies) {
        updated.allergies = updated.allergies
          ? updated.allergies + "\n" + extractedData.allergies
          : extractedData.allergies;
      }

      if (extractedData.generalNotes) {
        updated.generalNotes = updated.generalNotes
          ? updated.generalNotes + "\n" + extractedData.generalNotes
          : extractedData.generalNotes;
      }

      if (extractedData.preventiveCare) {
        updated.preventiveCare = updated.preventiveCare
          ? updated.preventiveCare + "\n" + extractedData.preventiveCare
          : extractedData.preventiveCare;
      }

      if (typeof extractedData.dnr === "boolean") {
        updated.dnr = extractedData.dnr;
      }

      return updated;
    });

    // Clear the smart notes after successful extraction
    setSmartNotes("");
  };

  async function onSaveAction(formData: FormData) {
    const payload = JSON.stringify(patientData);
    formData.set("payload", payload);
    const result = await saveEmr({ ok: true }, formData);
    setSaveResult(result);
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <header className="bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <FileText className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-semibold">
                  EMR Upload
                </h1>
                <p className="text-muted-foreground text-sm">
                  Electronic Medical Records
                </p>
              </div>
            </div>
            <form action={(fd) => startSaving(() => onSaveAction(fd))}>
              <input type="hidden" name="payload" value="" readOnly />
              <Button type="submit" disabled={isSaving}>
                <Upload className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save EMR"}
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side - Demographics & Vital Info */}
          <div className="space-y-6 overflow-y-auto">
            {/* Demographics */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <User className="text-primary h-5 w-5" />
                  <span>Patient Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={patientData.name}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Patient full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={patientData.dob}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          dob: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sex</Label>
                    <select
                      value={patientData.sex || ""}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          sex: e.target.value,
                        }))
                      }
                      className="bg-background border-input text-foreground w-full rounded-md border px-3 py-2"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Patient ID / MRN</Label>
                    <Input
                      value={patientData.patientId}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          patientId: e.target.value,
                        }))
                      }
                      placeholder="Medical Record Number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={patientData.address}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="h-20 resize-none"
                    placeholder="Full address..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={patientData.phone}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Info</Label>
                    <Input
                      value={patientData.insurance}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          insurance: e.target.value,
                        }))
                      }
                      placeholder="Policy numbers, provider..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input
                    value={patientData.emergencyContact}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    placeholder="Name, relation, phone number..."
                  />
                </div>
              </CardContent>
            </Card>
            {saveResult ? (
              <div
                className={`rounded-md border p-3 ${
                  saveResult.ok
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
                    : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                }`}
              >
                {saveResult.ok ? "EMR saved" : saveResult.error}
              </div>
            ) : null}

            {/* Vital Signs */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Activity className="text-primary h-5 w-5" />
                  <span>Vital Signs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Blood Pressure</Label>
                    <Input
                      value={patientData.vitals.bloodPressure}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: {
                            ...prev.vitals,
                            bloodPressure: e.target.value,
                          },
                        }))
                      }
                      placeholder="120/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heart Rate</Label>
                    <Input
                      value={patientData.vitals.heartRate}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, heartRate: e.target.value },
                        }))
                      }
                      placeholder="72 bpm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input
                      value={patientData.vitals.temperature}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: {
                            ...prev.vitals,
                            temperature: e.target.value,
                          },
                        }))
                      }
                      placeholder="98.6°F"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      value={patientData.vitals.weight}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, weight: e.target.value },
                        }))
                      }
                      placeholder="70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (m)</Label>
                    <Input
                      value={patientData.vitals.height}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, height: e.target.value },
                        }))
                      }
                      placeholder="1.75"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BMI</Label>
                    <Input
                      value={patientData.vitals.bmi}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, bmi: e.target.value },
                        }))
                      }
                      placeholder="22.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <select
                      value={patientData.vitals.bloodType || ""}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, bloodType: e.target.value },
                        }))
                      }
                      className="bg-background border-input text-foreground w-full rounded-md border px-3 py-2"
                    >
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Shield className="text-primary h-5 w-5" />
                  <span>Medications & Prescriptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Input
                    value={newMedication.name}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Medication name"
                  />
                  <Input
                    value={newMedication.dosage}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        dosage: e.target.value,
                      }))
                    }
                    placeholder="Dosage (10mg)"
                  />
                  <Input
                    value={newMedication.schedule}
                    onChange={(e) =>
                      setNewMedication((prev) => ({
                        ...prev,
                        schedule: e.target.value,
                      }))
                    }
                    placeholder="Schedule (2x daily)"
                  />
                  <Button onClick={addMedication}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {patientData.medications.map((medication, index) => (
                    <div key={index} className="bg-muted rounded-lg border p-3">
                      <div className="text-foreground font-semibold">
                        {medication.name}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <span className="text-primary">
                          {medication.dosage}
                        </span>{" "}
                        -
                        <span className="text-primary ml-1">
                          {medication.schedule}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Care Plans */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Calendar className="text-primary h-5 w-5" />
                  <span>Care Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={patientData.dnr}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        dnr: e.target.checked,
                      }))
                    }
                    className="text-primary bg-background border-input h-5 w-5 rounded"
                  />
                  <Label className="text-lg">DNR (Do Not Resuscitate)</Label>
                </div>
                <div>
                  <Label>Preventive Care</Label>
                  <Textarea
                    value={patientData.preventiveCare}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        preventiveCare: e.target.value,
                      }))
                    }
                    className="h-24 resize-none"
                    placeholder="Preventive care plans, screenings, follow-ups..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Upload className="text-primary h-5 w-5" />
                  <span>Lab Work & File Uploads</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="border-muted-foreground/25 hover:border-primary rounded-lg border-2 border-dashed p-8 text-center transition-colors">
                  <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <div className="text-foreground mb-2">Upload Lab Results</div>
                  <div className="text-muted-foreground text-sm">
                    Bloodwork, X-rays, Genetic tests, Medical documents
                  </div>
                  <CldUploadButton
                    className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring mt-4 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    uploadPreset="emr-upload"
                    options={{
                      sources: ["local", "camera"],
                      multiple: true,
                      maxFiles: 10,
                      maxFileSize: 10000000, // 10MB
                      resourceType: "auto",
                      clientAllowedFormats: [
                        "jpg",
                        "jpeg",
                        "png",
                        "pdf",
                        "doc",
                        "docx",
                      ],
                      styles: currentCloudinaryStyles,
                    }}
                    onSuccess={(results) => {
                      if (!results.info || typeof results.info === "string")
                        return;
                      const secureUrl =
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        (results.info as CloudinaryUploadWidgetInfo).secure_url;
                      setPatientData((prev) => ({
                        ...prev,
                        uploadedFiles: [...prev.uploadedFiles, secureUrl],
                      }));
                    }}
                  >
                    Choose Files
                  </CldUploadButton>
                </div>

                {/* Display uploaded files */}
                {patientData.uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">
                      Uploaded Files:
                    </Label>
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {patientData.uploadedFiles.map((fileUrl, index) => {
                        const fileInfo = getFileInfo(fileUrl);
                        return (
                          <div
                            key={index}
                            className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg border p-3 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              {/* File Preview */}
                              <div className="flex-shrink-0">
                                {fileInfo.isImage ? (
                                  <div className="bg-background relative h-12 w-12 overflow-hidden rounded border">
                                    <img
                                      src={fileUrl}
                                      alt={fileInfo.filename}
                                      className="h-full w-full object-cover transition-opacity duration-200"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const fallback =
                                          target.nextElementSibling as HTMLElement;
                                        if (fallback)
                                          fallback.style.display = "flex";
                                      }}
                                      onLoad={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.opacity = "1";
                                      }}
                                      style={{ opacity: 0 }}
                                    />
                                    <div
                                      className="bg-muted absolute inset-0 hidden items-center justify-center"
                                      style={{ display: "none" }}
                                    >
                                      <ImageIcon className="text-muted-foreground h-6 w-6" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-background flex h-12 w-12 items-center justify-center rounded border">
                                    {fileInfo.isPdf ? (
                                      <FileText className="h-6 w-6 text-red-500" />
                                    ) : fileInfo.isDoc ? (
                                      <File className="h-6 w-6 text-blue-500" />
                                    ) : (
                                      <File className="text-muted-foreground h-6 w-6" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* File Info */}
                              <div className="min-w-0 flex-1">
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary block text-sm font-medium hover:underline"
                                  title={fileInfo.filename} // Tooltip showing full filename
                                >
                                  {fileInfo.displayName.length > 25
                                    ? fileInfo.displayName.slice(0, 25) + "..."
                                    : fileInfo.displayName}
                                </a>
                                <p className="text-muted-foreground text-xs">
                                  {fileInfo.extension?.toUpperCase()} file
                                  {fileInfo.isImage && " • Image"}
                                  {fileInfo.isPdf && " • Document"}
                                  {fileInfo.isDoc && " • Document"}
                                </p>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPatientData((prev) => ({
                                  ...prev,
                                  uploadedFiles: prev.uploadedFiles.filter(
                                    (_, i) => i !== index,
                                  ),
                                }));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Medical History & Notes */}
          <div className="space-y-6 overflow-y-auto">
            {/* Generic Notes for Auto-filling (Future Feature) */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <FileText className="text-primary h-5 w-5" />
                  <span>Smart Notes (Auto-fill Ready)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="bg-muted mb-4 rounded-lg border p-4">
                  <div className="text-primary mb-2 text-sm font-semibold">
                    💡 AI-Powered Feature
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Type, paste, or use voice input to add raw medical notes
                    here. The system will automatically parse and categorize
                    this information into the appropriate sections below.
                  </div>
                </div>
                <Textarea
                  value={smartNotes}
                  onChange={(e) => setSmartNotes(e.target.value)}
                  className="h-40 resize-none"
                  placeholder="Type, paste, or use voice input to add medical notes, discharge summaries, or doctor's notes here. AI will automatically categorize this information into the appropriate sections below..."
                />

                {/* Voice to Text Integration */}
                <VoiceToText
                  onTranscriptUpdate={(newTranscript) => {
                    setSmartNotes((prev) => {
                      // Only append NEW transcript content, not replace entire content
                      if (newTranscript.trim()) {
                        return prev
                          ? prev + " " + newTranscript
                          : newTranscript;
                      }
                      return prev;
                    });
                  }}
                  className="mt-4"
                />

                {/* AI-Powered Smart Notes Parser */}
                <SmartNotesParser
                  notes={smartNotes}
                  onDataExtracted={handleExtractedData}
                />

                {smartNotes && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setSmartNotes("")}
                      variant="outline"
                      size="sm"
                    >
                      Clear Notes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical History Section */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Heart className="text-primary h-5 w-5" />
                  <span>Medical History & Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Social History */}
                <div className="space-y-4">
                  <h3 className="text-foreground border-border border-b pb-2 text-lg font-semibold">
                    Social History
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Smoking</Label>
                      <Textarea
                        value={patientData.socialHistory.smoking}
                        onChange={(e) =>
                          setPatientData((prev) => ({
                            ...prev,
                            socialHistory: {
                              ...prev.socialHistory,
                              smoking: e.target.value,
                            },
                          }))
                        }
                        className="h-20 resize-none"
                        placeholder="Smoking history..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Drugs</Label>
                      <Textarea
                        value={patientData.socialHistory.drugs}
                        onChange={(e) =>
                          setPatientData((prev) => ({
                            ...prev,
                            socialHistory: {
                              ...prev.socialHistory,
                              drugs: e.target.value,
                            },
                          }))
                        }
                        className="h-20 resize-none"
                        placeholder="Drug history..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alcohol</Label>
                      <Textarea
                        value={patientData.socialHistory.alcohol}
                        onChange={(e) =>
                          setPatientData((prev) => ({
                            ...prev,
                            socialHistory: {
                              ...prev.socialHistory,
                              alcohol: e.target.value,
                            },
                          }))
                        }
                        className="h-20 resize-none"
                        placeholder="Alcohol history..."
                      />
                    </div>
                  </div>
                </div>

                {/* Past Conditions */}
                <div className="space-y-4">
                  <h3 className="text-foreground border-border border-b pb-2 text-lg font-semibold">
                    Past Injuries & Conditions
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <Input
                      type="date"
                      value={newCondition.date}
                      onChange={(e) =>
                        setNewCondition((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                    <Input
                      value={newCondition.bodyPart}
                      onChange={(e) =>
                        setNewCondition((prev) => ({
                          ...prev,
                          bodyPart: e.target.value,
                        }))
                      }
                      placeholder="Body part (Head, Other, etc.)"
                    />
                    <Input
                      value={newCondition.notes}
                      onChange={(e) =>
                        setNewCondition((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Condition notes..."
                    />
                    <Button onClick={addCondition}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {patientData.pastConditions.map((condition, index) => (
                      <div
                        key={index}
                        className="bg-muted rounded-lg border p-3"
                      >
                        <div className="text-muted-foreground text-sm">
                          <span className="text-primary font-semibold">
                            {condition.date}
                          </span>{" "}
                          -
                          <span className="text-primary ml-1 font-semibold">
                            {condition.bodyPart || "Other"}
                          </span>
                        </div>
                        <div className="text-foreground mt-1 text-sm">
                          {condition.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immunizations */}
                <div className="space-y-4">
                  <h3 className="text-foreground border-border border-b pb-2 text-lg font-semibold">
                    Immunization History
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Input
                      type="date"
                      value={newImmunization.date}
                      onChange={(e) =>
                        setNewImmunization((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                    <Input
                      value={newImmunization.notes}
                      onChange={(e) =>
                        setNewImmunization((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Vaccination details..."
                    />
                    <Button onClick={addImmunization}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {patientData.immunizations.map((immunization, index) => (
                      <div
                        key={index}
                        className="bg-muted rounded-lg border p-3"
                      >
                        <div className="text-muted-foreground text-sm">
                          <span className="text-primary font-semibold">
                            {immunization.date}
                          </span>{" "}
                          -
                          <span className="text-primary ml-1 font-semibold">
                            Vaccination
                          </span>
                        </div>
                        <div className="text-foreground mt-1 text-sm">
                          {immunization.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Family History */}
                <div className="space-y-4">
                  <h3 className="text-foreground border-border border-b pb-2 text-lg font-semibold">
                    Family Medical History
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <Input
                      type="date"
                      value={newFamilyHistory.date}
                      onChange={(e) =>
                        setNewFamilyHistory((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />
                    <Input
                      value={newFamilyHistory.bodyPart}
                      onChange={(e) =>
                        setNewFamilyHistory((prev) => ({
                          ...prev,
                          bodyPart: e.target.value,
                        }))
                      }
                      placeholder="Relation (Mother, Father, etc.)"
                    />
                    <Input
                      value={newFamilyHistory.notes}
                      onChange={(e) =>
                        setNewFamilyHistory((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Family medical history..."
                    />
                    <Button onClick={addFamilyHistory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {patientData.familyHistory.map((history, index) => (
                      <div
                        key={index}
                        className="bg-muted rounded-lg border p-3"
                      >
                        <div className="text-muted-foreground text-sm">
                          <span className="text-primary font-semibold">
                            {history.date}
                          </span>{" "}
                          -
                          <span className="text-primary ml-1 font-semibold">
                            {history.bodyPart}
                          </span>
                        </div>
                        <div className="text-foreground mt-1 text-sm">
                          {history.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-4">
                  <h3 className="text-foreground border-border border-b pb-2 text-lg font-semibold">
                    Allergies
                  </h3>
                  <div className="space-y-2">
                    <Textarea
                      value={patientData.allergies}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          allergies: e.target.value,
                        }))
                      }
                      className="h-24 resize-none"
                      placeholder="List all known allergies, reactions, and severity..."
                    />
                  </div>
                </div>

                {/* General Notes */}
                <div className="space-y-4">
                  <h3 className="text-foreground border-border border-b pb-2 text-lg font-semibold">
                    General Notes
                  </h3>
                  <div className="space-y-2">
                    <Textarea
                      value={patientData.generalNotes}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          generalNotes: e.target.value,
                        }))
                      }
                      className="h-32 resize-none"
                      placeholder="General progress notes, observations, care instructions..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
