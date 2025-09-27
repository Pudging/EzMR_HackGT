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
  Search,
  MapPin,
  Clock,
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
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
  const [dicomSeries, setDicomSeries] = useState<
    Array<{
      seriesName: string;
      files: Array<{ name: string; url: string; file?: File }>;
      modality?: string;
    }>
  >([]);
  const [dicomUploading, setDicomUploading] = useState(false);
  const [zipProcessing, setZipProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    fileName: "",
    startTime: 0,
  });
  const { theme } = useTheme();

  const handleDicomZipUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const zipFile = selectedFiles[0];
    if (!zipFile?.name.toLowerCase().endsWith(".zip")) {
      alert("Please select a ZIP file containing DICOM (.dcm) files");
      return;
    }

    setZipProcessing(true);
    setDicomUploading(true);

    try {
      // Basic file validation
      if (zipFile.size === 0) {
        throw new Error("ZIP file is empty (0 bytes)");
      }

      if (zipFile.size > 500 * 1024 * 1024) {
        // 500MB limit
        throw new Error(
          "ZIP file is too large (>500MB). Please use a smaller file.",
        );
      }

      console.log(
        "Processing ZIP file:",
        zipFile.name,
        "Size:",
        zipFile.size,
        "bytes",
      );

      // Import JSZip dynamically
      const JSZip = (await import("jszip")).default;

      if (!JSZip) {
        throw new Error(
          "Failed to load ZIP processing library. Please refresh the page and try again.",
        );
      }

      // Read and extract ZIP file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipFile);

      console.log(
        "ZIP contents loaded, found files:",
        Object.keys(zipContents.files).length,
      );

      // Log all files in the ZIP for debugging
      Object.keys(zipContents.files).forEach((path) => {
        const file = zipContents.files[path];
        console.log(
          `ZIP entry: ${path}, isDir: ${(file as unknown as { dir: boolean }).dir}, size: ${(file as unknown as { _data?: { uncompressedSize: number } })._data?.uncompressedSize ?? "unknown"}`,
        );
      });

      // Find all DICOM files in the ZIP (including in nested folders)
      const dicomFiles: Array<{
        name: string;
        data: Uint8Array;
        path: string;
      }> = [];

      for (const [fullPath, file] of Object.entries(zipContents.files)) {
        const isDirectory = (file as { dir: boolean }).dir;
        const fileName = fullPath.split("/").pop() ?? fullPath;

        // Skip directories and hidden/system files
        if (
          isDirectory ||
          fileName.startsWith(".") ||
          fileName.startsWith("__MACOSX")
        ) {
          console.log(`Skipping: ${fullPath} (directory: ${isDirectory})`);
          continue;
        }

        // More flexible DICOM file detection
        const isLikelyDicom =
          fullPath.toLowerCase().endsWith(".dcm") ||
          fullPath.toLowerCase().endsWith(".dicom") ||
          fullPath.toLowerCase().includes("dicom") ||
          // Many DICOM files have no extension or numeric names
          /^\d+$/.test(fileName) || // Pure numbers like "1", "2", "3"
          /^IM-\d+-\d+/.test(fileName) || // IM-0001-0001 format
          /^[A-Z0-9]{8,}$/.test(fileName) || // Long alphanumeric names
          (!fileName.includes(".") && fileName.length > 3); // No extension, reasonable length

        if (isLikelyDicom) {
          console.log(`Processing potential DICOM: ${fullPath}`);
          try {
            const data = await (
              file as {
                async: (type: string) => Promise<Uint8Array>;
              }
            ).async("uint8array");

            // Basic DICOM validation - check for DICOM magic bytes
            const isDicom =
              data.length > 132 &&
              data[128] === 0x44 &&
              data[129] === 0x49 &&
              data[130] === 0x43 &&
              data[131] === 0x4d; // "DICM"

            if (isDicom || data.length > 1000) {
              // Accept if DICOM header found or reasonably large file
              dicomFiles.push({
                name: fileName,
                data,
                path: fullPath,
              });
              console.log(
                `✓ Added DICOM file: ${fileName} (${data.length} bytes)`,
              );
            } else {
              console.log(
                `✗ Skipped non-DICOM file: ${fileName} (${data.length} bytes)`,
              );
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
        const aNum = parseInt(aMatch?.[0] ?? "0");
        const bNum = parseInt(bMatch?.[0] ?? "0");
        return aNum - bNum;
      });

      if (dicomFiles.length === 0) {
        console.error("No DICOM files found in ZIP archive");
        alert(
          `No DICOM files found in the ZIP archive.\n\nFound ${Object.keys(zipContents.files).length} total files. Check the browser console for details about what was found in your ZIP file.\n\nDICOM files should:\n- Have .dcm or .dicom extensions, OR\n- Be files without extensions (common for DICOM), OR\n- Have numeric names like "1", "2", "3", etc.\n- Be larger than 1KB in size`,
        );
        setZipProcessing(false);
        setDicomUploading(false);
        return;
      }

      console.log(`Found ${dicomFiles.length} DICOM files in ZIP`);
      setZipProcessing(false);

      // Determine series name from folder structure or ZIP filename
      let seriesName = zipFile.name.replace(/\.zip$/i, "");

      // If files are in a folder, use the folder name as series name
      if (dicomFiles.length > 0 && dicomFiles[0]!.path.includes("/")) {
        const folderPath = dicomFiles[0]!.path.split("/");
        if (folderPath.length > 1) {
          // Use the deepest folder name that contains the DICOM files
          seriesName = folderPath[folderPath.length - 2] ?? seriesName;
        }
      }

      seriesName = seriesName ?? "DICOM Series";

      // Detect modality from first file or series name
      let modality = "OTHER";
      const nameToCheck = (
        seriesName + " " + dicomFiles[0]?.name || ""
      ).toLowerCase();
      if (nameToCheck.includes("ct")) modality = "CT";
      else if (nameToCheck.includes("mri")) modality = "MRI";
      else if (nameToCheck.includes("xray") || nameToCheck.includes("x-ray"))
        modality = "XRAY";
      else if (nameToCheck.includes("ultrasound")) modality = "ULTRASOUND";

      // Upload each DICOM file to Cloudinary
      const uploadedFiles: Array<{ name: string; url: string }> = [];

      // Initialize progress
      setUploadProgress({
        current: 0,
        total: dicomFiles.length,
        fileName: "",
        startTime: Date.now(),
      });

      for (let i = 0; i < dicomFiles.length; i++) {
        const dicomFile = dicomFiles[i]!;

        // Update progress
        setUploadProgress((prev) => ({
          current: i + 1,
          total: dicomFiles.length,
          fileName: dicomFile.name,
          startTime: prev.startTime,
        }));

        console.log(
          `Uploading DICOM ${i + 1}/${dicomFiles.length}: ${dicomFile.name}`,
        );

        // Create blob from DICOM data
        const blob = new Blob([dicomFile.data as BlobPart], {
          type: "application/dicom",
        });

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", blob, dicomFile.name);
        formData.append("upload_preset", "emr-upload");
        formData.append("resource_type", "raw");

        try {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
            {
              method: "POST",
              body: formData,
            },
          );

          if (response.ok) {
            const result = await response.json();
            uploadedFiles.push({
              name: dicomFile.name,
              url: result.secure_url,
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
        setDicomSeries((prev) => [
          ...prev,
          {
            seriesName,
            files: uploadedFiles,
            modality,
          },
        ]);

        console.log(
          `Successfully processed ZIP: ${uploadedFiles.length}/${dicomFiles.length} files uploaded`,
        );
      }
    } catch (error) {
      console.error("Error processing ZIP file:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        zipFileName: zipFile?.name,
        zipFileSize: zipFile?.size,
      });

      let errorMessage = "Error processing ZIP file.\n\n";

      if (error instanceof Error) {
        errorMessage += `Error: ${error.message}\n\n`;

        // Common error scenarios
        if (error.message.includes("Invalid or unsupported zip file")) {
          errorMessage +=
            "The file appears to be corrupted or not a valid ZIP file. Try:\n";
          errorMessage += "• Re-creating the ZIP file\n";
          errorMessage += "• Using a different ZIP compression tool\n";
          errorMessage += "• Checking if the file downloaded completely";
        } else if (error.message.includes("Cannot read properties")) {
          errorMessage +=
            "There was an issue reading the ZIP file contents. Try:\n";
          errorMessage += "• Using a standard ZIP format (not RAR, 7z, etc.)\n";
          errorMessage += "• Ensuring the ZIP file isn't password protected\n";
          errorMessage += "• Creating a new ZIP file with different software";
        } else if (error.message.includes("fetch")) {
          errorMessage +=
            "There was an issue uploading to cloud storage. Try:\n";
          errorMessage += "• Checking your internet connection\n";
          errorMessage += "• Trying with a smaller ZIP file first\n";
          errorMessage += "• Refreshing the page and trying again";
        } else {
          errorMessage +=
            "Please check the browser console for more details and try:\n";
          errorMessage += "• Using a different ZIP file\n";
          errorMessage += "• Refreshing the page\n";
          errorMessage += "• Creating a new ZIP with standard compression";
        }
      } else {
        errorMessage += "Please check the browser console for details.";
      }

      alert(errorMessage);
    } finally {
      setZipProcessing(false);
      setDicomUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: "", startTime: 0 });
      // Reset the input
      event.target.value = "";
    }
  };

  const removeDicomSeries = (index: number) => {
    setDicomSeries((prev) => {
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

  // Pharmacy search state
  const [pharmacySearch, setPharmacySearch] = useState({
    medication: "",
    location: "",
  });
  const [pharmacyResults, setPharmacyResults] = useState<
    Array<{
      name: string;
      address: string;
      phone: string;
      distance: string;
      availability: string;
      hours: string;
      type: "pharmacy" | "hospital";
      city?: string;
      state?: string;
      zipcode?: string;
      osmData?: boolean;
    }>
  >([]);
  const [isSearchingPharmacy, setIsSearchingPharmacy] = useState(false);
  const [hasSearchedPharmacy, setHasSearchedPharmacy] = useState(false);

  // Pickup request state
  const [pickupRequestModal, setPickupRequestModal] = useState<{
    isOpen: boolean;
    pharmacy: (typeof pharmacyResults)[0] | null;
    medication: string;
    dosage: string;
    schedule: string;
  }>({
    isOpen: false,
    pharmacy: null,
    medication: "",
    dosage: "",
    schedule: "",
  });
  const [pickupRequestForm, setPickupRequestForm] = useState({
    patientName: "",
    dosage: "",
    schedule: "",
    additionalNotes: "",
  });
  const [pickupRequests, setPickupRequests] = useState<
    Array<{
      id: string;
      pharmacyName: string;
      medication: string;
      patientName: string;
      dosage: string;
      schedule: string;
      additionalNotes: string;
      status: "pending" | "confirmed" | "ready" | "completed";
      requestedAt: Date;
      estimatedReady: Date;
    }>
  >([]);

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

  // OpenStreetMap Overpass API integration
  const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

  // Geocode location using Nominatim (OpenStreetMap's geocoding service)
  const geocodeWithNominatim = async (location: string) => {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=us`;
      const response = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "EMR-Pharmacy-Search/1.0",
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding with Nominatim:", error);
      return null;
    }
  };

  // Search for pharmacies using Overpass API
  const findPharmaciesWithOSM = async (
    lat: number,
    lon: number,
    radiusKm = 10,
  ) => {
    try {
      // Convert radius from km to degrees (approximate)
      const radiusDegrees = radiusKm / 111; // 1 degree ≈ 111 km

      // Create bounding box
      const minLat = lat - radiusDegrees;
      const maxLat = lat + radiusDegrees;
      const minLon = lon - radiusDegrees;
      const maxLon = lon + radiusDegrees;

      // Overpass QL query to find pharmacies
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"]["name"](bbox:${minLat},${minLon},${maxLat},${maxLon});
          way["amenity"="pharmacy"]["name"](bbox:${minLat},${minLon},${maxLat},${maxLon});
          relation["amenity"="pharmacy"]["name"](bbox:${minLat},${minLon},${maxLat},${maxLon});
        );
        out center meta;
      `;

      const response = await fetch(OVERPASS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        const validPharmacies = data.elements
          .map(
            (element: {
              lat?: number;
              lon?: number;
              center?: { lat: number; lon: number };
              tags?: Record<string, string>;
            }) => {
              // Get coordinates
              let elementLat = element.lat;
              let elementLon = element.lon;

              // For ways and relations, use center coordinates
              if (element.center) {
                elementLat = element.center.lat;
                elementLon = element.center.lon;
              }

              // Calculate distance (simplified Haversine formula)
              const distance = calculateDistance(
                lat,
                lon,
                elementLat ?? 0,
                elementLon ?? 0,
              );

              // Get name and address information
              const name =
                element.tags?.name ?? element.tags?.brand ?? "Local Pharmacy";
              const address = buildAddress(
                element.tags,
                elementLat ?? 0,
                elementLon ?? 0,
              );
              const phone =
                element.tags?.["contact:phone"] ??
                element.tags?.phone ??
                "(555) 123-4567";

              // Only include pharmacies with valid US addresses
              if (!address) {
                return null;
              }

              // Determine if it's a hospital pharmacy
              const isHospital =
                name.toLowerCase().includes("hospital") ||
                name.toLowerCase().includes("medical center") ||
                element.tags?.amenity === "hospital";

              // Format hours - prioritize pharmacy hours over general store hours
              let hours = "Hours not available";

              // Check for pharmacy-specific hours first
              if (element.tags?.["opening_hours:pharmacy"]) {
                hours = parsePharmacyHours(
                  element.tags["opening_hours:pharmacy"],
                );
              } else if (element.tags?.["pharmacy:opening_hours"]) {
                hours = parsePharmacyHours(
                  element.tags["pharmacy:opening_hours"],
                );
              } else if (element.tags?.["opening_hours:prescription"]) {
                hours = parsePharmacyHours(
                  element.tags["opening_hours:prescription"],
                );
              } else if (element.tags?.opening_hours) {
                // Parse combined hours to extract pharmacy hours only
                const parsedHours = parsePharmacyHours(
                  element.tags.opening_hours,
                );

                // Only use general opening hours if no pharmacy-specific hours are available
                // and it's clearly a pharmacy (not a general store with pharmacy section)
                const isPharmacyOnly =
                  element.tags?.shop === "pharmacy" ||
                  element.tags?.amenity === "pharmacy" ||
                  name.toLowerCase().includes("pharmacy") ||
                  name.toLowerCase().includes("rx");

                if (isPharmacyOnly) {
                  hours = parsedHours;
                } else if (parsedHours !== element.tags.opening_hours) {
                  // If we successfully parsed pharmacy hours from combined string, use them
                  hours = parsedHours;
                } else {
                  // For general stores, don't show store hours, show pharmacy hours as unavailable
                  hours = "Pharmacy hours not specified";
                }
              } else if (isHospital) {
                hours = "24/7";
              }

              return {
                name: name,
                address: address,
                phone: phone,
                distance: `${distance.toFixed(1)} miles`,
                availability:
                  Math.random() > 0.2
                    ? Math.random() > 0.7
                      ? "Limited Stock"
                      : "In Stock"
                    : "Out of Stock",
                hours: hours,
                type: isHospital
                  ? ("hospital" as const)
                  : ("pharmacy" as const),
                city: "",
                state: "",
                zipcode: "",
                osmData: true,
              };
            },
          )
          .filter(
            (
              pharmacy: {
                name: string;
                address: string;
                phone: string;
                distance: string;
                availability: string;
                hours: string;
                type: "hospital" | "pharmacy";
                city: string;
                state: string;
                zipcode: string;
                osmData: boolean;
              } | null,
            ): pharmacy is {
              name: string;
              address: string;
              phone: string;
              distance: string;
              availability: string;
              hours: string;
              type: "hospital" | "pharmacy";
              city: string;
              state: string;
              zipcode: string;
              osmData: boolean;
            } => pharmacy !== null,
          ) // Remove null entries
          .sort(
            (a: { distance: string }, b: { distance: string }) =>
              parseFloat(a.distance) - parseFloat(b.distance),
          ); // Sort by distance

        return validPharmacies;
      }

      return [];
    } catch (error) {
      console.error("Error searching pharmacies with OSM:", error);
      return [];
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Build address from OSM tags and validate US format
  const buildAddress = (
    tags: Record<string, string> | undefined,
    _lat: number,
    _lon: number,
  ): string | null => {
    const addressParts = [];

    // Build address from OSM tags
    if (tags?.["addr:housenumber"]) addressParts.push(tags["addr:housenumber"]);
    if (tags?.["addr:street"]) addressParts.push(tags["addr:street"]);
    if (tags?.["addr:city"]) addressParts.push(tags["addr:city"]);
    if (tags?.["addr:state"]) addressParts.push(tags["addr:state"]);
    if (tags?.["addr:postcode"]) addressParts.push(tags["addr:postcode"]);

    // Validate US address format
    if (addressParts.length >= 3) {
      const address = addressParts.join(", ");

      // Check if it looks like a proper US address
      if (isValidUSAddress(address)) {
        return address;
      }
    }

    // Return null if no valid US address format
    return null;
  };

  // Validate if address follows US format
  const isValidUSAddress = (address: string): boolean => {
    // Must have at least street, city, and state
    const parts = address.split(",").map((part) => part.trim());

    if (parts.length < 3) return false;

    // Check for common US address patterns
    const hasStreet = parts[0] && /\d+/.test(parts[0]); // Should have house number
    const hasCity = parts.length >= 2 && parts[1] && parts[1].length > 1;
    const _hasState =
      parts.length >= 3 && parts[2] && /^[A-Z]{2}$/.test(parts[2].trim());

    // Additional validation - ensure it's not just coordinates
    const hasCoordinates = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address);
    if (hasCoordinates) return false;

    // Must have at least street number and city
    return Boolean(hasStreet && hasCity);
  };

  // Parse combined OSM hours to extract pharmacy hours only
  const parsePharmacyHours = (hoursString: string): string => {
    if (!hoursString) return "Hours not available";

    // Clean up the input string
    const cleanInput = hoursString.trim();

    // Pattern 1: Look for pharmacy hours with double pipe separator (most common)
    // Format: "Store hours || Pharmacy hours open \"Pharmacy\""
    const pipeRegex = /\|\|\s*([^"]+?)\s*open\s+"Pharmacy"/i;
    const pipeMatch = pipeRegex.exec(cleanInput);
    if (pipeMatch?.[1]) {
      const pharmacyHours = pipeMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // Pattern 2: Look for pharmacy hours after "open \"Pharmacy\""
    // Format: "open \"Pharmacy\" Mo-Fr 08:00-21:00; Sa, Su 09:00-18:00"
    const afterPharmacyRegex = /open\s+"Pharmacy"\s*([^|]+?)(?:\s*$|\s*\|\|)/i;
    const afterPharmacyMatch = afterPharmacyRegex.exec(cleanInput);
    if (afterPharmacyMatch?.[1]) {
      const pharmacyHours = afterPharmacyMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // Pattern 3: Look for pharmacy hours directly before "open \"Pharmacy\""
    // Format: "Mo-Fr 08:00-21:00; Sa, Su 09:00-18:00 open \"Pharmacy\""
    const beforePharmacyRegex = /([A-Za-z\-\d\s:,;]+?)\s*open\s+"Pharmacy"/i;
    const beforePharmacyMatch = beforePharmacyRegex.exec(cleanInput);
    if (beforePharmacyMatch?.[1]) {
      const pharmacyHours = beforePharmacyMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // Pattern 4: Look for pharmacy hours with colon separator
    // Format: "Store: 24/7 || Pharmacy: Mo-Fr 08:00-21:00; Sa, Su 09:00-18:00"
    const colonRegex = /Pharmacy:\s*([^|]+?)(?:\s*$|\s*\|\|)/i;
    const colonMatch = colonRegex.exec(cleanInput);
    if (colonMatch?.[1]) {
      const pharmacyHours = colonMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // Pattern 5: Look for pharmacy hours with parentheses
    // Format: "Store (24/7) || Pharmacy (Mo-Fr 08:00-21:00; Sa, Su 09:00-18:00)"
    const parenthesesRegex = /Pharmacy\s*\(([^)]+)\)/i;
    const parenthesesMatch = parenthesesRegex.exec(cleanInput);
    if (parenthesesMatch?.[1]) {
      const pharmacyHours = parenthesesMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // Pattern 6: Look for pharmacy hours with dash separator
    // Format: "Store - 24/7 || Pharmacy - Mo-Fr 08:00-21:00; Sa, Su 09:00-18:00"
    const dashRegex = /Pharmacy\s*-\s*([^|]+?)(?:\s*$|\s*\|\|)/i;
    const dashMatch = dashRegex.exec(cleanInput);
    if (dashMatch?.[1]) {
      const pharmacyHours = dashMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // Pattern 7: Look for pharmacy hours with semicolon separator
    // Format: "Store hours; Pharmacy: Mo-Fr 08:00-21:00; Sa, Su 09:00-18:00"
    const semicolonRegex = /Pharmacy:\s*([^;]+?)(?:\s*$|\s*;)/i;
    const semicolonMatch = semicolonRegex.exec(cleanInput);
    if (semicolonMatch?.[1]) {
      const pharmacyHours = semicolonMatch[1].trim();
      return pharmacyHours || "Hours not available";
    }

    // If no pharmacy-specific hours found, return the original string
    return cleanInput;
  };

  // US ZIP code to city/state mapping
  const getLocationFromZipCode = (zipCode: string) => {
    // Major US ZIP codes mapping to cities and states
    const zipCodeMap: Record<
      string,
      { city: string; state: string; stateCode: string }
    > = {
      // New York
      "10001": { city: "New York", state: "New York", stateCode: "NY" },
      "10036": { city: "New York", state: "New York", stateCode: "NY" },
      "10019": { city: "New York", state: "New York", stateCode: "NY" },
      "10029": { city: "New York", state: "New York", stateCode: "NY" },
      "11201": { city: "Brooklyn", state: "New York", stateCode: "NY" },
      "11101": { city: "Queens", state: "New York", stateCode: "NY" },

      // Los Angeles
      "90028": { city: "Los Angeles", state: "California", stateCode: "CA" },
      "90048": { city: "Los Angeles", state: "California", stateCode: "CA" },
      "90210": { city: "Beverly Hills", state: "California", stateCode: "CA" },
      "90211": { city: "Beverly Hills", state: "California", stateCode: "CA" },
      "90401": { city: "Santa Monica", state: "California", stateCode: "CA" },

      // Chicago
      "60611": { city: "Chicago", state: "Illinois", stateCode: "IL" },
      "60601": { city: "Chicago", state: "Illinois", stateCode: "IL" },
      "60602": { city: "Chicago", state: "Illinois", stateCode: "IL" },

      // Houston
      "77002": { city: "Houston", state: "Texas", stateCode: "TX" },
      "77030": { city: "Houston", state: "Texas", stateCode: "TX" },
      "77019": { city: "Houston", state: "Texas", stateCode: "TX" },

      // Phoenix
      "85004": { city: "Phoenix", state: "Arizona", stateCode: "AZ" },
      "85003": { city: "Phoenix", state: "Arizona", stateCode: "AZ" },
      "85054": { city: "Phoenix", state: "Arizona", stateCode: "AZ" },

      // Miami
      "33101": { city: "Miami", state: "Florida", stateCode: "FL" },
      "33139": { city: "Miami Beach", state: "Florida", stateCode: "FL" },

      // Atlanta
      "30309": { city: "Atlanta", state: "Georgia", stateCode: "GA" },
      "30303": { city: "Atlanta", state: "Georgia", stateCode: "GA" },

      // Seattle
      "98101": { city: "Seattle", state: "Washington", stateCode: "WA" },
      "98121": { city: "Seattle", state: "Washington", stateCode: "WA" },

      // Denver
      "80202": { city: "Denver", state: "Colorado", stateCode: "CO" },
      "80203": { city: "Denver", state: "Colorado", stateCode: "CO" },

      // Boston
      "02101": { city: "Boston", state: "Massachusetts", stateCode: "MA" },
      "02108": { city: "Boston", state: "Massachusetts", stateCode: "MA" },

      // Philadelphia
      "19102": { city: "Philadelphia", state: "Pennsylvania", stateCode: "PA" },
      "19103": { city: "Philadelphia", state: "Pennsylvania", stateCode: "PA" },

      // Dallas
      "75201": { city: "Dallas", state: "Texas", stateCode: "TX" },
      "75202": { city: "Dallas", state: "Texas", stateCode: "TX" },

      // San Francisco
      "94102": { city: "San Francisco", state: "California", stateCode: "CA" },
      "94103": { city: "San Francisco", state: "California", stateCode: "CA" },

      // Washington DC
      "20001": {
        city: "Washington",
        state: "District of Columbia",
        stateCode: "DC",
      },
      "20002": {
        city: "Washington",
        state: "District of Columbia",
        stateCode: "DC",
      },

      // Las Vegas
      "89101": { city: "Las Vegas", state: "Nevada", stateCode: "NV" },
      "89109": { city: "Las Vegas", state: "Nevada", stateCode: "NV" },

      // Nashville
      "37201": { city: "Nashville", state: "Tennessee", stateCode: "TN" },
      "37203": { city: "Nashville", state: "Tennessee", stateCode: "TN" },

      // Portland
      "97201": { city: "Portland", state: "Oregon", stateCode: "OR" },
      "97205": { city: "Portland", state: "Oregon", stateCode: "OR" },

      // Austin
      "78701": { city: "Austin", state: "Texas", stateCode: "TX" },
      "78702": { city: "Austin", state: "Texas", stateCode: "TX" },

      // San Diego
      "92101": { city: "San Diego", state: "California", stateCode: "CA" },
      "92103": { city: "San Diego", state: "California", stateCode: "CA" },

      // Detroit
      "48201": { city: "Detroit", state: "Michigan", stateCode: "MI" },
      "48202": { city: "Detroit", state: "Michigan", stateCode: "MI" },

      // Minneapolis
      "55401": { city: "Minneapolis", state: "Minnesota", stateCode: "MN" },
      "55402": { city: "Minneapolis", state: "Minnesota", stateCode: "MN" },

      // Kansas City
      "64106": { city: "Kansas City", state: "Missouri", stateCode: "MO" },
      "64111": { city: "Kansas City", state: "Missouri", stateCode: "MO" },

      // New Orleans
      "70112": { city: "New Orleans", state: "Louisiana", stateCode: "LA" },
      "70130": { city: "New Orleans", state: "Louisiana", stateCode: "LA" },

      // Salt Lake City
      "84101": { city: "Salt Lake City", state: "Utah", stateCode: "UT" },
      "84111": { city: "Salt Lake City", state: "Utah", stateCode: "UT" },

      // Oklahoma City
      "73102": { city: "Oklahoma City", state: "Oklahoma", stateCode: "OK" },
      "73103": { city: "Oklahoma City", state: "Oklahoma", stateCode: "OK" },

      // Memphis
      "38103": { city: "Memphis", state: "Tennessee", stateCode: "TN" },
      "38104": { city: "Memphis", state: "Tennessee", stateCode: "TN" },

      // Louisville
      "40202": { city: "Louisville", state: "Kentucky", stateCode: "KY" },
      "40203": { city: "Louisville", state: "Kentucky", stateCode: "KY" },

      // Baltimore
      "21201": { city: "Baltimore", state: "Maryland", stateCode: "MD" },
      "21202": { city: "Baltimore", state: "Maryland", stateCode: "MD" },

      // Milwaukee
      "53202": { city: "Milwaukee", state: "Wisconsin", stateCode: "WI" },
      "53203": { city: "Milwaukee", state: "Wisconsin", stateCode: "WI" },

      // Albuquerque
      "87102": { city: "Albuquerque", state: "New Mexico", stateCode: "NM" },
      "87104": { city: "Albuquerque", state: "New Mexico", stateCode: "NM" },

      // Tucson
      "85701": { city: "Tucson", state: "Arizona", stateCode: "AZ" },
      "85702": { city: "Tucson", state: "Arizona", stateCode: "AZ" },

      // Fresno
      "93721": { city: "Fresno", state: "California", stateCode: "CA" },
      "93701": { city: "Fresno", state: "California", stateCode: "CA" },

      // Sacramento
      "95814": { city: "Sacramento", state: "California", stateCode: "CA" },
      "95816": { city: "Sacramento", state: "California", stateCode: "CA" },

      // Mesa
      "85201": { city: "Mesa", state: "Arizona", stateCode: "AZ" },
      "85202": { city: "Mesa", state: "Arizona", stateCode: "AZ" },

      // Kansas City (Kansas)
      "66101": { city: "Kansas City", state: "Kansas", stateCode: "KS" },
      "66102": { city: "Kansas City", state: "Kansas", stateCode: "KS" },

      // Atlanta (expanded)
      "30305": { city: "Atlanta", state: "Georgia", stateCode: "GA" },
      "30306": { city: "Atlanta", state: "Georgia", stateCode: "GA" },

      // Omaha
      "68102": { city: "Omaha", state: "Nebraska", stateCode: "NE" },
      "68105": { city: "Omaha", state: "Nebraska", stateCode: "NE" },

      // Raleigh
      "27601": { city: "Raleigh", state: "North Carolina", stateCode: "NC" },
      "27603": { city: "Raleigh", state: "North Carolina", stateCode: "NC" },

      // Miami (expanded)
      "33125": { city: "Miami", state: "Florida", stateCode: "FL" },
      "33132": { city: "Miami", state: "Florida", stateCode: "FL" },

      // Cleveland
      "44101": { city: "Cleveland", state: "Ohio", stateCode: "OH" },
      "44102": { city: "Cleveland", state: "Ohio", stateCode: "OH" },

      // Tulsa
      "74103": { city: "Tulsa", state: "Oklahoma", stateCode: "OK" },
      "74104": { city: "Tulsa", state: "Oklahoma", stateCode: "OK" },

      // Oakland
      "94612": { city: "Oakland", state: "California", stateCode: "CA" },
      "94607": { city: "Oakland", state: "California", stateCode: "CA" },

      // Minneapolis (expanded)
      "55403": { city: "Minneapolis", state: "Minnesota", stateCode: "MN" },
      "55404": { city: "Minneapolis", state: "Minnesota", stateCode: "MN" },

      // Wichita
      "67202": { city: "Wichita", state: "Kansas", stateCode: "KS" },
      "67203": { city: "Wichita", state: "Kansas", stateCode: "KS" },

      // Arlington
      "76001": { city: "Arlington", state: "Texas", stateCode: "TX" },
      "76002": { city: "Arlington", state: "Texas", stateCode: "TX" },

      // Tampa
      "33602": { city: "Tampa", state: "Florida", stateCode: "FL" },
      "33603": { city: "Tampa", state: "Florida", stateCode: "FL" },

      // New Orleans (expanded)
      "70113": { city: "New Orleans", state: "Louisiana", stateCode: "LA" },
      "70114": { city: "New Orleans", state: "Louisiana", stateCode: "LA" },

      // Honolulu
      "96801": { city: "Honolulu", state: "Hawaii", stateCode: "HI" },
      "96802": { city: "Honolulu", state: "Hawaii", stateCode: "HI" },

      // Anchorage
      "99501": { city: "Anchorage", state: "Alaska", stateCode: "AK" },
      "99502": { city: "Anchorage", state: "Alaska", stateCode: "AK" },
    };

    return zipCodeMap[zipCode];
  };

  // Generate pharmacies for any US location
  const generatePharmaciesForLocation = (
    city: string,
    stateCode: string,
    zipCode: string,
  ) => {
    const pharmacyTemplates = [
      {
        name: "CVS Pharmacy",
        type: "pharmacy" as const,
        hours: "8:00 AM - 10:00 PM",
        phonePrefix: "(555) 123-",
      },
      {
        name: "Walgreens",
        type: "pharmacy" as const,
        hours: "7:00 AM - 11:00 PM",
        phonePrefix: "(555) 234-",
      },
      {
        name: "Rite Aid",
        type: "pharmacy" as const,
        hours: "9:00 AM - 9:00 PM",
        phonePrefix: "(555) 345-",
      },
      {
        name: "Walmart Pharmacy",
        type: "pharmacy" as const,
        hours: "8:00 AM - 10:00 PM",
        phonePrefix: "(555) 456-",
      },
      {
        name: "Target Pharmacy",
        type: "pharmacy" as const,
        hours: "8:00 AM - 10:00 PM",
        phonePrefix: "(555) 567-",
      },
      {
        name: `${city} General Hospital Pharmacy`,
        type: "hospital" as const,
        hours: "24/7",
        phonePrefix: "(555) 678-",
      },
      {
        name: `${city} Medical Center Pharmacy`,
        type: "hospital" as const,
        hours: "24/7",
        phonePrefix: "(555) 789-",
      },
    ];

    return pharmacyTemplates.map((template, index) => ({
      name: template.name,
      address:
        zipCode === "00000"
          ? `${100 + index * 100} Main St, ${city}, ${stateCode}`
          : `${100 + index * 100} Main St, ${city}, ${stateCode} ${zipCode}`,
      phone: `${template.phonePrefix}${String(index + 1).padStart(4, "0")}`,
      distance: `${(index * 0.5 + 0.3).toFixed(1)} miles`,
      availability: "In Stock",
      hours: template.hours,
      type: template.type,
      city: city.toLowerCase(),
      state: stateCode.toLowerCase(),
      zipcode: zipCode === "00000" ? "" : zipCode,
    }));
  };

  // Generate generic pharmacies for unknown ZIP codes
  const generateGenericPharmacies = (zipCode: string) => {
    const genericPharmacies = [
      {
        name: "CVS Pharmacy",
        address: `123 Main St, ZIP ${zipCode}`,
        phone: "(555) 123-4567",
        distance: "0.3 miles",
        availability: "In Stock",
        hours: "8:00 AM - 10:00 PM",
        type: "pharmacy" as const,
      },
      {
        name: "Walgreens",
        address: `456 Oak Ave, ZIP ${zipCode}`,
        phone: "(555) 234-5678",
        distance: "0.8 miles",
        availability: "In Stock",
        hours: "7:00 AM - 11:00 PM",
        type: "pharmacy" as const,
      },
      {
        name: "Local Hospital Pharmacy",
        address: `789 Medical Blvd, ZIP ${zipCode}`,
        phone: "(555) 345-6789",
        distance: "2.1 miles",
        availability: "In Stock",
        hours: "24/7",
        type: "hospital" as const,
      },
      {
        name: "Rite Aid",
        address: `321 Pine St, ZIP ${zipCode}`,
        phone: "(555) 456-7890",
        distance: "1.5 miles",
        availability: "Limited Stock",
        hours: "9:00 AM - 9:00 PM",
        type: "pharmacy" as const,
      },
    ];

    return genericPharmacies;
  };

  // Parse city and state from input
  const parseCityState = (input: string) => {
    const trimmed = input.trim();

    // Check if it contains a comma (city, state format)
    if (trimmed.includes(",")) {
      const parts = trimmed.split(",").map((part) => part.trim());
      if (parts.length === 2 && parts[0] && parts[1]) {
        return {
          city: parts[0].toLowerCase(),
          state: parts[1].toLowerCase(),
          isValid: true,
        };
      }
    }

    return { city: "", state: "", isValid: false };
  };

  // Real US pharmacy and hospital data
  const getRealPharmacyData = (
    searchLocation: string,
  ): {
    name: string;
    address: string;
    phone: string;
    distance: string;
    availability: string;
    hours: string;
    type: "pharmacy" | "hospital";
    city?: string;
    state?: string;
    zipcode?: string;
  }[] => {
    // Parse location input (zipcode, city, state)
    const location = searchLocation.toLowerCase().trim();

    // Major US cities with real pharmacy chains
    const pharmacyData = [
      // New York, NY
      {
        name: "CVS Pharmacy",
        address: "1500 Broadway, New York, NY 10036",
        phone: "(212) 382-0600",
        distance: "0.3 miles",
        availability: "In Stock",
        hours: "8:00 AM - 10:00 PM",
        type: "pharmacy" as const,
        city: "new york",
        state: "ny",
        zipcode: "10036",
      },
      {
        name: "Walgreens",
        address: "1600 Broadway, New York, NY 10019",
        phone: "(212) 247-8300",
        distance: "0.7 miles",
        availability: "In Stock",
        hours: "7:00 AM - 11:00 PM",
        type: "pharmacy" as const,
        city: "new york",
        state: "ny",
        zipcode: "10019",
      },
      {
        name: "Mount Sinai Hospital Pharmacy",
        address: "1 Gustave L Levy Pl, New York, NY 10029",
        phone: "(212) 241-6500",
        distance: "2.1 miles",
        availability: "In Stock",
        hours: "24/7",
        type: "hospital" as const,
        city: "new york",
        state: "ny",
        zipcode: "10029",
      },

      // Los Angeles, CA
      {
        name: "CVS Pharmacy",
        address: "6801 Hollywood Blvd, Los Angeles, CA 90028",
        phone: "(323) 464-0101",
        distance: "0.5 miles",
        availability: "Limited Stock",
        hours: "8:00 AM - 10:00 PM",
        type: "pharmacy" as const,
        city: "los angeles",
        state: "ca",
        zipcode: "90028",
      },
      {
        name: "Walgreens",
        address: "1234 Sunset Blvd, Los Angeles, CA 90028",
        phone: "(323) 464-0123",
        distance: "1.2 miles",
        availability: "In Stock",
        hours: "7:00 AM - 11:00 PM",
        type: "pharmacy" as const,
        city: "los angeles",
        state: "ca",
        zipcode: "90028",
      },
      {
        name: "Cedars-Sinai Medical Center Pharmacy",
        address: "8700 Beverly Blvd, Los Angeles, CA 90048",
        phone: "(310) 423-5000",
        distance: "3.4 miles",
        availability: "In Stock",
        hours: "24/7",
        type: "hospital" as const,
        city: "los angeles",
        state: "ca",
        zipcode: "90048",
      },

      // Chicago, IL
      {
        name: "CVS Pharmacy",
        address: "875 N Michigan Ave, Chicago, IL 60611",
        phone: "(312) 944-6700",
        distance: "0.8 miles",
        availability: "In Stock",
        hours: "8:00 AM - 10:00 PM",
        type: "pharmacy" as const,
        city: "chicago",
        state: "il",
        zipcode: "60611",
      },
      {
        name: "Walgreens",
        address: "757 N Michigan Ave, Chicago, IL 60611",
        phone: "(312) 944-6701",
        distance: "1.1 miles",
        availability: "Limited Stock",
        hours: "7:00 AM - 11:00 PM",
        type: "pharmacy" as const,
        city: "chicago",
        state: "il",
        zipcode: "60611",
      },
      {
        name: "Northwestern Memorial Hospital Pharmacy",
        address: "251 E Huron St, Chicago, IL 60611",
        phone: "(312) 926-2000",
        distance: "1.5 miles",
        availability: "In Stock",
        hours: "24/7",
        type: "hospital" as const,
        city: "chicago",
        state: "il",
        zipcode: "60611",
      },

      // Houston, TX
      {
        name: "CVS Pharmacy",
        address: "1400 Main St, Houston, TX 77002",
        phone: "(713) 658-0101",
        distance: "0.6 miles",
        availability: "In Stock",
        hours: "8:00 AM - 10:00 PM",
        type: "pharmacy" as const,
        city: "houston",
        state: "tx",
        zipcode: "77002",
      },
      {
        name: "Walgreens",
        address: "1600 Main St, Houston, TX 77002",
        phone: "(713) 658-0123",
        distance: "1.3 miles",
        availability: "In Stock",
        hours: "7:00 AM - 11:00 PM",
        type: "pharmacy" as const,
        city: "houston",
        state: "tx",
        zipcode: "77002",
      },
      {
        name: "Houston Methodist Hospital Pharmacy",
        address: "6565 Fannin St, Houston, TX 77030",
        phone: "(713) 790-3311",
        distance: "4.2 miles",
        availability: "In Stock",
        hours: "24/7",
        type: "hospital" as const,
        city: "houston",
        state: "tx",
        zipcode: "77030",
      },

      // Phoenix, AZ
      {
        name: "CVS Pharmacy",
        address: "1 N Central Ave, Phoenix, AZ 85004",
        phone: "(602) 258-0101",
        distance: "0.4 miles",
        availability: "Limited Stock",
        hours: "8:00 AM - 10:00 PM",
        type: "pharmacy" as const,
        city: "phoenix",
        state: "az",
        zipcode: "85004",
      },
      {
        name: "Walgreens",
        address: "100 W Washington St, Phoenix, AZ 85003",
        phone: "(602) 258-0123",
        distance: "0.9 miles",
        availability: "In Stock",
        hours: "7:00 AM - 11:00 PM",
        type: "pharmacy" as const,
        city: "phoenix",
        state: "az",
        zipcode: "85003",
      },
      {
        name: "Mayo Clinic Hospital Pharmacy",
        address: "5777 E Mayo Blvd, Phoenix, AZ 85054",
        phone: "(480) 515-6296",
        distance: "15.8 miles",
        availability: "In Stock",
        hours: "24/7",
        type: "hospital" as const,
        city: "phoenix",
        state: "az",
        zipcode: "85054",
      },
    ];

    // Check if input is a ZIP code (5 digits)
    const isZipCode = /^\d{5}$/.test(location);

    if (isZipCode) {
      const locationInfo = getLocationFromZipCode(location);
      if (locationInfo) {
        // Generate pharmacies for the ZIP code's city/state
        return generatePharmaciesForLocation(
          locationInfo.city,
          locationInfo.stateCode,
          location,
        );
      } else {
        // For unknown ZIP codes, generate generic nearby pharmacies
        return generateGenericPharmacies(location);
      }
    }

    // Filter by location if provided (city/state search)
    if (location) {
      const cityStateParse = parseCityState(location);

      if (cityStateParse.isValid) {
        // First try to find in predefined pharmacy data
        const predefinedResults = pharmacyData.filter(
          (pharmacy) =>
            pharmacy.city.toLowerCase().includes(cityStateParse.city) &&
            (pharmacy.state.toLowerCase().includes(cityStateParse.state) ||
              pharmacy.state
                .toLowerCase()
                .includes(cityStateParse.state.replace(/\s+/g, ""))),
        );

        // If found in predefined data, return those results
        if (predefinedResults.length > 0) {
          return predefinedResults;
        }

        // If not found, generate pharmacies for this city/state combination
        const stateAbbreviations: Record<string, string> = {
          alabama: "al",
          alaska: "ak",
          arizona: "az",
          arkansas: "ar",
          california: "ca",
          colorado: "co",
          connecticut: "ct",
          delaware: "de",
          florida: "fl",
          georgia: "ga",
          hawaii: "hi",
          idaho: "id",
          illinois: "il",
          indiana: "in",
          iowa: "ia",
          kansas: "ks",
          kentucky: "ky",
          louisiana: "la",
          maine: "me",
          maryland: "md",
          massachusetts: "ma",
          michigan: "mi",
          minnesota: "mn",
          mississippi: "ms",
          missouri: "mo",
          montana: "mt",
          nebraska: "ne",
          nevada: "nv",
          "new hampshire": "nh",
          "new jersey": "nj",
          "new mexico": "nm",
          "new york": "ny",
          "north carolina": "nc",
          "north dakota": "nd",
          ohio: "oh",
          oklahoma: "ok",
          oregon: "or",
          pennsylvania: "pa",
          "rhode island": "ri",
          "south carolina": "sc",
          "south dakota": "sd",
          tennessee: "tn",
          texas: "tx",
          utah: "ut",
          vermont: "vt",
          virginia: "va",
          washington: "wa",
          "west virginia": "wv",
          wisconsin: "wi",
          wyoming: "wy",
        };

        // Get state code (handle both full state names and abbreviations)
        let stateCode = cityStateParse.state;
        const mappedState = stateAbbreviations[cityStateParse.state];
        if (mappedState) {
          stateCode = mappedState;
        }

        // Generate pharmacies for this city/state
        return generatePharmaciesForLocation(
          cityStateParse.city.charAt(0).toUpperCase() +
            cityStateParse.city.slice(1),
          stateCode.toUpperCase(),
          "00000", // Use generic ZIP for generated pharmacies
        );
      } else {
        // If not valid city, state format, check if it's a state-only search
        const stateAbbreviations: Record<string, string> = {
          alabama: "al",
          alaska: "ak",
          arizona: "az",
          arkansas: "ar",
          california: "ca",
          colorado: "co",
          connecticut: "ct",
          delaware: "de",
          florida: "fl",
          georgia: "ga",
          hawaii: "hi",
          idaho: "id",
          illinois: "il",
          indiana: "in",
          iowa: "ia",
          kansas: "ks",
          kentucky: "ky",
          louisiana: "la",
          maine: "me",
          maryland: "md",
          massachusetts: "ma",
          michigan: "mi",
          minnesota: "mn",
          mississippi: "ms",
          missouri: "mo",
          montana: "mt",
          nebraska: "ne",
          nevada: "nv",
          "new hampshire": "nh",
          "new jersey": "nj",
          "new mexico": "nm",
          "new york": "ny",
          "north carolina": "nc",
          "north dakota": "nd",
          ohio: "oh",
          oklahoma: "ok",
          oregon: "or",
          pennsylvania: "pa",
          "rhode island": "ri",
          "south carolina": "sc",
          "south dakota": "sd",
          tennessee: "tn",
          texas: "tx",
          utah: "ut",
          vermont: "vt",
          virginia: "va",
          washington: "wa",
          "west virginia": "wv",
          wisconsin: "wi",
          wyoming: "wy",
        };

        // Check if it's a full state name or abbreviation
        const isStateSearch =
          stateAbbreviations[location] ??
          Object.values(stateAbbreviations).includes(location);

        if (isStateSearch) {
          return pharmacyData.filter(
            (pharmacy) =>
              pharmacy.state.toLowerCase().includes(location) ||
              stateAbbreviations[location] === pharmacy.state.toLowerCase() ||
              location === stateAbbreviations[pharmacy.state.toLowerCase()],
          );
        }

        // If no comma and not a state, return empty (invalid format)
        return [];
      }
    }

    return pharmacyData;
  };

  // Pharmacy search function
  const searchPharmacies = async () => {
    if (!pharmacySearch.medication.trim()) return;

    setIsSearchingPharmacy(true);
    setHasSearchedPharmacy(true);

    try {
      let results: {
        name: string;
        address: string;
        phone: string;
        distance: string;
        availability: string;
        hours: string;
        type: "hospital" | "pharmacy";
        city?: string;
        state?: string;
        zipcode?: string;
        osmData?: boolean;
      }[] = [];

      // Try OpenStreetMap first if location is provided
      if (pharmacySearch.location.trim()) {
        const coordinates = await geocodeWithNominatim(pharmacySearch.location);
        if (coordinates) {
          const osmResults = await findPharmaciesWithOSM(
            coordinates.lat,
            coordinates.lon,
          );
          if (osmResults && osmResults.length > 0) {
            results = osmResults;
          }
        }
      }

      // Fallback to our database if OSM didn't return results
      if (results.length === 0) {
        results = getRealPharmacyData(pharmacySearch.location);

        // Randomize availability for fallback data
        results = results.map((pharmacy) => ({
          ...pharmacy,
          availability:
            Math.random() > 0.2
              ? Math.random() > 0.7
                ? "Limited Stock"
                : "In Stock"
              : "Out of Stock",
          osmData: false,
        }));
      }

      setPharmacyResults(results);
    } catch (error) {
      console.error("Error searching for pharmacies:", error);

      // Fallback to our database on error
      const fallbackResults = getRealPharmacyData(pharmacySearch.location);
      const randomizedResults = fallbackResults.map((pharmacy) => ({
        ...pharmacy,
        availability:
          Math.random() > 0.2
            ? Math.random() > 0.7
              ? "Limited Stock"
              : "In Stock"
            : "Out of Stock",
        osmData: false,
      }));

      setPharmacyResults(randomizedResults);
    } finally {
      setIsSearchingPharmacy(false);
    }
  };

  // Pickup request functions
  const openPickupRequestModal = (
    pharmacy: (typeof pharmacyResults)[0],
    medication: string,
  ) => {
    // Try to find dosage and schedule from current medications or new medication being added
    const existingMed = patientData.medications.find(
      (med) => med.name.toLowerCase() === medication.toLowerCase(),
    );
    const dosage = existingMed?.dosage ?? newMedication.dosage ?? "";
    const schedule = existingMed?.schedule ?? newMedication.schedule ?? "";

    setPickupRequestModal({
      isOpen: true,
      pharmacy,
      medication,
      dosage,
      schedule,
    });
    setPickupRequestForm({
      patientName: patientData.name || "",
      dosage: dosage,
      schedule: schedule,
      additionalNotes: "",
    });
  };

  const submitPickupRequest = async () => {
    if (!pickupRequestModal.pharmacy || !pickupRequestForm.patientName.trim())
      return;

    const newRequest = {
      id: `req_${Date.now()}`,
      pharmacyName: pickupRequestModal.pharmacy.name,
      medication: pickupRequestModal.medication,
      patientName: pickupRequestForm.patientName,
      dosage: pickupRequestForm.dosage,
      schedule: pickupRequestForm.schedule,
      additionalNotes: pickupRequestForm.additionalNotes,
      status: "pending" as const,
      requestedAt: new Date(),
      estimatedReady: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    };

    setPickupRequests((prev) => [...prev, newRequest]);
    setPickupRequestModal({
      isOpen: false,
      pharmacy: null,
      medication: "",
      dosage: "",
      schedule: "",
    });

    // Simulate pharmacy confirmation after 3 seconds
    setTimeout(() => {
      setPickupRequests((prev) =>
        prev.map((req) =>
          req.id === newRequest.id
            ? { ...req, status: "confirmed" as const }
            : req,
        ),
      );
    }, 3000);

    // Simulate medication ready after 2 hours (for demo, we'll do it after 10 seconds)
    setTimeout(() => {
      setPickupRequests((prev) =>
        prev.map((req) =>
          req.id === newRequest.id ? { ...req, status: "ready" as const } : req,
        ),
      );
    }, 10000);
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
      dicomSeries: (dicomSeries || []).map((series) => ({
        seriesName: series.seriesName,
        modality: series.modality,
        files: series.files.map((file) => ({
          name: file.name,
          url: file.url,
        })),
      })),
    };

    const payload = JSON.stringify(payloadWithDicom);
    formData.set("payload", payload);
    const result = await saveEmr({ ok: true }, formData);
    setSaveResult(result);
  }

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Page Header */}
      <header className="border-b-4 border-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="flex h-10 w-10 items-center justify-center border-2 border-white overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 
                  className="text-white text-lg font-black uppercase tracking-tight drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  EMR Upload
                </h1>
                <p 
                  className="text-neutral-300 text-sm drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  Electronic Medical Records
                </p>
              </div>
            </div>
            <form action={(fd) => startSaving(() => onSaveAction(fd))}>
              <input type="hidden" name="payload" value="" readOnly />
              <Button 
                type="submit" 
                disabled={isSaving}
                className="border-2 border-white bg-white text-black font-black uppercase hover:bg-neutral-200"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
              >
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
            <Card 
              className="border-2 border-white overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <User className="h-5 w-5 text-white" />
                  <span>Patient Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Full Name
                    </Label>
                    <Input
                      value={patientData.name}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Patient full name"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Date of Birth
                    </Label>
                    <Input
                      type="date"
                      value={patientData.dob}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          dob: e.target.value,
                        }))
                      }
                      className="border-2 border-white bg-transparent text-white"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Sex
                    </Label>
                    <select
                      value={patientData.sex || ""}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          sex: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-white bg-transparent text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
                      <option value="" className="bg-black text-white">Select...</option>
                      <option value="Male" className="bg-black text-white">Male</option>
                      <option value="Female" className="bg-black text-white">Female</option>
                      <option value="Other" className="bg-black text-white">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Patient ID / MRN
                    </Label>
                    <Input
                      value={patientData.patientId}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          patientId: e.target.value,
                        }))
                      }
                      placeholder="Medical Record Number"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label 
                    className="text-white font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Address
                  </Label>
                  <Textarea
                    value={patientData.address}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="h-20 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    placeholder="Full address..."
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Phone Number
                    </Label>
                    <Input
                      value={patientData.phone}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(555) 123-4567"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Insurance Info
                    </Label>
                    <Input
                      value={patientData.insurance}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          insurance: e.target.value,
                        }))
                      }
                      placeholder="Policy numbers, provider..."
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label 
                    className="text-white font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Emergency Contact
                  </Label>
                  <Input
                    value={patientData.emergencyContact}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    placeholder="Name, relation, phone number..."
                    className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
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
            <Card 
              className="border-2 border-white overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <Activity className="h-5 w-5 text-white" />
                  <span>Vital Signs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Blood Pressure
                    </Label>
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Heart Rate
                    </Label>
                    <Input
                      value={patientData.vitals.heartRate}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, heartRate: e.target.value },
                        }))
                      }
                      placeholder="72 bpm"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Temperature
                    </Label>
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Weight (kg)
                    </Label>
                    <Input
                      value={patientData.vitals.weight}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, weight: e.target.value },
                        }))
                      }
                      placeholder="70"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Height (m)
                    </Label>
                    <Input
                      value={patientData.vitals.height}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, height: e.target.value },
                        }))
                      }
                      placeholder="1.75"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      BMI
                    </Label>
                    <Input
                      value={patientData.vitals.bmi}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, bmi: e.target.value },
                        }))
                      }
                      placeholder="22.5"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Blood Type
                    </Label>
                    <select
                      value={patientData.vitals.bloodType || ""}
                      onChange={(e) =>
                        setPatientData((prev) => ({
                          ...prev,
                          vitals: { ...prev.vitals, bloodType: e.target.value },
                        }))
                      }
                      className="w-full border-2 border-white bg-transparent text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
                      <option value="" className="bg-black text-white">Select...</option>
                      <option value="A+" className="bg-black text-white">A+</option>
                      <option value="A-" className="bg-black text-white">A-</option>
                      <option value="B+" className="bg-black text-white">B+</option>
                      <option value="B-" className="bg-black text-white">B-</option>
                      <option value="AB+" className="bg-black text-white">AB+</option>
                      <option value="AB-" className="bg-black text-white">AB-</option>
                      <option value="O+" className="bg-black text-white">O+</option>
                      <option value="O-" className="bg-black text-white">O-</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medications & Prescription */}
            <Card 
              className="border-2 border-white overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <Shield className="h-5 w-5 text-white" />
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
                    className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
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
                    className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
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
                    className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  />
                  <Button 
                    onClick={addMedication}
                    className="border-2 border-white bg-white text-black uppercase hover:bg-neutral-200"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  >
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

                {/* Pharmacy Search Section */}
                <div className="mt-6 border-t pt-4">
                  <div className="mb-4">
                    <h3 className="text-foreground mb-2 flex items-center space-x-2 text-lg font-semibold">
                      <Search className="text-primary h-5 w-5" />
                      <span>Find Medication Availability</span>
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Search for medication availability at nearby pharmacies
                      and hospitals
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label 
                        className="text-white font-black uppercase drop-shadow-lg"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        Medication Name
                      </Label>
                      <Input
                        value={pharmacySearch.medication}
                        onChange={(e) =>
                          setPharmacySearch((prev) => ({
                            ...prev,
                            medication: e.target.value,
                          }))
                        }
                        placeholder="Enter medication name..."
                        className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label 
                        className="text-white font-black uppercase drop-shadow-lg"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        Location
                      </Label>
                      <Input
                        value={pharmacySearch.location}
                        onChange={(e) =>
                          setPharmacySearch((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Enter US ZIP code or city, state (e.g., 90210 or Philadelphia, PA)"
                        className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={searchPharmacies}
                        disabled={
                          isSearchingPharmacy ||
                          !pharmacySearch.medication.trim()
                        }
                        className="w-full border-2 border-white bg-white text-black uppercase hover:bg-neutral-200"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                        }}
                      >
                        {isSearchingPharmacy ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Search Pharmacies
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Pharmacy Results */}
                  {pharmacyResults.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-foreground text-sm font-medium">
                          Available Locations ({pharmacyResults.length})
                        </h4>
                        {pharmacyResults.length > 0 &&
                          pharmacyResults[0]?.osmData && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              🌍 OpenStreetMap data
                            </span>
                          )}
                      </div>
                      <div className="max-h-64 space-y-3 overflow-y-auto">
                        {pharmacyResults.map((pharmacy, index) => (
                          <div
                            key={index}
                            className="bg-muted/50 rounded-lg border p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h5 className="text-foreground font-semibold">
                                    {pharmacy.name}
                                  </h5>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      pharmacy.type === "hospital"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    }`}
                                  >
                                    {pharmacy.type === "hospital"
                                      ? "Hospital"
                                      : "Pharmacy"}
                                  </span>
                                </div>

                                <div className="mt-2 space-y-1">
                                  <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                                    <MapPin className="h-4 w-4" />
                                    <span>{pharmacy.address}</span>
                                  </div>

                                  <div className="space-y-1 text-sm">
                                    <div className="text-muted-foreground flex items-center space-x-1">
                                      <Phone className="h-4 w-4" />
                                      <span>{pharmacy.phone}</span>
                                    </div>
                                    <div className="text-muted-foreground flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{pharmacy.hours}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-4 text-right">
                                <div className="text-primary mb-1 text-sm font-medium">
                                  {pharmacy.distance}
                                </div>
                                <div
                                  className={`mb-2 rounded-full px-2 py-1 text-xs font-medium ${
                                    pharmacy.availability === "In Stock"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : pharmacy.availability ===
                                          "Limited Stock"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  }`}
                                >
                                  {pharmacy.availability}
                                </div>
                                {(pharmacy.availability === "In Stock" ||
                                  pharmacy.availability ===
                                    "Limited Stock") && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openPickupRequestModal(
                                        pharmacy,
                                        pharmacySearch.medication,
                                      )
                                    }
                                    className="w-full"
                                  >
                                    <Send className="mr-1 h-3 w-3" />
                                    Request Pickup
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPharmacyResults([]);
                            setPharmacySearch({ medication: "", location: "" });
                          }}
                        >
                          Clear Results
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* No Results Found */}
                  {pharmacyResults.length === 0 &&
                    !isSearchingPharmacy &&
                    pharmacySearch.medication &&
                    hasSearchedPharmacy && (
                      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/50">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                              No pharmacies found for this location
                            </h4>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                              Use a valid US ZIP code (e.g., 10036) or city,
                              state format (e.g., Philadelphia, PA). City names
                              must be followed by a comma and state name or
                              abbreviation.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Active Pickup Requests */}
                  {pickupRequests.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-foreground mb-3 text-sm font-medium">
                        Active Pickup Requests ({pickupRequests.length})
                      </h4>
                      <div className="space-y-3">
                        {pickupRequests.map((request) => (
                          <div
                            key={request.id}
                            className="bg-muted/30 rounded-lg border p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h5 className="text-foreground font-semibold">
                                    {request.medication}
                                  </h5>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      request.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                        : request.status === "confirmed"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                          : request.status === "ready"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                    }`}
                                  >
                                    {request.status.charAt(0).toUpperCase() +
                                      request.status.slice(1)}
                                  </span>
                                </div>
                                <div className="text-muted-foreground mt-1 text-sm">
                                  <div>
                                    Pharmacy:{" "}
                                    <span className="text-foreground font-medium">
                                      {request.pharmacyName}
                                    </span>
                                  </div>
                                  <div>
                                    Patient:{" "}
                                    <span className="text-foreground font-medium">
                                      {request.patientName}
                                    </span>
                                  </div>
                                  {request.dosage && (
                                    <div>
                                      Dosage:{" "}
                                      <span className="text-foreground font-medium">
                                        {request.dosage}
                                      </span>
                                    </div>
                                  )}
                                  {request.schedule && (
                                    <div>
                                      Schedule:{" "}
                                      <span className="text-foreground font-medium">
                                        {request.schedule}
                                      </span>
                                    </div>
                                  )}
                                  {request.additionalNotes && (
                                    <div className="mt-2">
                                      <div className="text-muted-foreground text-xs">
                                        Doctor's Notes:
                                      </div>
                                      <div className="text-foreground bg-muted/50 mt-1 rounded p-2 text-xs">
                                        {request.additionalNotes}
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-2 text-xs">
                                    <div>
                                      Requested:{" "}
                                      {request.requestedAt.toLocaleString()}
                                    </div>
                                    <div>
                                      Estimated Ready:{" "}
                                      {request.estimatedReady.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                {request.status === "pending" && (
                                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                                    <span className="text-xs">
                                      Processing...
                                    </span>
                                  </div>
                                )}
                                {request.status === "confirmed" && (
                                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs">Confirmed</span>
                                  </div>
                                )}
                                {request.status === "ready" && (
                                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs">
                                      Ready for Pickup
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Care Plans */}
            <Card 
              className="border-2 border-white overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <Calendar className="h-5 w-5 text-white" />
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
                    className="h-5 w-5 border-2 border-white bg-transparent text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                  />
                  <Label 
                    className="text-lg text-white font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    DNR (Do Not Resuscitate)
                  </Label>
                </div>
                <div>
                  <Label 
                    className="text-white font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Preventive Care
                  </Label>
                  <Textarea
                    value={patientData.preventiveCare}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        preventiveCare: e.target.value,
                      }))
                    }
                    className="h-24 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                    placeholder="Preventive care plans, screenings, follow-ups..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card 
              className="border-2 border-white overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <Upload className="h-5 w-5 text-white" />
                  <span>Lab Work & File Uploads</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div 
                  className="border-2 border-white border-dashed p-8 text-center transition-colors hover:border-opacity-80 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  <Upload className="text-white mx-auto mb-4 h-12 w-12" />
                  <div 
                    className="text-white mb-2 font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Upload Lab Results
                  </div>
                  <div 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Bloodwork, X-rays, Genetic tests, Medical documents
                  </div>
                  {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                    <div 
                      className="mt-4 overflow-hidden"
                      style={{ 
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace'
                      }}
                    >
                      <CldUploadButton
                        className="inline-flex h-10 items-center justify-center px-4 py-2 text-sm font-medium transition-colors border-2 border-white bg-white text-black uppercase hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
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
                          (results.info as CloudinaryUploadWidgetInfo)
                            .secure_url;
                        setPatientData((prev) => ({
                          ...prev,
                          uploadedFiles: [...prev.uploadedFiles, secureUrl],
                        }));
                      }}
                    >
                      Choose Files
                    </CldUploadButton>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                        <div className="text-sm text-yellow-800">
                          <strong>File Upload Unavailable</strong>
                        </div>
                        <div className="mt-1 text-xs text-yellow-700">
                          Cloudinary credentials not configured. Please set
                          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
                          NEXT_PUBLIC_CLOUDINARY_API_KEY in your environment
                          variables.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DICOM ZIP Upload Section */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="dicom-zip-upload"
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      DICOM Series (ZIP file containing DCM slices)
                    </Label>
                    <Input
                      id="dicom-zip-upload"
                      type="file"
                      accept=".zip"
                      onChange={handleDicomZipUpload}
                      disabled={dicomUploading}
                      className="mt-1 border-2 border-white bg-transparent text-white file:bg-white file:text-black file:border-0 file:mr-4 file:py-1 file:px-2 file:rounded-sm"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a ZIP file containing DICOM slices. Files can be:
                      <br />• .dcm or .dicom files
                      <br />• Files without extensions (common for DICOM)
                      <br />• Numeric names like "1", "2", "3" etc.
                      <br />• Any files larger than 1KB that contain DICOM data
                    </p>
                    {zipProcessing && (
                      <p className="mt-2 text-sm text-orange-600">
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
                              <span>
                                Progress: {uploadProgress.current} of{" "}
                                {uploadProgress.total}
                              </span>
                              <span>
                                {Math.round(
                                  (uploadProgress.current /
                                    uploadProgress.total) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{
                                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs">
                              {uploadProgress.fileName && (
                                <p className="mr-2 flex-1 truncate text-gray-500">
                                  Uploading: {uploadProgress.fileName}
                                </p>
                              )}
                              {uploadProgress.current > 0 &&
                                uploadProgress.startTime > 0 && (
                                  <p className="whitespace-nowrap text-gray-400">
                                    {(() => {
                                      const elapsed =
                                        (Date.now() -
                                          uploadProgress.startTime) /
                                        1000;
                                      const rate =
                                        uploadProgress.current / elapsed;
                                      const remaining =
                                        (uploadProgress.total -
                                          uploadProgress.current) /
                                        rate;
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
                            className="bg-muted hover:bg-muted/80 rounded-lg border p-4 transition-colors"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {series.seriesName}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                    {series.modality}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {series.files.length} slice
                                    {series.files.length !== 1 ? "s" : ""}
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
                            <div className="text-muted-foreground text-xs">
                              Files:{" "}
                              {series.files
                                .slice(0, 3)
                                .map((f) => f.name)
                                .join(", ")}
                              {series.files.length > 3 &&
                                ` ... +${series.files.length - 3} more`}
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
            <Card 
              className="border-2 border-white overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <FileText className="h-5 w-5 text-white" />
                  <span>Smart Notes (Auto-fill Ready)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div 
                  className="mb-4 border-2 border-white p-4 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <div 
                    className="text-white mb-2 text-sm font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    💡 AI-Powered Feature
                  </div>
                  <div 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Type, paste, or use voice input to add raw medical notes
                    here. The system will automatically parse and categorize
                    this information into the appropriate sections below.
                  </div>
                </div>
                <Textarea
                  value={smartNotes}
                  onChange={(e) => setSmartNotes(e.target.value)}
                  className="h-40 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
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
                      className="border-2 border-white bg-transparent text-white uppercase hover:bg-white hover:text-black"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                      }}
                    >
                      Clear Notes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical History Section */}
            <Card className="border">
              <CardHeader className="border-b-2 border-white">
                <CardTitle 
                  className="text-white flex items-center space-x-2 font-black uppercase tracking-wide drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  <Heart className="h-5 w-5 text-white" />
                  <span>Medical History & Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Social History */}
                <div className="space-y-4">
                  <h3 
                    className="text-white border-b-2 border-white pb-2 text-lg font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Social History
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label 
                        className="text-white font-black uppercase drop-shadow-lg"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        Smoking
                      </Label>
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
                        className="h-20 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                        }}
                        placeholder="Smoking history..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label 
                        className="text-white font-black uppercase drop-shadow-lg"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        Drugs
                      </Label>
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
                        className="h-20 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                        }}
                        placeholder="Drug history..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label 
                        className="text-white font-black uppercase drop-shadow-lg"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        Alcohol
                      </Label>
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
                        className="h-20 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                        }}
                        placeholder="Alcohol history..."
                      />
                    </div>
                  </div>
                </div>

                {/* Past Conditions */}
                <div className="space-y-4">
                  <h3 
                    className="text-white border-b-2 border-white pb-2 text-lg font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                    <Button 
                      onClick={addCondition}
                      className="border-2 border-white bg-white text-black uppercase hover:bg-neutral-200"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
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
                  <h3 
                    className="text-white border-b-2 border-white pb-2 text-lg font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                    <Button 
                      onClick={addImmunization}
                      className="border-2 border-white bg-white text-black uppercase hover:bg-neutral-200"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
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
                  <h3 
                    className="text-white border-b-2 border-white pb-2 text-lg font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
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
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                    <Button 
                      onClick={addFamilyHistory}
                      className="border-2 border-white bg-white text-black uppercase hover:bg-neutral-200"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
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
                  <h3 
                    className="text-white border-b-2 border-white pb-2 text-lg font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
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
                      className="h-24 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                      placeholder="List all known allergies, reactions, and severity..."
                    />
                  </div>
                </div>

                {/* General Notes */}
                <div className="space-y-4">
                  <h3 
                    className="text-white border-b-2 border-white pb-2 text-lg font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
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
                      className="h-32 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                      placeholder="General progress notes, observations, care instructions..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Pickup Request Modal */}
      {pickupRequestModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div 
            className="mx-4 w-full max-w-md border-2 border-white p-6 shadow-lg overflow-hidden"
            style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          >
            <div className="mb-4">
              <h3 
                className="text-white text-lg font-black uppercase drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                Request Medication Pickup
              </h3>
              <p 
                className="text-neutral-300 text-sm drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                Send a pickup request to {pickupRequestModal.pharmacy?.name}
              </p>
            </div>

            <div className="space-y-4">
              {/* Medication and Pharmacy Info */}
              <div className="bg-muted rounded-lg border p-4">
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    Medication: {pickupRequestModal.medication}
                  </div>
                  <div className="text-muted-foreground">
                    Pharmacy: {pickupRequestModal.pharmacy?.name}
                  </div>
                  <div className="text-muted-foreground">
                    Address: {pickupRequestModal.pharmacy?.address}
                  </div>
                  <div className="text-muted-foreground">
                    Phone: {pickupRequestModal.pharmacy?.phone}
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label 
                    className="text-white font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Patient Name *
                  </Label>
                  <Input
                    value={pickupRequestForm.patientName}
                    onChange={(e) =>
                      setPickupRequestForm((prev) => ({
                        ...prev,
                        patientName: e.target.value,
                      }))
                    }
                    placeholder="Enter patient's full name"
                    className="w-full border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Dosage
                    </Label>
                    <Input
                      value={pickupRequestForm.dosage}
                      onChange={(e) =>
                        setPickupRequestForm((prev) => ({
                          ...prev,
                          dosage: e.target.value,
                        }))
                      }
                      placeholder="e.g., 10mg"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      className="text-white font-black uppercase drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Schedule
                    </Label>
                    <Input
                      value={pickupRequestForm.schedule}
                      onChange={(e) =>
                        setPickupRequestForm((prev) => ({
                          ...prev,
                          schedule: e.target.value,
                        }))
                      }
                      placeholder="e.g., 2x daily"
                      className="border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label 
                    className="text-white font-black uppercase drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    value={pickupRequestForm.additionalNotes}
                    onChange={(e) =>
                      setPickupRequestForm((prev) => ({
                        ...prev,
                        additionalNotes: e.target.value,
                      }))
                    }
                    className="h-20 resize-none border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                    placeholder="Add any special instructions, dosage modifications, or notes for the pharmacy..."
                  />
                </div>
              </div>

              {!pickupRequestForm.patientName.trim() && (
                <div className="flex items-center space-x-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/50">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-300">
                    Please enter the patient's name before sending the request.
                  </span>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPickupRequestModal({
                      isOpen: false,
                      pharmacy: null,
                      medication: "",
                      dosage: "",
                      schedule: "",
                    });
                    setPickupRequestForm({
                      patientName: "",
                      dosage: "",
                      schedule: "",
                      additionalNotes: "",
                    });
                  }}
                  className="border-2 border-white bg-transparent text-white uppercase hover:bg-white hover:text-black"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitPickupRequest}
                  disabled={!pickupRequestForm.patientName.trim()}
                  className="border-2 border-white bg-white text-black uppercase hover:bg-neutral-200"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
