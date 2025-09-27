"use client";

import { SearchBar } from "@/components/search-bar";
import { useSearch } from "@/hooks/use-search";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function DashboardPage() {
  const {
    currentMatch,
    totalMatches,
    isSearching,
    performSearch,
    navigateToMatch,
    clearSearch,
  } = useSearch();

  // Mock session data for demo purposes
  const session = {
    user: {
      name: "John Michael Doe",
      email: "john.doe@email.com",
    },
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <header className="bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Stethoscope className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-semibold">
                  Patient Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  Medical Record Overview
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Patient Information Header */}
        <div className="bg-card mb-4 rounded-lg border shadow-sm">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-card-foreground text-lg font-semibold">
                Patient Information
              </h2>
              <div className="flex items-center space-x-2">
                <FileDigit className="text-primary h-4 w-4" />
                <span className="text-primary text-sm font-medium">
                  MRN: A-13511
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
                        ID: A-13511
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
                        {session?.user?.name ?? "John Michael Doe"}
                      </p>
                      <p className="text-muted-foreground text-xs">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-primary h-5 w-5" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        03/15/1985
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
                        Male
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
                        (555) 123-4567
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Primary Phone
                      </p>
                      <p className="text-muted-foreground text-sm">
                        (555) 987-6543
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Secondary Phone
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        1234 Oak Street
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Apt 5B, Springfield, IL 62701
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
                        {session?.user?.email ?? "john.doe@email.com"}
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
                        Blue Cross Blue Shield
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Policy: BC123456789
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Primary Insurance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        Medicare Part A
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Policy: MED-987654321
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Secondary Insurance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileDigit className="text-primary mt-0.5 h-5 w-5" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        GRP-789456
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Group Number
                      </p>
                    </div>
                  </div>
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

        {/* Past Medical History Section */}
        <div className="mb-6">
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
                  <div className="rounded-lg border p-3">
                    <h3 className="text-md text-foreground mb-2 flex items-center font-semibold">
                      <Users className="text-primary mr-2 h-4 w-4" />
                      Social History
                    </h3>
                    <div className="space-y-1">
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Smoking Status:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Former smoker (quit 2019)
                        </span>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Alcohol Use:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Social drinker (1-2 drinks/week)
                        </span>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Drug Use:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          None reported
                        </span>
                      </div>
                      <div className="bg-muted flex items-center justify-between rounded p-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          Occupation:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Software Engineer
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Immunization History */}
                  <div className="rounded-lg border p-3">
                    <h3 className="text-md text-foreground mb-2 flex items-center font-semibold">
                      <Shield className="text-primary mr-2 h-4 w-4" />
                      Immunization History
                    </h3>
                    <div className="space-y-1">
                      <div className="bg-secondary rounded border p-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-foreground text-sm font-medium">
                              COVID-19 Vaccine
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Pfizer - Booster
                            </p>
                          </div>
                          <span className="text-primary text-xs font-medium">
                            Dec 15, 2023
                          </span>
                        </div>
                      </div>
                      <div className="rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Influenza Vaccine
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Seasonal
                            </p>
                          </div>
                          <span className="text-xs font-medium text-green-600">
                            Oct 20, 2024
                          </span>
                        </div>
                      </div>
                      <div className="rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Tetanus/Diphtheria
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Tdap
                            </p>
                          </div>
                          <span className="text-xs font-medium text-green-600">
                            Mar 10, 2022
                          </span>
                        </div>
                      </div>
                      <div className="rounded border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Hepatitis B
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Series incomplete
                            </p>
                          </div>
                          <span className="text-xs font-medium text-yellow-600">
                            Due: Jan 2025
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <h3 className="text-md mb-2 flex items-center font-semibold text-gray-900 dark:text-gray-100">
                      <Bell className="mr-2 h-4 w-4 text-red-600" />
                      Allergies
                    </h3>
                    <div className="space-y-1">
                      <div className="rounded border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Penicillin
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Severe - Rash, difficulty breathing
                            </p>
                          </div>
                          <span className="text-xs font-medium text-red-600">
                            Known since childhood
                          </span>
                        </div>
                      </div>
                      <div className="rounded border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Shellfish
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Mild - Nausea, stomach upset
                            </p>
                          </div>
                          <span className="text-xs font-medium text-yellow-600">
                            Noted 2020
                          </span>
                        </div>
                      </div>
                      <div className="rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              No Known Allergies
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Other than listed above
                            </p>
                          </div>
                        </div>
                      </div>
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
                    <div className="space-y-1">
                      <div className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Head:
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            Jan 15, 2023
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Mild concussion from sports injury. Full recovery, no
                          lasting effects.
                        </p>
                      </div>
                      <div className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Right Knee:
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            Jun 8, 2021
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ACL sprain from skiing accident. Physical therapy
                          completed successfully.
                        </p>
                      </div>
                      <div className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Left Wrist:
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            Sep 22, 2020
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Fracture from fall. Cast for 6 weeks, full recovery.
                        </p>
                      </div>
                      <div className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Chest:
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            Mar 12, 2019
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Pneumonia, treated with antibiotics. Full recovery.
                        </p>
                      </div>
                      <div className="rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Other:
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            Various dates
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Childhood asthma (resolved by age 12), seasonal
                          allergies (mild).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Family Medical History */}
                  <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <h3 className="text-md mb-2 flex items-center font-semibold text-gray-900 dark:text-gray-100">
                      <Users className="mr-2 h-4 w-4 text-purple-600" />
                      Family Medical History
                    </h3>
                    <div className="space-y-1">
                      <div className="rounded border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Father:
                          </span>
                          <span className="text-xs font-medium text-purple-600">
                            Age 65
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Hypertension (controlled), Type 2 Diabetes (diet
                          controlled), No cardiac history.
                        </p>
                      </div>
                      <div className="rounded border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Mother:
                          </span>
                          <span className="text-xs font-medium text-purple-600">
                            Age 62
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Breast cancer (2018, treated successfully),
                          Osteoporosis, No cardiac history.
                        </p>
                      </div>
                      <div className="rounded border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Maternal Grandmother:
                          </span>
                          <span className="text-xs font-medium text-purple-600">
                            Deceased at 78
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Heart disease, Stroke at age 75.
                        </p>
                      </div>
                      <div className="rounded border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Paternal Grandfather:
                          </span>
                          <span className="text-xs font-medium text-purple-600">
                            Deceased at 72
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Prostate cancer, Hypertension.
                        </p>
                      </div>
                      <div className="rounded border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Siblings:
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            2 sisters
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          No significant medical history reported.
                        </p>
                      </div>
                    </div>
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
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Blood Pressure & Type
                  </p>
                  <p className="text-foreground text-xl font-bold">
                    120/80 • O+
                  </p>
                  <p className="text-xs text-green-600">Normal</p>
                </div>
                <Droplets className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Heart Rate
                  </p>
                  <p className="text-foreground text-xl font-bold">72 bpm</p>
                  <p className="text-xs text-blue-600">Normal</p>
                </div>
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Temperature
                  </p>
                  <p className="text-foreground text-xl font-bold">98.6°F</p>
                  <p className="text-xs text-orange-600">Normal</p>
                </div>
                <Thermometer className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Weight & Height
                  </p>
                  <p className="text-foreground text-xl font-bold">
                    165 lbs • 5'10"
                  </p>
                  <p className="text-xs text-purple-600">BMI: 23.4</p>
                </div>
                <Weight className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

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

            {/* Upcoming Appointments */}
            <Card className="border">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground flex items-center">
                      <Calendar className="text-primary mr-2 h-5 w-5" />
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>
                      Scheduled medical appointments and visits
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-border divide-y">
                  <div className="hover:bg-accent p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                          <Stethoscope className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            Follow-up Consultation
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Dr. Sarah Smith, MD • Internal Medicine
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Tomorrow • December 20, 2024 • 2:00 PM
                          </p>
                          <div className="mt-1 flex items-center space-x-2">
                            <MapPin className="text-muted-foreground h-3 w-3" />
                            <span className="text-muted-foreground text-xs">
                              Main Medical Center, Room 205
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Confirmed
                        </span>
                        <Button size="sm">Join Meeting</Button>
                      </div>
                    </div>
                  </div>

                  <div className="hover:bg-accent p-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                          <Calendar className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">
                            Dental Checkup
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Dr. James Wilson, DDS • Dentistry
                          </p>
                          <p className="text-muted-foreground text-xs">
                            December 28, 2024 • 10:00 AM
                          </p>
                          <div className="mt-1 flex items-center space-x-2">
                            <MapPin className="text-muted-foreground h-3 w-3" />
                            <span className="text-muted-foreground text-xs">
                              Dental Clinic, Suite 101
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Scheduled
                        </span>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
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
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-foreground flex items-center">
                  <Pill className="mr-2 h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="bg-card flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-foreground font-medium">
                        Lisinopril 10mg
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Once daily
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Refills: 2 remaining
                      </p>
                    </div>
                    <Clock className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="bg-card flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-foreground font-medium">
                        Vitamin D3 1000IU
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Once daily
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Refills: 3 remaining
                      </p>
                    </div>
                    <Clock className="text-muted-foreground h-4 w-4" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </CardContent>
            </Card>

            {/* Health Alerts */}
            <Card className="border">
              <CardHeader className="border-b">
                <CardTitle className="text-foreground flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Health Alerts & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p className="text-sm font-medium text-green-800">
                        Annual Physical Complete
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-green-600">
                      Last checkup: Dec 10, 2024
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <p className="text-sm font-medium text-blue-800">
                        Upcoming Appointment
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-blue-600">
                      Tomorrow at 2:00 PM
                    </p>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <p className="text-sm font-medium text-yellow-800">
                        Medication Reminder
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-yellow-600">
                      Take Vitamin D at 8:00 AM daily
                    </p>
                  </div>
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

                  <div className="space-y-3">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Dr. Sarah Smith, MD
                        </span>
                        <span className="text-xs font-medium text-blue-600">
                          Dec 19, 2024
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Patient continues to show excellent progress with DNRS
                        protocol. Reports significant improvement in daily
                        functioning and reduced anxiety levels. Compliance with
                        exercise routine has been consistent. Recommend
                        continuing current phase for another month before
                        advancing.
                      </p>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Dr. Michael Johnson, MD
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          Dec 10, 2024
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Annual physical examination completed. All vital signs
                        within normal ranges. Patient maintains healthy
                        lifestyle habits. No new concerns identified. Continue
                        current preventive care schedule.
                      </p>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Dr. Emily Brown, MD
                        </span>
                        <span className="text-xs font-medium text-purple-600">
                          Dec 5, 2024
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Chest X-ray results normal. No acute findings. Patient
                        reports good respiratory function. Continue monitoring
                        as part of routine preventive care.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="border-border border-t pt-4">
                  <h3 className="text-md text-foreground mb-3 flex items-center font-semibold">
                    <BarChart3 className="text-primary mr-2 h-4 w-4" />
                    Progress Summary
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                      <h4 className="mb-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                        DNRS Progress
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <li>• 8 months of consistent participation</li>
                        <li>• 40% reduction in reported symptoms</li>
                        <li>• Improved sleep quality and duration</li>
                        <li>• Enhanced stress management capabilities</li>
                        <li>• Better overall quality of life scores</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                      <h4 className="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        Health Maintenance
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <li>• All vaccinations up to date</li>
                        <li>• Regular exercise routine maintained</li>
                        <li>• Healthy dietary habits consistent</li>
                        <li>• No new health concerns identified</li>
                        <li>• Excellent medication compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* General Observations */}
                <div className="border-border border-t pt-4">
                  <h3 className="text-md text-foreground mb-3 flex items-center font-semibold">
                    <Eye className="text-primary mr-2 h-4 w-4" />
                    General Observations
                  </h3>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Patient demonstrates excellent engagement with treatment
                        protocols and shows proactive approach to health
                        management. Communication during visits has been clear
                        and collaborative. No barriers to care identified.
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Family support system appears strong, with spouse
                        actively involved in care coordination. Patient
                        expresses satisfaction with current treatment plan and
                        shows motivation to continue progress.
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        No adverse reactions to current medications. Patient
                        reports good tolerance of all prescribed treatments.
                        Lifestyle modifications have been successfully
                        implemented and maintained.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Note Button */}
                <div className="flex justify-end pt-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
