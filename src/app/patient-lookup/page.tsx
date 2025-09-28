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
  const searchPatients = async (query: string, type: 'id' | 'name'): Promise<PatientSearchResult[]> => {
    try {
      const response = await fetch('/api/patients/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type }),
      });

      if (!response.ok) {
        console.error('Search request failed with status:', response.status);
        return [];
      }

      const result = await response.json();
      
      if (result.success && result.patients) {
        return result.patients;
      } else {
        console.error('Search failed:', result.error ?? 'Unknown error');
        return [];
      }
    } catch (error) {
      console.error('Error searching patients:', error);
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
              const searchResults = await searchPatients(result.name, 'name');
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
      const results = await searchPatients(patientIdSearch, 'id');
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching by patient ID:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNameSearch = async () => {
    if (!nameSearch.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchPatients(nameSearch, 'name');
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching by name:', error);
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
    
    console.log(`💾 Patient Lookup: Stored in sessionStorage:`, JSON.stringify(patient));

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-l-4 border-foreground pl-6">
          <h1 
            className="mb-3 text-4xl font-black uppercase tracking-tight text-foreground drop-shadow-lg"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
              textShadow: 'none'
            }}
          >
            Patient Lookup
          </h1>
          <p 
            className="text-lg text-muted-foreground drop-shadow-lg"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
              textShadow: 'none'
            }}
          >
            Scan an ID, search by patient ID, or search by name to access
            patient records
          </p>
        </div>

        {/* Search Tabs */}
        <Tabs defaultValue="scan" className="mb-8">
          <TabsList 
            className="grid w-full grid-cols-3 border-2 border-foreground p-1 overflow-hidden"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <TabsTrigger 
              value="scan" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black uppercase text-xs tracking-wide border-none"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace' }}
            >
              <Camera className="h-4 w-4" />
              ID Scan
            </TabsTrigger>
            <TabsTrigger 
              value="id" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black uppercase text-xs tracking-wide border-none"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace' }}
            >
              <Search className="h-4 w-4" />
              Patient ID
            </TabsTrigger>
            <TabsTrigger 
              value="name" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black uppercase text-xs tracking-wide border-none"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace' }}
            >
              <User className="h-4 w-4" />
              Name Search
            </TabsTrigger>
          </TabsList>

          {/* ID Scan Tab */}
          <TabsContent value="scan">
            <Card 
              className="border-2 border-foreground shadow-none overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle 
                  className="flex items-center gap-2 font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
                  <Camera className="h-5 w-5" />
                  Scan Patient ID
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
                  <div 
                    className="border-2 border-foreground p-4 overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-foreground" />
                      <span 
                        className="font-black text-foreground uppercase drop-shadow-lg"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: 'none'
                        }}
                      >
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
            <Card 
              className="border-2 border-foreground shadow-none overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle 
                  className="flex items-center gap-2 font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
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
                    className="border-2 border-foreground bg-transparent text-foreground placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  />
                  <Button
                    onClick={handlePatientIdSearch}
                    disabled={isSearching || !patientIdSearch.trim()}
                    className="border-2 border-foreground bg-white text-black uppercase hover:bg-neutral-200"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
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
            <Card 
              className="border-2 border-foreground shadow-none overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardHeader className="border-b-2 border-foreground">
                <CardTitle 
                  className="flex items-center gap-2 font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
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
                    className="border-2 border-foreground bg-transparent text-foreground placeholder:text-neutral-400"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  />
                  <Button
                    onClick={handleNameSearch}
                    disabled={isSearching || !nameSearch.trim()}
                    className="border-2 border-foreground bg-white text-black uppercase hover:bg-neutral-200"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
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
          <Card 
            className="border-2 border-foreground shadow-none overflow-hidden"
            style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          >
            <CardHeader className="border-b-2 border-foreground">
              <CardTitle 
                className="font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: 'none'
                }}
              >
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between border-2 border-foreground p-4 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex h-12 w-12 items-center justify-center border-2 border-foreground overflow-hidden"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
                      >
                        <User className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <div 
                          className="font-black text-foreground uppercase tracking-wide drop-shadow-lg"
                          style={{ 
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                            textShadow: 'none'
                          }}
                        >
                          {patient.name}
                        </div>
                        <div 
                          className="text-muted-foreground text-sm drop-shadow-lg"
                          style={{ 
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                            textShadow: 'none'
                          }}
                        >
                          ID: {patient.patientId} • DOB: {patient.dob} •{" "}
                          {patient.sex}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {patient.bloodType && (
                        <Badge 
                          className="border-2 border-foreground bg-transparent text-foreground uppercase"
                          style={{ 
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                          }}
                        >
                          {patient.bloodType}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-2 border-foreground bg-transparent text-foreground uppercase hover:bg-white hover:text-black"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                        }}
                        onClick={() => goToDashboard(patient)}
                      >
                        Go to Dashboard
                      </Button>
                      <Button 
                        size="sm" 
                        className="border-2 border-foreground bg-white text-black uppercase hover:bg-neutral-200"
                        style={{ 
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                        }}
                        onClick={() => selectPatient(patient)}
                      >
                        Patient Assessment
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
            <Card 
              className="border-2 border-foreground shadow-none overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <CardContent className="py-8 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p 
                  className="mb-2 text-lg font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
                  No patients found
                </p>
                <p 
                  className="text-muted-foreground drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
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
