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
import { env } from "@/env";

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
  const [dicomSeries, setDicomSeries] = useState<Array<{ 
    seriesName: string; 
    files: Array<{ name: string; url: string; file?: File }>;
    modality?: string;
  }>>([]);
  const [dicomUploading, setDicomUploading] = useState(false);
  const [zipProcessing, setZipProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '', startTime: 0 });
  const { theme } = useTheme();

  const handleDicomZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const zipFile = selectedFiles[0];
    if (!zipFile?.name.toLowerCase().endsWith('.zip')) {
      alert('Please select a ZIP file containing DICOM (.dcm) files');
      return;
    }

    setZipProcessing(true);
    setDicomUploading(true);
    
    try {
      // Basic file validation
      if (zipFile.size === 0) {
        throw new Error('ZIP file is empty (0 bytes)');
      }
      
      if (zipFile.size > 500 * 1024 * 1024) { // 500MB limit
        throw new Error('ZIP file is too large (>500MB). Please use a smaller file.');
      }
      
      console.log('Processing ZIP file:', zipFile.name, 'Size:', zipFile.size, 'bytes');
      
      // Import JSZip dynamically
      // @ts-expect-error - JSZip types will be available after install
      const JSZip = (await import('jszip')).default;
      
      if (!JSZip) {
        throw new Error('Failed to load ZIP processing library. Please refresh the page and try again.');
      }
      
      // Read and extract ZIP file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipFile);
      
      console.log('ZIP contents loaded, found files:', Object.keys(zipContents.files).length);
      
      // Log all files in the ZIP for debugging
      Object.keys(zipContents.files).forEach(path => {
        const file = zipContents.files[path];
        console.log(`ZIP entry: ${path}, isDir: ${(file as unknown as { dir: boolean }).dir}, size: ${(file as unknown as { _data?: { uncompressedSize: number } })._data?.uncompressedSize ?? 'unknown'}`);
      });
      
      // Find all DICOM files in the ZIP (including in nested folders)
      const dicomFiles: Array<{ name: string; data: Uint8Array; path: string }> = [];
      
      for (const [fullPath, file] of Object.entries(zipContents.files)) {
        const isDirectory = (file as unknown as { dir: boolean }).dir;
        const fileName = fullPath.split('/').pop() || fullPath;
        
        // Skip directories and hidden/system files
        if (isDirectory || fileName.startsWith('.') || fileName.startsWith('__MACOSX')) {
          console.log(`Skipping: ${fullPath} (directory: ${isDirectory})`);
          continue;
        }
        
        // More flexible DICOM file detection
        const isLikelyDicom = 
          fullPath.toLowerCase().endsWith('.dcm') ||
          fullPath.toLowerCase().endsWith('.dicom') ||
          fullPath.toLowerCase().includes('dicom') ||
          // Many DICOM files have no extension or numeric names
          /^\d+$/.test(fileName) || // Pure numbers like "1", "2", "3"
          /^IM-\d+-\d+/.test(fileName) || // IM-0001-0001 format
          /^[A-Z0-9]{8,}$/.test(fileName) || // Long alphanumeric names
          (!fileName.includes('.') && fileName.length > 3); // No extension, reasonable length
        
        if (isLikelyDicom) {
          console.log(`Processing potential DICOM: ${fullPath}`);
          try {
            const data = await (file as unknown as { async: (type: string) => Promise<Uint8Array> }).async('uint8array');
            
            // Basic DICOM validation - check for DICOM magic bytes
            const isDicom = data.length > 132 && 
              data[128] === 0x44 && data[129] === 0x49 && 
              data[130] === 0x43 && data[131] === 0x4D; // "DICM"
            
            if (isDicom || data.length > 1000) { // Accept if DICOM header found or reasonably large file
              dicomFiles.push({ 
                name: fileName, 
                data, 
                path: fullPath 
              });
              console.log(`✓ Added DICOM file: ${fileName} (${data.length} bytes)`);
            } else {
              console.log(`✗ Skipped non-DICOM file: ${fileName} (${data.length} bytes)`);
            }
          } catch (error) {
            console.error(`Error processing ${fullPath}:`, error);
          }
        } else {
          console.log(`Skipped unlikely DICOM: ${fullPath}`);
        }
      }
      
      // Sort DICOM files by name to maintain slice order
      dicomFiles.sort((a, b) => {
        // Extract numbers from filenames for proper numeric sorting
        const aMatch = /(\d+)/.exec(a.name);
        const bMatch = /(\d+)/.exec(b.name);
        const aNum = parseInt(aMatch?.[0] ?? '0');
        const bNum = parseInt(bMatch?.[0] ?? '0');
        return aNum - bNum;
      });
      
      if (dicomFiles.length === 0) {
        console.error('No DICOM files found in ZIP archive');
        alert(`No DICOM files found in the ZIP archive.\n\nFound ${Object.keys(zipContents.files).length} total files. Check the browser console for details about what was found in your ZIP file.\n\nDICOM files should:\n- Have .dcm or .dicom extensions, OR\n- Be files without extensions (common for DICOM), OR\n- Have numeric names like "1", "2", "3", etc.\n- Be larger than 1KB in size`);
        setZipProcessing(false);
        setDicomUploading(false);
        return;
      }
      
      console.log(`Found ${dicomFiles.length} DICOM files in ZIP`);
      setZipProcessing(false);
      
      // Determine series name from folder structure or ZIP filename
      let seriesName = zipFile.name.replace(/\.zip$/i, '');
      
      // If files are in a folder, use the folder name as series name
      if (dicomFiles.length > 0 && dicomFiles[0]!.path.includes('/')) {
        const folderPath = dicomFiles[0]!.path.split('/');
        if (folderPath.length > 1) {
          // Use the deepest folder name that contains the DICOM files
          seriesName = folderPath[folderPath.length - 2] ?? seriesName;
        }
      }
      
      seriesName = seriesName ?? 'DICOM Series';
      
      // Detect modality from first file or series name
      let modality = 'OTHER';
      const nameToCheck = (seriesName + ' ' + dicomFiles[0]?.name || '').toLowerCase();
      if (nameToCheck.includes('ct')) modality = 'CT';
      else if (nameToCheck.includes('mri')) modality = 'MRI';
      else if (nameToCheck.includes('xray') || nameToCheck.includes('x-ray')) modality = 'XRAY';
      else if (nameToCheck.includes('ultrasound')) modality = 'ULTRASOUND';
      
      // Upload each DICOM file to Cloudinary
      const uploadedFiles: Array<{ name: string; url: string }> = [];
      
      // Initialize progress
      setUploadProgress({ current: 0, total: dicomFiles.length, fileName: '', startTime: Date.now() });
      
      for (let i = 0; i < dicomFiles.length; i++) {
        const dicomFile = dicomFiles[i]!;
        
        // Update progress
        setUploadProgress(prev => ({ 
          current: i + 1, 
          total: dicomFiles.length, 
          fileName: dicomFile.name,
          startTime: prev.startTime
        }));
        
        console.log(`Uploading DICOM ${i + 1}/${dicomFiles.length}: ${dicomFile.name}`);
        
        // Create blob from DICOM data
        const blob = new Blob([dicomFile.data as BlobPart], { type: 'application/dicom' });
        
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', blob, dicomFile.name);
        formData.append('upload_preset', 'emr-upload');
        formData.append('resource_type', 'raw');
        
        try {
          const response = await fetch(`https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`, {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            uploadedFiles.push({
              name: dicomFile.name,
              url: result.secure_url
            });
            console.log(`Successfully uploaded ${dicomFile.name}`);
          } else {
            const errorText = await response.text();
            console.error(`Failed to upload ${dicomFile.name}:`, errorText);
          }
        } catch (error) {
          console.error(`Error uploading ${dicomFile.name}:`, error);
        }
      }
      
      if (uploadedFiles.length > 0) {
        // Add the series to state
        setDicomSeries(prev => [...prev, {
          seriesName,
          files: uploadedFiles,
          modality
        }]);
        
        console.log(`Successfully processed ZIP: ${uploadedFiles.length}/${dicomFiles.length} files uploaded`);
      }
      
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        zipFileName: zipFile?.name,
        zipFileSize: zipFile?.size,
      });
      
      let errorMessage = 'Error processing ZIP file.\n\n';
      
      if (error instanceof Error) {
        errorMessage += `Error: ${error.message}\n\n`;
        
        // Common error scenarios
        if (error.message.includes('Invalid or unsupported zip file')) {
          errorMessage += 'The file appears to be corrupted or not a valid ZIP file. Try:\n';
          errorMessage += '• Re-creating the ZIP file\n';
          errorMessage += '• Using a different ZIP compression tool\n';
          errorMessage += '• Checking if the file downloaded completely';
        } else if (error.message.includes('Cannot read properties')) {
          errorMessage += 'There was an issue reading the ZIP file contents. Try:\n';
          errorMessage += '• Using a standard ZIP format (not RAR, 7z, etc.)\n';
          errorMessage += '• Ensuring the ZIP file isn\'t password protected\n';
          errorMessage += '• Creating a new ZIP file with different software';
        } else if (error.message.includes('fetch')) {
          errorMessage += 'There was an issue uploading to cloud storage. Try:\n';
          errorMessage += '• Checking your internet connection\n';
          errorMessage += '• Trying with a smaller ZIP file first\n';
          errorMessage += '• Refreshing the page and trying again';
        } else {
          errorMessage += 'Please check the browser console for more details and try:\n';
          errorMessage += '• Using a different ZIP file\n';
          errorMessage += '• Refreshing the page\n';
          errorMessage += '• Creating a new ZIP with standard compression';
        }
      } else {
        errorMessage += 'Please check the browser console for details.';
      }
      
      alert(errorMessage);
    } finally {
      setZipProcessing(false);
      setDicomUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: '', startTime: 0 });
      // Reset the input
      event.target.value = '';
    }
  };

  const removeDicomSeries = (index: number) => {
    setDicomSeries(prev => {
      const newSeries = [...prev];
      newSeries.splice(index, 1);
      return newSeries;
    });
  };

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
    // Add DICOM files to patient data
    const payloadWithDicom = {
      ...patientData,
      dicomSeries: (dicomSeries || []).map(series => ({
        seriesName: series.seriesName,
        modality: series.modality,
        files: series.files.map(file => ({
          name: file.name,
          url: file.url
        }))
      }))
    };
    
    const payload = JSON.stringify(payloadWithDicom);
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

                {/* DICOM ZIP Upload Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dicom-zip-upload" className="text-sm font-medium">
                      DICOM Series (ZIP file containing DCM slices)
                    </Label>
                    <Input
                      id="dicom-zip-upload"
                      type="file"
                      accept=".zip"
                      onChange={handleDicomZipUpload}
                      disabled={dicomUploading}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a ZIP file containing DICOM slices. Files can be:
                      <br />• .dcm or .dicom files
                      <br />• Files without extensions (common for DICOM)  
                      <br />• Numeric names like "1", "2", "3" etc.
                      <br />• Any files larger than 1KB that contain DICOM data
                    </p>
                    {zipProcessing && (
                      <p className="text-sm text-orange-600 mt-2">
                        📦 Extracting DICOM files from ZIP archive...
                      </p>
                    )}
                    {dicomUploading && !zipProcessing && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-blue-600">
                          ☁️ Uploading DICOM files to cloud storage...
                        </p>
                        {uploadProgress.total > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Progress: {uploadProgress.current} of {uploadProgress.total}</span>
                              <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs">
                              {uploadProgress.fileName && (
                                <p className="text-gray-500 truncate flex-1 mr-2">
                                  Uploading: {uploadProgress.fileName}
                                </p>
                              )}
                              {uploadProgress.current > 0 && uploadProgress.startTime > 0 && (
                                <p className="text-gray-400 whitespace-nowrap">
                                  {(() => {
                                    const elapsed = (Date.now() - uploadProgress.startTime) / 1000;
                                    const rate = uploadProgress.current / elapsed;
                                    const remaining = (uploadProgress.total - uploadProgress.current) / rate;
                                    return remaining > 60 
                                      ? `~${Math.ceil(remaining / 60)}m left` 
                                      : `~${Math.ceil(remaining)}s left`;
                                  })()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {dicomSeries.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        DICOM Series ({dicomSeries.length}):
                      </Label>
                      <div className="max-h-48 space-y-3 overflow-y-auto">
                        {dicomSeries.map((series, index) => (
                          <div
                            key={index}
                            className="rounded-lg border p-4 bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{series.seriesName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                    {series.modality}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {series.files.length} slice{series.files.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDicomSeries(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Files: {series.files.slice(0, 3).map(f => f.name).join(', ')}
                              {series.files.length > 3 && ` ... +${series.files.length - 3} more`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

