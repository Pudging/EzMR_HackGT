"use client";

import { useState } from "react";
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
  Activity
} from "lucide-react";
import { VoiceToText } from "@/components/ui/voice-to-text";
import { SmartNotesParser } from "@/components/ui/smart-notes-parser";

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
}

export default function EMRUploadPage() {
  const [smartNotes, setSmartNotes] = useState('');
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
      bloodType: ""
    },
    medications: [],
    socialHistory: {
      smoking: "",
      drugs: "",
      alcohol: ""
    },
    pastConditions: [],
    immunizations: [],
    familyHistory: [],
    allergies: "",
    generalNotes: "",
    dnr: false,
    preventiveCare: ""
  });

  // State for adding new items
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", schedule: "" });
  const [newCondition, setNewCondition] = useState({ date: "", bodyPart: "", notes: "" });
  const [newImmunization, setNewImmunization] = useState({ date: "", notes: "" });
  const [newFamilyHistory, setNewFamilyHistory] = useState({ date: "", bodyPart: "", notes: "" });

  // Add functions
  const addMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.schedule) {
      setPatientData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication]
      }));
      setNewMedication({ name: "", dosage: "", schedule: "" });
    }
  };

  const addCondition = () => {
    if (newCondition.date && newCondition.notes) {
      setPatientData(prev => ({
        ...prev,
        pastConditions: [...prev.pastConditions, newCondition]
      }));
      setNewCondition({ date: "", bodyPart: "", notes: "" });
    }
  };

  const addImmunization = () => {
    if (newImmunization.date && newImmunization.notes) {
      setPatientData(prev => ({
        ...prev,
        immunizations: [...prev.immunizations, newImmunization]
      }));
      setNewImmunization({ date: "", notes: "" });
    }
  };

  const addFamilyHistory = () => {
    if (newFamilyHistory.date && newFamilyHistory.bodyPart && newFamilyHistory.notes) {
      setPatientData(prev => ({
        ...prev,
        familyHistory: [...prev.familyHistory, newFamilyHistory]
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
    setPatientData(prev => {
      const updated = { ...prev };
      
      // Merge demographics
      if (extractedData.demographics) {
        Object.entries(extractedData.demographics).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            (updated as Record<string, unknown>)[key] = value;
          }
        });
      }
      
      // Merge vitals
      if (extractedData.vitals) {
        updated.vitals = { 
          ...updated.vitals, 
          ...Object.fromEntries(
            Object.entries(extractedData.vitals).map(([key, value]) => [key, value ?? ''])
          )
        };
      }
      
      // Add medications
      if (extractedData.medications && Array.isArray(extractedData.medications)) {
        const normalizedMedications = extractedData.medications.map(med => ({
          name: med.name,
          dosage: med.dosage ?? '',
          schedule: med.schedule ?? ''
        }));
        updated.medications = [...updated.medications, ...normalizedMedications];
      }
      
      // Merge social history
      if (extractedData.socialHistory) {
        updated.socialHistory = { 
          ...updated.socialHistory, 
          ...Object.fromEntries(
            Object.entries(extractedData.socialHistory).map(([key, value]) => [key, value ?? ''])
          )
        };
      }
      
      // Add conditions
      if (extractedData.pastConditions && Array.isArray(extractedData.pastConditions)) {
        const normalizedConditions = extractedData.pastConditions.map(condition => ({
          date: condition.date ?? '',
          bodyPart: condition.bodyPart ?? '',
          notes: condition.notes
        }));
        updated.pastConditions = [...updated.pastConditions, ...normalizedConditions];
      }
      
      // Add immunizations
      if (extractedData.immunizations && Array.isArray(extractedData.immunizations)) {
        const normalizedImmunizations = extractedData.immunizations.map(immunization => ({
          date: immunization.date ?? '',
          notes: immunization.notes
        }));
        updated.immunizations = [...updated.immunizations, ...normalizedImmunizations];
      }
      
      // Add family history
      if (extractedData.familyHistory && Array.isArray(extractedData.familyHistory)) {
        const normalizedFamilyHistory = extractedData.familyHistory.map(history => ({
          date: history.date ?? '',
          bodyPart: history.bodyPart ?? '',
          notes: history.notes
        }));
        updated.familyHistory = [...updated.familyHistory, ...normalizedFamilyHistory];
      }
      
      // Update other fields
      if (extractedData.allergies) {
        updated.allergies = updated.allergies ? updated.allergies + '\n' + extractedData.allergies : extractedData.allergies;
      }
      
      if (extractedData.generalNotes) {
        updated.generalNotes = updated.generalNotes ? updated.generalNotes + '\n' + extractedData.generalNotes : extractedData.generalNotes;
      }
      
      if (extractedData.preventiveCare) {
        updated.preventiveCare = updated.preventiveCare ? updated.preventiveCare + '\n' + extractedData.preventiveCare : extractedData.preventiveCare;
      }
      
      if (typeof extractedData.dnr === 'boolean') {
        updated.dnr = extractedData.dnr;
      }
      
      return updated;
    });
    
    // Clear the smart notes after successful extraction
    setSmartNotes('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 via-pink-800/20 to-blue-800/20 animate-pulse"></div>
      
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between p-6 border-b border-white/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-purple-400 bg-black rounded-lg">
            <span className="text-purple-400 font-mono font-bold text-lg">EMR</span>
          </div>
          <span className="text-2xl font-bold text-white">
            Electronic Medical Records
          </span>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
          <Upload className="h-4 w-4 mr-2" />
          Save EMR
        </Button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
          
          {/* Left Side - Demographics & Vital Info */}
          <div className="space-y-6 overflow-y-auto">
            
            {/* Demographics */}
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5 text-blue-400" />
                  <span>Patient Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Full Name</Label>
                    <Input
                      value={patientData.name}
                      onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="Patient full name"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Date of Birth</Label>
                    <Input
                      type="date"
                      value={patientData.dob}
                      onChange={(e) => setPatientData(prev => ({ ...prev, dob: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Sex</Label>
                    <select
                      value={patientData.sex || ""}
                      onChange={(e) => setPatientData(prev => ({ ...prev, sex: e.target.value }))}
                      className="w-full bg-black/50 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Patient ID / MRN</Label>
                    <Input
                      value={patientData.patientId}
                      onChange={(e) => setPatientData(prev => ({ ...prev, patientId: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="Medical Record Number"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Address</Label>
                  <Textarea
                    value={patientData.address}
                    onChange={(e) => setPatientData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-black/50 border-gray-600 text-white resize-none h-20"
                    placeholder="Full address..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Phone Number</Label>
                    <Input
                      value={patientData.phone}
                      onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Insurance Info</Label>
                    <Input
                      value={patientData.insurance}
                      onChange={(e) => setPatientData(prev => ({ ...prev, insurance: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="Policy numbers, provider..."
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Emergency Contact</Label>
                  <Input
                    value={patientData.emergencyContact}
                    onChange={(e) => setPatientData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="bg-black/50 border-gray-600 text-white"
                    placeholder="Name, relation, phone number..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card className="bg-black/40 border-green-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-green-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-green-400" />
                  <span>Vital Signs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300">Blood Pressure</Label>
                    <Input
                      value={patientData.vitals.bloodPressure}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, bloodPressure: e.target.value }
                      }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Heart Rate</Label>
                    <Input
                      value={patientData.vitals.heartRate}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, heartRate: e.target.value }
                      }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="72 bpm"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Temperature</Label>
                    <Input
                      value={patientData.vitals.temperature}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, temperature: e.target.value }
                      }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="98.6°F"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Weight (kg)</Label>
                    <Input
                      value={patientData.vitals.weight}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, weight: e.target.value }
                      }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Height (m)</Label>
                    <Input
                      value={patientData.vitals.height}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, height: e.target.value }
                      }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="1.75"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">BMI</Label>
                    <Input
                      value={patientData.vitals.bmi}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, bmi: e.target.value }
                      }))}
                      className="bg-black/50 border-gray-600 text-white"
                      placeholder="22.5"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Blood Type</Label>
                    <select
                      value={patientData.vitals.bloodType || ""}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, bloodType: e.target.value }
                      }))}
                      className="w-full bg-black/50 border border-gray-600 text-white rounded-md px-3 py-2"
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
            <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-yellow-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <span>Medications & Prescriptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    value={newMedication.name}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Medication name"
                    className="bg-black/50 border-gray-600 text-white"
                  />
                  <Input
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="Dosage (10mg)"
                    className="bg-black/50 border-gray-600 text-white"
                  />
                  <Input
                    value={newMedication.schedule}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="Schedule (2x daily)"
                    className="bg-black/50 border-gray-600 text-white"
                  />
                  <Button onClick={addMedication} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {patientData.medications.map((medication, index) => (
                    <div key={index} className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/30">
                      <div className="text-white font-semibold">{medication.name}</div>
                      <div className="text-sm text-gray-300">
                        <span className="text-yellow-400">{medication.dosage}</span> - 
                        <span className="text-blue-400 ml-1">{medication.schedule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Care Plans */}
            <Card className="bg-black/40 border-red-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-red-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-red-400" />
                  <span>Care Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={patientData.dnr}
                    onChange={(e) => setPatientData(prev => ({ ...prev, dnr: e.target.checked }))}
                    className="w-5 h-5 text-red-500 bg-black border-gray-600 rounded"
                  />
                  <Label className="text-gray-300 text-lg">DNR (Do Not Resuscitate)</Label>
                </div>
                <div>
                  <Label className="text-gray-300">Preventive Care</Label>
                  <Textarea
                    value={patientData.preventiveCare}
                    onChange={(e) => setPatientData(prev => ({ ...prev, preventiveCare: e.target.value }))}
                    className="bg-black/50 border-gray-600 text-white resize-none h-24"
                    placeholder="Preventive care plans, screenings, follow-ups..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="bg-black/40 border-indigo-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-indigo-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Upload className="h-5 w-5 text-indigo-400" />
                  <span>Lab Work & File Uploads</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-300 mb-2">Upload Lab Results</div>
                  <div className="text-sm text-gray-500">Bloodwork, X-rays, Genetic tests</div>
                  <Button className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Medical History & Notes */}
          <div className="space-y-6 overflow-y-auto">
            
            {/* Generic Notes for Auto-filling (Future Feature) */}
            <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-cyan-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  <span>Smart Notes (Auto-fill Ready)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 mb-4">
                  <div className="text-cyan-300 text-sm font-semibold mb-2">💡 Future Feature</div>
                  <div className="text-gray-300 text-sm">
                    Type, paste, or use voice input to add raw medical notes here. The system will automatically parse and categorize this information into the appropriate sections below.
                  </div>
                </div>
                <Textarea
                  value={smartNotes}
                  onChange={(e) => setSmartNotes(e.target.value)}
                  className="bg-black/50 border-gray-600 text-white resize-none h-40"
                  placeholder="Type, paste, or use voice input to add medical notes, discharge summaries, or doctor's notes here. Future AI will automatically categorize this information into the appropriate sections below..."
                />
                
                {/* Voice to Text Integration */}
                <VoiceToText 
                  onTranscriptUpdate={(newTranscript) => {
                    setSmartNotes(prev => {
                      // Only append NEW transcript content, not replace entire content
                      if (newTranscript.trim()) {
                        return prev ? prev + ' ' + newTranscript : newTranscript;
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
                      onClick={() => setSmartNotes('')}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Clear Notes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical History Section */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="border-b border-purple-500/20">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span>Medical History & Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Social History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">Social History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Smoking</Label>
                      <Textarea 
                        value={patientData.socialHistory.smoking}
                        onChange={(e) => setPatientData(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, smoking: e.target.value }
                        }))}
                        className="bg-black/50 border-gray-600 text-white resize-none h-20"
                        placeholder="Smoking history..."
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Drugs</Label>
                      <Textarea 
                        value={patientData.socialHistory.drugs}
                        onChange={(e) => setPatientData(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, drugs: e.target.value }
                        }))}
                        className="bg-black/50 border-gray-600 text-white resize-none h-20"
                        placeholder="Drug history..."
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Alcohol</Label>
                      <Textarea 
                        value={patientData.socialHistory.alcohol}
                        onChange={(e) => setPatientData(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, alcohol: e.target.value }
                        }))}
                        className="bg-black/50 border-gray-600 text-white resize-none h-20"
                        placeholder="Alcohol history..."
                      />
                    </div>
                  </div>
                </div>

                {/* Past Conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">Past Injuries & Conditions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      type="date"
                      value={newCondition.date}
                      onChange={(e) => setNewCondition(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Input
                      value={newCondition.bodyPart}
                      onChange={(e) => setNewCondition(prev => ({ ...prev, bodyPart: e.target.value }))}
                      placeholder="Body part (HEAD, OTHER, etc.)"
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Input
                      value={newCondition.notes}
                      onChange={(e) => setNewCondition(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Condition notes..."
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Button onClick={addCondition} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {patientData.pastConditions.map((condition, index) => (
                      <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <div className="text-sm text-gray-300">
                          <span className="text-purple-400 font-semibold">{condition.date}</span> - 
                          <span className="text-blue-400 font-semibold ml-1">{condition.bodyPart || "OTHER"}</span>
                        </div>
                        <div className="text-white text-sm mt-1">{condition.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immunizations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">Immunization History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      type="date"
                      value={newImmunization.date}
                      onChange={(e) => setNewImmunization(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Input
                      value={newImmunization.notes}
                      onChange={(e) => setNewImmunization(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Vaccination details..."
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Button onClick={addImmunization} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {patientData.immunizations.map((immunization, index) => (
                      <div key={index} className="bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                        <div className="text-sm text-gray-300">
                          <span className="text-green-400 font-semibold">{immunization.date}</span> - 
                          <span className="text-blue-400 font-semibold ml-1">VACCINATION</span>
                        </div>
                        <div className="text-white text-sm mt-1">{immunization.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Family History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">Family Medical History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      type="date"
                      value={newFamilyHistory.date}
                      onChange={(e) => setNewFamilyHistory(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Input
                      value={newFamilyHistory.bodyPart}
                      onChange={(e) => setNewFamilyHistory(prev => ({ ...prev, bodyPart: e.target.value }))}
                      placeholder="Relation (Mother, Father, etc.)"
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Input
                      value={newFamilyHistory.notes}
                      onChange={(e) => setNewFamilyHistory(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Family medical history..."
                      className="bg-black/50 border-gray-600 text-white"
                    />
                    <Button onClick={addFamilyHistory} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {patientData.familyHistory.map((history, index) => (
                      <div key={index} className="bg-orange-900/20 p-3 rounded-lg border border-orange-700/30">
                        <div className="text-sm text-gray-300">
                          <span className="text-orange-400 font-semibold">{history.date}</span> - 
                          <span className="text-blue-400 font-semibold ml-1">{history.bodyPart}</span>
                        </div>
                        <div className="text-white text-sm mt-1">{history.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">Allergies</h3>
                  <Textarea
                    value={patientData.allergies}
                    onChange={(e) => setPatientData(prev => ({ ...prev, allergies: e.target.value }))}
                    className="bg-black/50 border-gray-600 text-white resize-none h-24"
                    placeholder="List all known allergies, reactions, and severity..."
                  />
                </div>

                {/* General Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/30 pb-2">General Notes</h3>
                  <Textarea
                    value={patientData.generalNotes}
                    onChange={(e) => setPatientData(prev => ({ ...prev, generalNotes: e.target.value }))}
                    className="bg-black/50 border-gray-600 text-white resize-none h-32"
                    placeholder="General progress notes, observations, care instructions..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}