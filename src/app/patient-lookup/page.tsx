"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CameraCapture } from '@/components/ui/camera-capture';
import { 
  Search, 
  Camera, 
  User,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
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

      const result = await response.json();
      
      if (result.success) {
        return result.patients;
      } else {
        console.error('Search failed:', result.error);
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
      console.log('Processing image blob:', imageBlob.size, imageBlob.type);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          console.log('Base64 conversion complete, length:', base64.length);
          
          // Call API to process ID with Gemini
          const response = await fetch('/api/scan-id', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64 }),
          });

          console.log('API response status:', response.status);
          const result = await response.json();
          console.log('API result:', result);
          
          if (result.success) {
            setScanResult(result.name);
            console.log('Searching for patients matching:', result.name);
            
            // Search for patient by extracted name using database
            const matchingPatients = await searchPatients(result.name, 'name');
            
            console.log('Matching patients found:', matchingPatients.map(p => p.name));
            setSearchResults(matchingPatients);
          } else {
            setScanError(result.error ?? 'Failed to scan ID');
          }
        } catch (apiError) {
          console.error('API call error:', apiError);
          setScanError('Failed to connect to scanning service');
        } finally {
          setIsScanning(false);
        }
      };
      
      reader.onerror = () => {
        setScanError('Failed to process image file');
        setIsScanning(false);
      };
      
      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error('Error scanning ID:', error);
      setScanError('Error processing image');
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
    sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
    
    // Navigate to patient assessment with patient ID
    router.push(`/patient-assessment?patientId=${patient.patientId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Patient Lookup
          </h1>
          <p className="text-muted-foreground">
            Scan an ID, search by patient ID, or search by name to access patient records
          </p>
        </div>

        {/* Search Tabs */}
        <Tabs defaultValue="scan" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              ID Scan
            </TabsTrigger>
            <TabsTrigger value="id" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Patient ID
            </TabsTrigger>
            <TabsTrigger value="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name Search
            </TabsTrigger>
          </TabsList>

          {/* ID Scan Tab */}
          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
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
                    onKeyPress={(e) => e.key === 'Enter' && handlePatientIdSearch()}
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
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSearch()}
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
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => selectPatient(patient)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {patient.patientId} • DOB: {patient.dob} • {patient.sex}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {patient.bloodType && (
                        <Badge variant="outline">{patient.bloodType}</Badge>
                      )}
                      <Button size="sm">
                        Select Patient
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searchResults.length === 0 && (patientIdSearch || nameSearch || scanResult) && !isSearching && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No patients found</p>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or verify the patient information
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
