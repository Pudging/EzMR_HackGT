"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CameraCapture } from "@/components/ui/camera-capture";
import {
  Search,
  Camera,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface PatientSearchResult {
  id: string;
  name: string;
  patientId: string;
  dob: string;
  sex: string;
  bloodType?: string;
}

export default function PatientLookupPage() {
  const router = useRouter();
  const [patientIdSearch, setPatientIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Search function to query the database
  const searchPatients = async (
    query: string,
    type: "id" | "name",
  ): Promise<PatientSearchResult[]> => {
    try {
      const response = await fetch("/api/patients/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, type }),
      });

      if (!response.ok) {
        console.error("Search request failed with status:", response.status);
        return [];
      }

      const result = await response.json();

      if (result.success && result.patients) {
        return result.patients;
      } else {
        console.error("Search failed:", result.error ?? "Unknown error");
        return [];
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      return [];
    }
  };

  const handleImageCapture = async (imageBlob: Blob) => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      console.log("Processing image blob:", imageBlob.size, imageBlob.type);

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          console.log("Base64 conversion complete, length:", base64.length);

          // Call API to process ID with Gemini
          const response = await fetch("/api/scan-id", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64 }),
          });

          console.log("API response status:", response.status);
          const result = await response.json();
          console.log("API result:", result);

          if (result.success) {
            setScanResult(result.name);
            console.log("Searching for patients matching:", result.name);

            // Search for patient by extracted name using the database
            try {
              const searchResults = await searchPatients(result.name, "name");
              console.log("Matching patients found:", searchResults);
              setSearchResults(searchResults);
            } catch (error) {
              console.error("Error searching patients:", error);
              setScanError("Failed to search for patients");
            }
          } else {
            setScanError(result.error ?? "Failed to scan ID");
          }
        } catch (apiError) {
          console.error("API call error:", apiError);
          setScanError("Failed to connect to scanning service");
        } finally {
          setIsScanning(false);
        }
      };

      reader.onerror = () => {
        setScanError("Failed to process image file");
        setIsScanning(false);
      };

      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error("Error scanning ID:", error);
      setScanError("Error processing image");
      setIsScanning(false);
    }
  };

  const handlePatientIdSearch = async () => {
    if (!patientIdSearch.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchPatients(patientIdSearch, "id");
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching by patient ID:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNameSearch = async () => {
    if (!nameSearch.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchPatients(nameSearch, "name");
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching by name:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient: PatientSearchResult) => {
    // Store selected patient in sessionStorage for access by other pages
    sessionStorage.setItem("selectedPatient", JSON.stringify(patient));

    // Navigate to patient assessment with patient ID
    router.push(`/patient-assessment?patientId=${patient.patientId}`);
  };

  const goToDashboard = (patient: PatientSearchResult) => {
    console.log(`🚀 Patient Lookup: Going to dashboard with patient:`, patient);

    // Store selected patient in sessionStorage for access by other pages
    sessionStorage.setItem("selectedPatient", JSON.stringify(patient));

    console.log(
      `💾 Patient Lookup: Stored in sessionStorage:`,
      JSON.stringify(patient),
    );

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground brutalist-text-shadow mb-6 text-5xl font-black tracking-tighter uppercase">
            PATIENT LOOKUP
          </h1>
          <div className="bg-secondary mx-auto max-w-3xl -rotate-1 transform border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-secondary-foreground font-bold tracking-wide uppercase">
              SCAN AN ID, SEARCH BY PATIENT ID, OR SEARCH BY NAME TO ACCESS
              PATIENT RECORDS
            </p>
          </div>
        </div>

        {/* Search Tabs */}
        <Tabs defaultValue="scan" className="mb-8">
          <TabsList className="bg-secondary grid w-full grid-cols-3 border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <TabsTrigger
              value="scan"
              className="flex items-center gap-2 border-2 border-transparent font-black tracking-wider uppercase data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:data-[state=active]:border-white dark:data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              <Camera className="h-5 w-5" />
              ID SCAN
            </TabsTrigger>
            <TabsTrigger
              value="id"
              className="flex items-center gap-2 border-2 border-transparent font-black tracking-wider uppercase data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:data-[state=active]:border-white dark:data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              <Search className="h-5 w-5" />
              PATIENT ID
            </TabsTrigger>
            <TabsTrigger
              value="name"
              className="flex items-center gap-2 border-2 border-transparent font-black tracking-wider uppercase data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:data-[state=active]:border-white dark:data-[state=active]:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              <User className="h-5 w-5" />
              NAME SEARCH
            </TabsTrigger>
          </TabsList>

          {/* ID Scan Tab */}
          <TabsContent value="scan">
            <Card className="brutalist-card">
              <CardHeader>
                <CardTitle className="brutalist-text-shadow flex items-center gap-3 text-2xl font-black tracking-tight uppercase">
                  <div className="bg-primary text-primary-foreground border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <Camera className="h-6 w-6" />
                  </div>
                  SCAN PATIENT ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CameraCapture
                  onImageCapture={handleImageCapture}
                  isProcessing={isScanning}
                  error={scanError}
                  onError={setScanError}
                />

                {scanResult && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Extracted Name: {scanResult}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient ID Search Tab */}
          <TabsContent value="id">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search by Patient ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Patient ID (e.g., 1, 2, 3)"
                    value={patientIdSearch}
                    onChange={(e) => setPatientIdSearch(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handlePatientIdSearch()
                    }
                  />
                  <Button
                    onClick={handlePatientIdSearch}
                    disabled={isSearching || !patientIdSearch.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Name Search Tab */}
          <TabsContent value="name">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Search by Name
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter patient name (e.g., Kevin, John, Sarah)"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleNameSearch()}
                  />
                  <Button
                    onClick={handleNameSearch}
                    disabled={isSearching || !nameSearch.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="brutalist-card">
            <CardHeader>
              <CardTitle className="brutalist-text-shadow text-2xl font-black tracking-tight uppercase">
                SEARCH RESULTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {searchResults.map((patient, index) => (
                  <div
                    key={patient.id}
                    className={`brutalist-card flex transform items-center justify-between p-6 transition-all duration-200 hover:translate-x-[-8px] hover:translate-y-[-8px] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] ${
                      index % 2 === 0 ? "rotate-1" : "-rotate-1"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="brutalist-text-shadow text-xl font-black tracking-tight uppercase">
                          {patient.name}
                        </div>
                        <div className="text-muted-foreground font-bold tracking-wider uppercase">
                          ID: {patient.patientId} • DOB: {patient.dob} •{" "}
                          {patient.sex.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {patient.bloodType && (
                        <div className="bg-secondary text-secondary-foreground border-2 border-black px-3 py-1 font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                          {patient.bloodType}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => goToDashboard(patient)}
                        className="brutalist-button"
                      >
                        GO TO DASHBOARD
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => selectPatient(patient)}
                        className="brutalist-button"
                      >
                        PATIENT ASSESSMENT
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searchResults.length === 0 &&
          (patientIdSearch || nameSearch || scanResult) &&
          !isSearching && (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="mb-2 text-lg font-medium">No patients found</p>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or verify the patient
                  information
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
