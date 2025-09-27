"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { useSearch } from "@/hooks/use-search";
import { usePatientData } from "@/hooks/usePatientData";
import { AISearchBox } from "@/components/ui/ai-search-box";
import { ModernDicomViewer } from "@/components/medical/modern-dicom-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLoadingAnimation } from "@/components/ui/dashboard-loading-animation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  Bell,
  Plus,
  BarChart3,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Droplets,
  Eye,
  Download,
  Printer,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Users,
  FileDigit,
  Shield,
  ArrowLeft,
  AlertCircle,
  Monitor,
  Upload,
} from "lucide-react";

interface SelectedPatient {
  id: string;
  name: string;
  patientId: string;
  dob: string;
  sex: string;
  bloodType?: string;
}

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDicomFile, setSelectedDicomFile] = useState<{
    images: Array<{ name: string; url: string }>;
    name: string;
    modality: string;
    description?: string;
  } | null>(null);

  // Helper function to get color for DICOM modality
  const getModalityColor = (modality: string) => {
    switch (modality.toUpperCase()) {
      case "CT":
        return "text-blue-500";
      case "MRI":
        return "text-green-500";
      case "XRAY":
        return "text-purple-500";
      case "ULTRASOUND":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };
  const [selectedPatient, setSelectedPatient] =
    useState<SelectedPatient | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const {
    currentMatch,
    totalMatches,
    isSearching,
    performSearch,
    navigateToMatch,
    clearSearch,
  } = useSearch();

  // Load full patient data
  const {
    patientData,
    loading: patientDataLoading,
    error: patientDataError,
  } = usePatientData(selectedPatient?.patientId ?? "");

  useEffect(() => {
    // Check for selected patient in sessionStorage or URL params
    const patientFromStorage = sessionStorage.getItem("selectedPatient");
    const patientIdFromUrl = searchParams.get("patientId");

    console.log(`🔍 Dashboard: Looking for patient data`);
    console.log(`📦 From sessionStorage:`, patientFromStorage);
    console.log(`🔗 From URL:`, patientIdFromUrl);

    if (patientFromStorage) {
      const patient = JSON.parse(patientFromStorage);
      console.log(`✅ Dashboard: Selected patient from storage:`, patient);
      setSelectedPatient(patient);
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
        },
      ];

      const patient = mockPatients.find(
        (p) => p.patientId === patientIdFromUrl,
      );
      if (patient) {
        setSelectedPatient(patient);
        sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
      }
    }
  }, [searchParams]);

  const handleLoadingComplete = () => {
    setIsInitialLoading(false);
  };

  // Redirect to patient lookup if no patient selected
  if (!selectedPatient) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="brutalist-card mx-4 max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <CardTitle className="brutalist-text-shadow">
              NO PATIENT SELECTED
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground font-bold tracking-wide uppercase">
              PLEASE SELECT A PATIENT BEFORE ACCESSING THE DASHBOARD.
            </p>
            <Button
              onClick={() => router.push("/patient-lookup")}
              className="brutalist-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              GO TO PATIENT LOOKUP
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show initial loading animation
  if (isInitialLoading) {
    return (
      <DashboardLoadingAnimation
        onComplete={handleLoadingComplete}
        duration={4000}
        patientName={selectedPatient?.name ?? "Patient"}
      />
    );
  }

  // Show loading state while patient data loads
  if (patientDataLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="brutalist-card mx-4 max-w-md">
          <CardContent className="py-8 text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin border-8 border-black border-t-transparent dark:border-white"></div>
            <p className="text-muted-foreground font-bold tracking-wide uppercase">
              LOADING PATIENT DATA...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if patient data failed to load
  if (patientDataError || !patientData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="brutalist-card mx-4 max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <CardTitle className="brutalist-text-shadow">
              ERROR LOADING PATIENT DATA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground font-bold tracking-wide uppercase">
              {patientDataError ?? "FAILED TO LOAD PATIENT INFORMATION"}
            </p>
            <Button
              onClick={() => router.push("/patient-lookup")}
              className="brutalist-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK TO PATIENT LOOKUP
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <header className="bg-background border-b-8 border-black shadow-[0_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[0_8px_0px_0px_rgba(255,255,255,1)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary flex h-12 w-12 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <Stethoscope className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground brutalist-text-shadow text-xl font-black tracking-tight uppercase">
                  PATIENT DASHBOARD - {selectedPatient.name.toUpperCase()}
                </h1>
                <p className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                  ID: {selectedPatient.patientId} • DOB: {selectedPatient.dob} •{" "}
                  {selectedPatient.sex.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar
                onSearch={performSearch}
                onClear={clearSearch}
                onNavigate={navigateToMatch}
                currentMatch={currentMatch}
                totalMatches={totalMatches}
                isSearching={isSearching}
              />
              <Button
                variant="outline"
                onClick={() => router.push("/patient-lookup")}
                className="brutalist-button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                CHANGE PATIENT
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Patient Information Header */}
        <div className="bg-card brutalist-card mb-8">
          <div className="border-b-4 border-black px-6 py-4 dark:border-white">
            <div className="flex items-center justify-between">
              <h2 className="text-card-foreground brutalist-text-shadow text-2xl font-black tracking-tight uppercase">
                PATIENT INFORMATION
              </h2>
              <div className="bg-primary text-primary-foreground flex items-center space-x-3 border-2 border-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
                <FileDigit className="h-5 w-5" />
                <span className="text-sm font-black tracking-wider uppercase">
                  MRN: {patientData.patientId}
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3">
            {/* Patient Photo and All Information */}
            <div className="mb-4 flex flex-col gap-6 lg:flex-row">
              {/* Patient Photo */}
              <div className="flex justify-center lg:justify-start">
                <div className="group relative">
                  <div className="border-muted bg-muted hover:border-primary flex h-[326px] w-[298px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 shadow-sm transition-colors">
                    <div className="bg-primary/10 mb-2 flex h-36 w-36 items-center justify-center rounded-full">
                      <User className="text-primary h-20 w-20" />
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs font-medium">
                        Patient Photo
                      </p>
                      <p className="text-muted-foreground text-xs">
                        ID: {patientData.patientId}
                      </p>
                    </div>
                    {/* Upload overlay */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="text-card-foreground text-center">
                        <Plus className="mx-auto mb-1 h-6 w-6" />
                        <p className="text-xs">Update Photo</p>
                      </div>
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className="border-card absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  {/* Photo info badge */}
                  <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs shadow-sm">
                    EMR
                  </div>
                </div>
              </div>

              {/* All Patient Information */}
              <div className="flex-1 space-y-4">
                {/* Basic Demographics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center space-x-3">
                    <User className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {patientData.name}
                      </p>
                      <p className="text-muted-foreground text-xs">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {patientData.dob}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Date of Birth
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {patientData.sex}
                      </p>
                      <p className="text-muted-foreground text-xs">Sex</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-start space-x-3">
                    <Phone className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        {patientData.phone ?? "Not provided"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Primary Phone
                      </p>
                      {patientData.secondaryPhone && (
                        <>
                          <p className="text-muted-foreground text-sm">
                            {patientData.secondaryPhone}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Secondary Phone
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        {patientData.address?.line1 ?? "Not provided"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {patientData.address?.line2 &&
                          `${patientData.address.line2}, `}
                        {patientData.address?.city},{" "}
                        {patientData.address?.state}{" "}
                        {patientData.address?.postalCode}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Home Address
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        {patientData.email ?? "Not provided"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Email Address
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        {patientData.insurance?.primary?.provider ??
                          "Not provided"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Policy:{" "}
                        {patientData.insurance?.primary?.policyNumber ?? "N/A"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Primary Insurance
                      </p>
                    </div>
                  </div>
                  {patientData.insurance?.secondary && (
                    <div className="flex items-start space-x-3">
                      <Shield className="text-primary mt-0.5 h-5 w-5" />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">
                          {patientData.insurance.secondary.provider}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Policy: {patientData.insurance.secondary.policyNumber}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Secondary Insurance
                        </p>
                      </div>
                    </div>
                  )}
                  {patientData.insurance?.primary?.groupNumber && (
                    <div className="flex items-start space-x-3">
                      <FileDigit className="text-primary mt-0.5 h-5 w-5" />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">
                          {patientData.insurance.primary.groupNumber}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Group Number
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Contacts */}
                <div className="border-t pt-3">
                  <h3 className="text-foreground mb-2 text-sm font-semibold">
                    Emergency Contacts
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-muted flex items-start space-x-3 rounded-lg p-2">
                      <Users className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">
                          Jane Doe (Spouse)
                        </p>
                        <p className="text-muted-foreground text-sm">
                          (555) 234-5678
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Primary Emergency
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted flex items-start space-x-3 rounded-lg p-2">
                      <Users className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">
                          Robert Smith (Brother)
                        </p>
                        <p className="text-muted-foreground text-sm">
                          (555) 345-6789
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Secondary Emergency
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted flex items-start space-x-3 rounded-lg p-2">
                      <Users className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">
                          Dr. Sarah Smith (Physician)
                        </p>
                        <p className="text-muted-foreground text-sm">
                          (555) 456-7890
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Primary Care Physician
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Clinical Search */}
        <AISearchBox
          patientData={patientData}
          onHighlightSection={(section) => {
            // Optional: Add custom highlighting logic here
            console.log("Highlighting section:", section);
          }}
        />

        {/* Past Medical History Section */}
        <div className="mb-6" id="section-pastConditions">
          {/* Past Medical History Section - Full width */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-card-foreground text-lg font-semibold">
                  Past Medical History
                </h2>
                <div className="flex items-center space-x-2">
                  <FileText className="text-primary h-4 w-4" />
                  <span className="text-primary text-sm font-medium">
                    Complete History
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Social History */}
                  <div
                    className="rounded-lg border p-3"
                    id="section-socialHistory"
                  >
                    <h3 className="text-md text-foreground mb-2 flex items-center font-semibold">
                      <Users className="text-primary mr-2 h-4 w-4" />
                      Social History
                    </h3>
                    {patientData.socialHistory ? (
                      <div className="space-y-1">
                        {patientData.socialHistory.tobacco && (
                          <div className="bg-muted flex items-center justify-between rounded p-2">
                            <span className="text-muted-foreground text-sm font-medium">
                              Smoking Status:
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {patientData.socialHistory.tobacco}
                            </span>
                          </div>
                        )}
                        {patientData.socialHistory.alcohol && (
                          <div className="bg-muted flex items-center justify-between rounded p-2">
                            <span className="text-muted-foreground text-sm font-medium">
                              Alcohol Use:
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {patientData.socialHistory.alcohol}
                            </span>
                          </div>
                        )}
                        {patientData.socialHistory.drugs && (
                          <div className="bg-muted flex items-center justify-between rounded p-2">
                            <span className="text-muted-foreground text-sm font-medium">
                              Drug Use:
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {patientData.socialHistory.drugs}
                            </span>
                          </div>
                        )}
                        {patientData.socialHistory.occupation && (
                          <div className="bg-muted flex items-center justify-between rounded p-2">
                            <span className="text-muted-foreground text-sm font-medium">
                              Occupation:
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {patientData.socialHistory.occupation}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          No social history recorded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Immunization History */}
                  <div
                    className="rounded-lg border p-3"
                    id="section-immunizations"
                  >
                    <h3 className="text-md text-foreground mb-2 flex items-center font-semibold">
                      <Shield className="text-primary mr-2 h-4 w-4" />
                      Immunization History
                    </h3>
                    {patientData.immunizations &&
                    patientData.immunizations.length > 0 ? (
                      <div className="space-y-1">
                        {patientData.immunizations.map(
                          (immunization, index) => (
                            <div
                              key={index}
                              className="bg-secondary rounded border p-2"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-foreground text-sm font-medium">
                                    {immunization.vaccine}
                                  </p>
                                  {immunization.notes && (
                                    <p className="text-muted-foreground text-xs">
                                      {immunization.notes}
                                    </p>
                                  )}
                                </div>
                                <span className="text-primary text-xs font-medium">
                                  {new Date(
                                    immunization.administeredOn,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          No immunization records
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    id="section-allergies"
                  >
                    <h3 className="text-md mb-2 flex items-center font-semibold text-gray-900 dark:text-gray-100">
                      <Bell className="mr-2 h-4 w-4 text-red-600" />
                      Allergies
                    </h3>
                    <div className="space-y-1">
                      {patientData.allergies &&
                      patientData.allergies.length > 0 ? (
                        patientData.allergies.map((allergy, index) => {
                          // Determine border and background colors based on severity
                          const getSeverityStyle = (severity: string) => {
                            switch (severity.toLowerCase()) {
                              case "severe":
                                return {
                                  border: "border-red-200 dark:border-red-800",
                                  bg: "bg-red-50 dark:bg-red-900/20",
                                  textColor: "text-red-600",
                                };
                              case "moderate":
                                return {
                                  border:
                                    "border-orange-200 dark:border-orange-800",
                                  bg: "bg-orange-50 dark:bg-orange-900/20",
                                  textColor: "text-orange-600",
                                };
                              case "mild":
                                return {
                                  border:
                                    "border-yellow-200 dark:border-yellow-800",
                                  bg: "bg-yellow-50 dark:bg-yellow-900/20",
                                  textColor: "text-yellow-600",
                                };
                              default:
                                return {
                                  border:
                                    "border-gray-200 dark:border-gray-700",
                                  bg: "bg-gray-50 dark:bg-gray-900/20",
                                  textColor: "text-gray-600",
                                };
                            }
                          };

                          const style = getSeverityStyle(allergy.severity);

                          return (
                            <div
                              key={index}
                              className={`rounded border ${style.border} ${style.bg} p-2`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {allergy.substance}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {allergy.severity} - {allergy.reaction}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs font-medium ${style.textColor}`}
                                >
                                  {allergy.notedOn
                                    ? new Date(
                                        allergy.notedOn,
                                      ).toLocaleDateString()
                                    : "Date unknown"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                No Known Allergies
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                No allergies recorded
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Past Injuries and Conditions */}
                  <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <h3 className="text-md mb-2 flex items-center font-semibold text-gray-900 dark:text-gray-100">
                      <Activity className="mr-2 h-4 w-4 text-blue-600" />
                      Past Injuries & Conditions
                    </h3>
                    {patientData.pastConditions &&
                    patientData.pastConditions.length > 0 ? (
                      <div className="space-y-1">
                        {patientData.pastConditions.map((condition, index) => (
                          <div
                            key={index}
                            className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20"
                          >
                            <div className="mb-1 flex items-start justify-between">
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {condition.bodyPart}:
                              </span>
                              <span className="text-xs font-medium text-blue-600">
                                {condition.date
                                  ? new Date(
                                      condition.date,
                                    ).toLocaleDateString()
                                  : "Unknown date"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {condition.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          No past medical conditions recorded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Family Medical History */}
                  <div
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    id="section-familyHistory"
                  >
                    <h3 className="text-md mb-2 flex items-center font-semibold text-gray-900 dark:text-gray-100">
                      <Users className="mr-2 h-4 w-4 text-purple-600" />
                      Family Medical History
                    </h3>
                    {patientData.familyHistory &&
                    patientData.familyHistory.length > 0 ? (
                      <div className="space-y-1">
                        {patientData.familyHistory.map((history, index) => (
                          <div
                            key={index}
                            className="rounded border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20"
                          >
                            <div className="mb-1 flex items-start justify-between">
                              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                {history.relation}:
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {history.condition}
                              {history.notes && ` - ${history.notes}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          No family medical history recorded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Care Plans Section */}
        <div className="mb-6">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-card-foreground text-lg font-semibold">
                  Care Plans
                </h2>
                <div className="flex items-center space-x-2">
                  <FileText className="text-primary h-4 w-4" />
                  <span className="text-primary text-sm font-medium">
                    Active Plans
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* DNRS Section */}
                <div className="rounded-lg border p-4">
                  <h3 className="text-md text-foreground mb-3 flex items-center font-semibold">
                    <Activity className="text-primary mr-2 h-5 w-5" />
                    DNRS (Dynamic Neuromuscular Rehabilitation System)
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-secondary rounded-lg border p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-foreground text-sm font-medium">
                          Current Status:
                        </span>
                        <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Started: March 15, 2024
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Progress: 8 months completed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Exercise Frequency:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Daily, 30-45 minutes
                        </span>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Current Phase:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Phase 3 - Advanced
                        </span>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Next Review:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          January 15, 2025
                        </span>
                      </div>
                    </div>

                    <div className="bg-secondary mt-3 rounded-lg border p-3">
                      <h4 className="text-foreground mb-1 text-sm font-semibold">
                        Recent Progress
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        Significant improvement in neuroplasticity exercises.
                        Patient reports 40% reduction in symptoms. Continue
                        current protocol.
                      </p>
                    </div>

                    <div className="bg-secondary mt-3 rounded-lg border p-3">
                      <h4 className="text-foreground mb-1 text-sm font-semibold">
                        Key Exercises
                      </h4>
                      <ul className="text-muted-foreground space-y-1 text-xs">
                        <li>• Limbic system retraining (20 min daily)</li>
                        <li>• Neuroplasticity exercises (15 min daily)</li>
                        <li>• Stress reduction techniques (10 min daily)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Preventive Care Section */}
                <div className="rounded-lg border p-4">
                  <h3 className="text-md text-foreground mb-3 flex items-center font-semibold">
                    <Shield className="text-primary mr-2 h-5 w-5" />
                    Preventive Care
                  </h3>
                  <div className="space-y-3">
                    {/* Upcoming Screenings */}
                    <div className="bg-secondary rounded-lg border p-3">
                      <h4 className="text-foreground mb-2 text-sm font-semibold">
                        Upcoming Screenings
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Annual Physical
                          </span>
                          <span className="text-primary text-xs font-medium">
                            Due: Dec 2025
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Blood Pressure Check
                          </span>
                          <span className="text-primary text-xs font-medium">
                            Due: Mar 2025
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Cholesterol Panel
                          </span>
                          <span className="text-primary text-xs font-medium">
                            Due: Jun 2025
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Completed Screenings */}
                    <div className="bg-secondary rounded-lg border p-3">
                      <h4 className="text-foreground mb-2 text-sm font-semibold">
                        Recently Completed
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            COVID-19 Booster
                          </span>
                          <span className="text-primary text-xs font-medium">
                            Dec 15, 2024
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Influenza Vaccine
                          </span>
                          <span className="text-primary text-xs font-medium">
                            Oct 20, 2024
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Annual Physical
                          </span>
                          <span className="text-primary text-xs font-medium">
                            Dec 10, 2024
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Health Recommendations */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                      <h4 className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
                        Health Recommendations
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <li>
                          • Maintain regular exercise routine (150 min/week)
                        </li>
                        <li>• Continue Mediterranean diet</li>
                        <li>• Annual eye examination</li>
                        <li>• Dental cleaning every 6 months</li>
                        <li>• Skin cancer screening (age 40+)</li>
                      </ul>
                    </div>

                    {/* Risk Factors */}
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <h4 className="mb-2 text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        Risk Assessment
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Family History Risk:
                          </span>
                          <span className="text-xs font-medium text-yellow-600">
                            Moderate
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Lifestyle Risk:
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            Low
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Overall Risk:
                          </span>
                          <span className="text-xs font-medium text-yellow-600">
                            Moderate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Signs Overview */}
        <div
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4"
          id="section-vitals"
        >
          <Card className="brutalist-card transform border-l-8 border-l-green-500 transition-all duration-200 hover:rotate-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-black tracking-wider uppercase">
                    BLOOD PRESSURE & TYPE
                  </p>
                  <p className="text-foreground brutalist-text-shadow text-2xl font-black">
                    {patientData.vitals?.bloodPressure
                      ? `${patientData.vitals.bloodPressure.systolic}/${patientData.vitals.bloodPressure.diastolic}`
                      : "N/A"}{" "}
                    • {patientData.bloodType ?? "N/A"}
                  </p>
                  <p className="text-xs font-black tracking-wider text-green-600 uppercase">
                    NORMAL
                  </p>
                </div>
                <div className="border-4 border-black bg-green-500 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="brutalist-card transform border-l-8 border-l-blue-500 transition-all duration-200 hover:-rotate-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-black tracking-wider uppercase">
                    HEART RATE
                  </p>
                  <p className="text-foreground brutalist-text-shadow text-2xl font-black">
                    {patientData.vitals?.heartRate ?? "N/A"} BPM
                  </p>
                  <p className="text-xs font-black tracking-wider text-blue-600 uppercase">
                    NORMAL
                  </p>
                </div>
                <div className="border-4 border-black bg-blue-500 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="brutalist-card transform border-l-8 border-l-orange-500 transition-all duration-200 hover:rotate-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-black tracking-wider uppercase">
                    TEMPERATURE
                  </p>
                  <p className="text-foreground brutalist-text-shadow text-2xl font-black">
                    {patientData.vitals?.temperature ?? "N/A"}°F
                  </p>
                  <p className="text-xs font-black tracking-wider text-orange-600 uppercase">
                    NORMAL
                  </p>
                </div>
                <div className="border-4 border-black bg-orange-500 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Thermometer className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="brutalist-card transform border-l-8 border-l-purple-500 transition-all duration-200 hover:-rotate-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-black tracking-wider uppercase">
                    WEIGHT & HEIGHT
                  </p>
                  <p className="text-foreground brutalist-text-shadow text-2xl font-black">
                    {patientData.vitals?.weight ?? "N/A"} •{" "}
                    {patientData.vitals?.height ?? "N/A"}
                  </p>
                  <p className="text-xs font-black tracking-wider text-purple-600 uppercase">
                    BMI: {patientData.vitals?.bmi ?? "N/A"}
                  </p>
                </div>
                <div className="border-4 border-black bg-purple-500 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Weight className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Assessment Section */}
        {patientData?.assessmentData &&
          Object.keys(patientData.assessmentData).length > 0 && (
            <Card className="border" id="section-assessment">
              <CardHeader className="border-b">
                <CardTitle className="text-foreground flex items-center">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Physical Assessment
                </CardTitle>
                <CardDescription>
                  Latest physical examination findings by body region
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(patientData.assessmentData).map(
                    ([bodyPart, notes]) => {
                      if (!notes || notes.trim().length === 0) return null;

                      const bodyPartLabel = bodyPart
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ");

                      return (
                        <div
                          key={bodyPart}
                          className="bg-card text-card-foreground rounded-lg border p-4"
                        >
                          <div className="mb-2 flex items-center">
                            <div className="bg-primary/10 mr-3 flex h-8 w-8 items-center justify-center rounded-lg">
                              <Activity className="text-primary h-4 w-4" />
                            </div>
                            <h4 className="text-sm font-semibold">
                              {bodyPartLabel}
                            </h4>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {notes}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
                {Object.keys(patientData.assessmentData).length === 0 && (
                  <div className="py-8 text-center">
                    <Stethoscope className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">
                      No assessment data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Medical Records Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Medical Records */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Medical Records */}
            <Card className="border">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Medical Records
                    </CardTitle>
                    <CardDescription>
                      Latest medical documents and test results
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-border divide-y">
                  {/* DICOM Files from Database */}
                  {patientData?.dicomFiles &&
                    patientData.dicomFiles.length > 0 &&
                    patientData.dicomFiles.map((dicomFile) => (
                      <div
                        key={dicomFile.id}
                        className="hover:bg-accent hover:text-accent-foreground p-4 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`${getModalityColor(dicomFile.modality)}/10 flex h-12 w-12 items-center justify-center rounded-lg`}
                            >
                              <Monitor
                                className={`${getModalityColor(dicomFile.modality)} h-6 w-6`}
                              />
                            </div>
                            <div>
                              <p className="text-foreground font-semibold">
                                {dicomFile.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                DICOM Imaging • {dicomFile.modality} Study
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {dicomFile.performedOn &&
                                  new Date(
                                    dicomFile.performedOn,
                                  ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {dicomFile.modality}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedDicomFile({
                                  images: dicomFile.images || [
                                    {
                                      name: dicomFile.name,
                                      url: dicomFile.url,
                                    },
                                  ],
                                  name: dicomFile.name,
                                  modality: dicomFile.modality,
                                  description: dicomFile.description,
                                })
                              }
                            >
                              <Monitor className="mr-2 h-4 w-4" />
                              View ({dicomFile.images?.length || 1} slice
                              {(dicomFile.images?.length || 1) !== 1 ? "s" : ""}
                              )
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  <div className="hover:bg-accent hover:text-accent-foreground p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                          <Activity className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            Complete Blood Count (CBC)
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Lab Results • Dr. Sarah Smith, MD
                          </p>
                          <p className="text-muted-foreground text-xs">
                            December 15, 2024 • 2:30 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Normal
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hover:bg-accent p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                          <Stethoscope className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            Annual Physical Examination
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Visit Summary • Dr. Michael Johnson, MD
                          </p>
                          <p className="text-muted-foreground text-xs">
                            December 10, 2024 • 10:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Complete
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hover:bg-accent p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                          <FileText className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            Chest X-Ray Report
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Radiology • Dr. Emily Brown, MD
                          </p>
                          <p className="text-muted-foreground text-xs">
                            December 5, 2024 • 3:45 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Normal
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hover:bg-accent p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                          <Heart className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            Electrocardiogram (EKG)
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Cardiology • Dr. Robert Wilson, MD
                          </p>
                          <p className="text-muted-foreground text-xs">
                            November 28, 2024 • 11:15 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Normal
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Medical Info & Actions */}
          <div className="space-y-6">
            {/* Current Medications */}
            <Card className="border" id="section-medications">
              <CardHeader className="border-b">
                <CardTitle className="text-foreground flex items-center">
                  <Pill className="mr-2 h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {patientData.medications
                    ?.filter((med) => med.active)
                    .map((medication, index) => (
                      <div
                        key={index}
                        className="bg-card flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-foreground font-medium">
                            {medication.name}{" "}
                            {medication.dose && `${medication.dose}`}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {medication.frequency ?? "As prescribed"}
                          </p>
                          {medication.refills !== undefined && (
                            <p className="text-muted-foreground text-xs">
                              Refills: {medication.refills} remaining
                            </p>
                          )}
                        </div>
                        <Clock className="text-muted-foreground h-4 w-4" />
                      </div>
                    )) ?? (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">
                        No current medications
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* General Notes Section */}
        <div className="my-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">
                  General Notes
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <FileText className="text-primary h-4 w-4" />
                  <span className="text-primary text-sm font-medium">
                    Progress & Observations
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Recent Notes */}
                <div className="space-y-3">
                  <h3 className="text-md text-foreground flex items-center font-semibold">
                    <Clock className="text-primary mr-2 h-4 w-4" />
                    Recent Notes
                  </h3>

                  {patientData.recentNotes &&
                  patientData.recentNotes.length > 0 ? (
                    <div className="space-y-3">
                      {patientData.recentNotes.map((note, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              {note.provider}
                            </span>
                            <span className="text-xs font-medium text-blue-600">
                              {new Date(note.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        No recent notes available
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                <div className="border-border border-t pt-4">
                  <h3 className="text-md text-foreground mb-3 flex items-center font-semibold">
                    <BarChart3 className="text-primary mr-2 h-4 w-4" />
                    Progress Summary
                  </h3>
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      No progress data available
                    </p>
                  </div>
                </div>

                {/* General Observations */}
                <div className="border-border border-t pt-4">
                  <h3 className="text-md text-foreground mb-3 flex items-center font-semibold">
                    <Eye className="text-primary mr-2 h-4 w-4" />
                    General Observations
                  </h3>
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      No observations recorded
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modern DICOM Viewer Modal */}
      {selectedDicomFile && (
        <ModernDicomViewer
          isOpen={true}
          dicomData={selectedDicomFile}
          onClose={() => setSelectedDicomFile(null)}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
