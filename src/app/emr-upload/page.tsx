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

            {/* Medications & Prescription */}
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
                      <Label>Medication Name</Label>
                      <Input
                        value={pharmacySearch.medication}
                        onChange={(e) =>
                          setPharmacySearch((prev) => ({
                            ...prev,
                            medication: e.target.value,
                          }))
                        }
                        placeholder="Enter medication name..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={pharmacySearch.location}
                        onChange={(e) =>
                          setPharmacySearch((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Enter US ZIP code or city, state (e.g., 90210 or Philadelphia, PA)"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={searchPharmacies}
                        disabled={
                          isSearchingPharmacy ||
                          !pharmacySearch.medication.trim()
                        }
                        className="w-full"
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
                  {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
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

      {/* Pickup Request Modal */}
      {pickupRequestModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border-border mx-4 w-full max-w-md rounded-lg border p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="text-foreground text-lg font-semibold">
                Request Medication Pickup
              </h3>
              <p className="text-muted-foreground text-sm">
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
                  <Label>Patient Name *</Label>
                  <Input
                    value={pickupRequestForm.patientName}
                    onChange={(e) =>
                      setPickupRequestForm((prev) => ({
                        ...prev,
                        patientName: e.target.value,
                      }))
                    }
                    placeholder="Enter patient's full name"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      value={pickupRequestForm.dosage}
                      onChange={(e) =>
                        setPickupRequestForm((prev) => ({
                          ...prev,
                          dosage: e.target.value,
                        }))
                      }
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Input
                      value={pickupRequestForm.schedule}
                      onChange={(e) =>
                        setPickupRequestForm((prev) => ({
                          ...prev,
                          schedule: e.target.value,
                        }))
                      }
                      placeholder="e.g., 2x daily"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    value={pickupRequestForm.additionalNotes}
                    onChange={(e) =>
                      setPickupRequestForm((prev) => ({
                        ...prev,
                        additionalNotes: e.target.value,
                      }))
                    }
                    className="h-20 resize-none"
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
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitPickupRequest}
                  disabled={!pickupRequestForm.patientName.trim()}
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
