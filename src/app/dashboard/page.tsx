"use client";

import { UserNav } from "@/components/auth/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBar } from "@/components/search-bar";
import { useSearch } from "@/hooks/use-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Calendar, 
  Pill, 
  Stethoscope, 
  Bell, 
  Plus,
  Sparkles,
  BarChart3,
  Settings,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Droplets,
  Eye,
  Download,
  Printer,
  Share2,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Users,
  FileDigit,
  Shield
} from "lucide-react";

export default function DashboardPage() {
  const {
    currentMatch,
    totalMatches,
    isSearching,
    performSearch,
    navigateToMatch,
    clearSearch
  } = useSearch();

  // Mock session data for demo purposes
  const session = {
    user: {
      name: "John Michael Doe",
      email: "john.doe@email.com"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Medical Header */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-blue-600 dark:border-blue-400 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Electronic Medical Records</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">EzMR System</p>
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
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {session?.user?.name?.split(' ')[0] ?? 'Demo User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Patient Portal</p>
              </div>
              <ThemeToggle />
              {session ? (
                <UserNav />
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded">
                  Demo Mode
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Patient Information Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Patient Information</h2>
              <div className="flex items-center space-x-2">
                <FileDigit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">MRN: A-13511</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3">
            {/* Patient Photo and All Information */}
            <div className="flex flex-col lg:flex-row gap-6 mb-4">
              {/* Patient Photo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative group">
                  <div className="w-[298px] h-[326px] bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                    <div className="w-36 h-36 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                      <User className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Patient Photo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: A-13511</p>
                    </div>
                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-center text-white">
                        <Plus className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-xs">Update Photo</p>
                      </div>
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  {/* Photo info badge */}
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                    EMR
                  </div>
                </div>
              </div>

              {/* All Patient Information */}
              <div className="flex-1 space-y-4">
                {/* Basic Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session?.user?.name || 'John Michael Doe'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">03/15/1985</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Date of Birth</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Male</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sex</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">(555) 123-4567</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Primary Phone</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">(555) 987-6543</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Secondary Phone</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">1234 Oak Street</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Apt 5B, Springfield, IL 62701</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Home Address</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session?.user?.email || 'john.doe@email.com'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Email Address</p>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Blue Cross Blue Shield</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Policy: BC123456789</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Primary Insurance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Medicare Part A</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Policy: MED-987654321</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Secondary Insurance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileDigit className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">GRP-789456</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Group Number</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Emergency Contacts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Jane Doe (Spouse)</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">(555) 234-5678</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Primary Emergency</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Robert Smith (Brother)</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">(555) 345-6789</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Secondary Emergency</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dr. Sarah Smith (Physician)</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">(555) 456-7890</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Primary Care Physician</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Past Medical History</h2>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Complete History</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left Column */}
              <div className="space-y-4">
                
                {/* Social History */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-2/3">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-orange-600" />
                    Social History
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smoking Status:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Former smoker (quit 2019)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alcohol Use:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Social drinker (1-2 drinks/week)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Drug Use:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">None reported</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupation:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Software Engineer</span>
                    </div>
                  </div>
                </div>

                {/* Immunization History */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-2/3">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Immunization History
                  </h3>
                  <div className="space-y-1">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">COVID-19 Vaccine</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pfizer - Booster</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Dec 15, 2023</span>
                      </div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Influenza Vaccine</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Seasonal</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Oct 20, 2024</span>
                      </div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tetanus/Diphtheria</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tdap</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Mar 10, 2022</span>
                      </div>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Hepatitis B</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Series incomplete</p>
                        </div>
                        <span className="text-xs text-yellow-600 font-medium">Due: Jan 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-2/3">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-red-600" />
                    Allergies
                  </h3>
                  <div className="space-y-1">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Penicillin</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Severe - Rash, difficulty breathing</p>
                        </div>
                        <span className="text-xs text-red-600 font-medium">Known since childhood</span>
                      </div>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Shellfish</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Mild - Nausea, stomach upset</p>
                        </div>
                        <span className="text-xs text-yellow-600 font-medium">Noted 2020</span>
                      </div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No Known Allergies</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Other than listed above</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 -ml-4 translate-x-[-180px] w-3/4">
                
                {/* Past Injuries and Conditions */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-600" />
                    Past Injuries & Conditions
                  </h3>
                  <div className="space-y-1">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">HEAD:</span>
                        <span className="text-xs text-blue-600 font-medium">Jan 15, 2023</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Mild concussion from sports injury. Full recovery, no lasting effects.</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">RIGHT KNEE:</span>
                        <span className="text-xs text-blue-600 font-medium">Jun 8, 2021</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ACL sprain from skiing accident. Physical therapy completed successfully.</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">LEFT WRIST:</span>
                        <span className="text-xs text-blue-600 font-medium">Sep 22, 2020</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Fracture from fall. Cast for 6 weeks, full recovery.</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">CHEST:</span>
                        <span className="text-xs text-blue-600 font-medium">Mar 12, 2019</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pneumonia, treated with antibiotics. Full recovery.</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">OTHER:</span>
                        <span className="text-xs text-gray-600 font-medium">Various dates</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Childhood asthma (resolved by age 12), seasonal allergies (mild).</p>
                    </div>
                  </div>
                </div>

                {/* Family Medical History */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-600" />
                    Family Medical History
                  </h3>
                  <div className="space-y-1">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">FATHER:</span>
                        <span className="text-xs text-purple-600 font-medium">Age 65</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Hypertension (controlled), Type 2 Diabetes (diet controlled), No cardiac history.</p>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">MOTHER:</span>
                        <span className="text-xs text-purple-600 font-medium">Age 62</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Breast cancer (2018, treated successfully), Osteoporosis, No cardiac history.</p>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">MATERNAL GRANDMOTHER:</span>
                        <span className="text-xs text-purple-600 font-medium">Deceased at 78</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Heart disease, Stroke at age 75.</p>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">PATERNAL GRANDFATHER:</span>
                        <span className="text-xs text-purple-600 font-medium">Deceased at 72</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Prostate cancer, Hypertension.</p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">SIBLINGS:</span>
                        <span className="text-xs text-green-600 font-medium">2 sisters</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">No significant medical history reported.</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Care Plans</h2>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Plans</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* DNRS Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    DNRS (Dynamic Neuromuscular Rehabilitation System)
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Current Status:</span>
                        <span className="text-xs text-indigo-600 font-medium bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">Active</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Started: March 15, 2024</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Progress: 8 months completed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercise Frequency:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Daily, 30-45 minutes</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Phase:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Phase 3 - Advanced</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Review:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">January 15, 2025</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">Recent Progress</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Significant improvement in neuroplasticity exercises. Patient reports 40% reduction in symptoms. Continue current protocol.</p>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Key Exercises</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Limbic system retraining (20 min daily)</li>
                        <li>• Neuroplasticity exercises (15 min daily)</li>
                        <li>• Stress reduction techniques (10 min daily)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Preventive Care Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                    Preventive Care
                  </h3>
                  <div className="space-y-3">
                    
                    {/* Upcoming Screenings */}
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Upcoming Screenings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Annual Physical</span>
                          <span className="text-xs text-emerald-600 font-medium">Due: Dec 2025</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Blood Pressure Check</span>
                          <span className="text-xs text-emerald-600 font-medium">Due: Mar 2025</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Cholesterol Panel</span>
                          <span className="text-xs text-emerald-600 font-medium">Due: Jun 2025</span>
                        </div>
                      </div>
                    </div>

                    {/* Completed Screenings */}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Recently Completed</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">COVID-19 Booster</span>
                          <span className="text-xs text-green-600 font-medium">Dec 15, 2024</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Influenza Vaccine</span>
                          <span className="text-xs text-green-600 font-medium">Oct 20, 2024</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Annual Physical</span>
                          <span className="text-xs text-green-600 font-medium">Dec 10, 2024</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Recommendations */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Health Recommendations</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Maintain regular exercise routine (150 min/week)</li>
                        <li>• Continue Mediterranean diet</li>
                        <li>• Annual eye examination</li>
                        <li>• Dental cleaning every 6 months</li>
                        <li>• Skin cancer screening (age 40+)</li>
                      </ul>
                    </div>

                    {/* Risk Factors */}
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Risk Assessment</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Family History Risk:</span>
                          <span className="text-xs text-yellow-600 font-medium">Moderate</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Lifestyle Risk:</span>
                          <span className="text-xs text-green-600 font-medium">Low</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Overall Risk:</span>
                          <span className="text-xs text-yellow-600 font-medium">Moderate</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blood Pressure & Type</p>
                  <p className="text-xl font-bold text-white">120/80 • O+</p>
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
                  <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                  <p className="text-xl font-bold text-white">72 bpm</p>
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
                  <p className="text-sm font-medium text-gray-600">Temperature</p>
                  <p className="text-xl font-bold text-white">98.6°F</p>
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
                  <p className="text-sm font-medium text-gray-600">Weight & Height</p>
                  <p className="text-xl font-bold text-white">165 lbs • 5'10"</p>
                  <p className="text-xs text-purple-600">BMI: 23.4</p>
                </div>
                <Weight className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Medical Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Medical Records */}
            <Card className="border border-gray-200 bg-blue-50">
              <CardHeader className="bg-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-blue-900">
                      <FileText className="h-5 w-5 mr-2" />
                      Medical Records
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      Latest medical documents and test results
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Complete Blood Count (CBC)</p>
                          <p className="text-sm text-gray-600">Lab Results • Dr. Sarah Smith, MD</p>
                          <p className="text-xs text-gray-500">December 15, 2024 • 2:30 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Annual Physical Examination</p>
                          <p className="text-sm text-gray-600">Visit Summary • Dr. Michael Johnson, MD</p>
                          <p className="text-xs text-gray-500">December 10, 2024 • 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Complete
                        </span>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Chest X-Ray Report</p>
                          <p className="text-sm text-gray-600">Radiology • Dr. Emily Brown, MD</p>
                          <p className="text-xs text-gray-500">December 5, 2024 • 3:45 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Heart className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Electrocardiogram (EKG)</p>
                          <p className="text-sm text-gray-600">Cardiology • Dr. Robert Wilson, MD</p>
                          <p className="text-xs text-gray-500">November 28, 2024 • 11:15 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
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
            <Card className="border border-gray-200 bg-green-50">
              <CardHeader className="bg-green-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-green-900">
                      <Calendar className="h-5 w-5 mr-2" />
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Scheduled medical appointments and visits
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Follow-up Consultation</p>
                          <p className="text-sm text-gray-600">Dr. Sarah Smith, MD • Internal Medicine</p>
                          <p className="text-xs text-gray-500">Tomorrow • December 20, 2024 • 2:00 PM</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Main Medical Center, Room 205</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Confirmed
                        </span>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Join Meeting
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Dental Checkup</p>
                          <p className="text-sm text-gray-600">Dr. James Wilson, DDS • Dentistry</p>
                          <p className="text-xs text-gray-500">December 28, 2024 • 10:00 AM</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Dental Clinic, Suite 101</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Scheduled
                        </span>
                        <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
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
            <Card className="border border-gray-200 bg-purple-50">
              <CardHeader className="bg-purple-50 border-b border-gray-200">
                <CardTitle className="flex items-center text-purple-900">
                  <Pill className="h-5 w-5 mr-2" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Lisinopril 10mg</p>
                      <p className="text-sm text-gray-600">Once daily</p>
                      <p className="text-xs text-gray-500">Refills: 2 remaining</p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Vitamin D3 1000IU</p>
                      <p className="text-sm text-gray-600">Once daily</p>
                      <p className="text-xs text-gray-500">Refills: 3 remaining</p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 border-purple-300 text-purple-700 hover:bg-purple-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </CardContent>
            </Card>

            {/* Health Alerts */}
            <Card className="border border-gray-200 bg-orange-50">
              <CardHeader className="bg-orange-50 border-b border-gray-200">
                <CardTitle className="flex items-center text-orange-900">
                  <Bell className="h-5 w-5 mr-2" />
                  Health Alerts & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-green-800">Annual Physical Complete</p>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Last checkup: Dec 10, 2024</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-blue-800">Upcoming Appointment</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Tomorrow at 2:00 PM</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm font-medium text-yellow-800">Medication Reminder</p>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">Take Vitamin D at 8:00 AM daily</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* General Notes Section */}
        <div className="mb-6 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General Notes</h2>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Progress & Observations</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="space-y-4">
                
                {/* Recent Notes */}
                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    Recent Notes
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Dr. Sarah Smith, MD</span>
                        <span className="text-xs text-blue-600 font-medium">Dec 19, 2024</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Patient continues to show excellent progress with DNRS protocol. Reports significant improvement in daily functioning and reduced anxiety levels. 
                        Compliance with exercise routine has been consistent. Recommend continuing current phase for another month before advancing.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Dr. Michael Johnson, MD</span>
                        <span className="text-xs text-green-600 font-medium">Dec 10, 2024</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Annual physical examination completed. All vital signs within normal ranges. Patient maintains healthy lifestyle habits. 
                        No new concerns identified. Continue current preventive care schedule.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Dr. Emily Brown, MD</span>
                        <span className="text-xs text-purple-600 font-medium">Dec 5, 2024</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Chest X-ray results normal. No acute findings. Patient reports good respiratory function. 
                        Continue monitoring as part of routine preventive care.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-indigo-600" />
                    Progress Summary
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2">DNRS Progress</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• 8 months of consistent participation</li>
                        <li>• 40% reduction in reported symptoms</li>
                        <li>• Improved sleep quality and duration</li>
                        <li>• Enhanced stress management capabilities</li>
                        <li>• Better overall quality of life scores</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Health Maintenance</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
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
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-amber-600" />
                    General Observations
                  </h3>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Patient demonstrates excellent engagement with treatment protocols and shows proactive approach to health management. 
                        Communication during visits has been clear and collaborative. No barriers to care identified.
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Family support system appears strong, with spouse actively involved in care coordination. 
                        Patient expresses satisfaction with current treatment plan and shows motivation to continue progress.
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        No adverse reactions to current medications. Patient reports good tolerance of all prescribed treatments. 
                        Lifestyle modifications have been successfully implemented and maintained.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Note Button */}
                <div className="flex justify-end pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
