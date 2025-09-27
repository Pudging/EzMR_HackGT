import { useState, useEffect } from 'react';

export interface PatientData {
  // Basic Demographics
  id: string;
  name: string;
  patientId: string;
  dob: string;
  sex: string;
  bloodType?: string;
  
  // Contact Information
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  
  // Insurance
  insurance?: {
    primary?: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
    };
    secondary?: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
    };
  };
  
  // Emergency Contacts
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    type: string;
  }>;
  
  // Medical Information
  allergies?: Array<{
    substance: string;
    reaction?: string;
    severity: string;
    notedOn?: string;
  }>;
  
  medications?: Array<{
    name: string;
    dose?: string;
    frequency?: string;
    active: boolean;
    refills?: number;
  }>;
  
  socialHistory?: {
    tobacco?: string;
    alcohol?: string;
    drugs?: string;
    occupation?: string;
  };
  
  pastConditions?: Array<{
    date?: string;
    bodyPart?: string;
    notes: string;
  }>;
  
  immunizations?: Array<{
    vaccine: string;
    administeredOn: string;
    notes?: string;
  }>;
  
  familyHistory?: Array<{
    relation: string;
    condition: string;
    notes?: string;
  }>;
  
  vitals?: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    height?: string;
    weight?: string;
    bmi?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  
  recentNotes?: Array<{
    date: string;
    provider: string;
    content: string;
  }>;
  
  upcomingAppointments?: Array<{
    date: string;
    provider: string;
    type: string;
    location: string;
    status: string;
  }>;
}

// Real database integration - no more mock data

export function usePatientData(patientId: string) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/patients/${patientId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Patient with ID ${patientId} not found`);
          } else {
            setError('Failed to load patient data');
          }
          return;
        }
        
        const data: PatientData = await response.json();
        setPatientData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      void loadPatientData();
    } else {
      setLoading(false);
      setError('No patient ID provided');
    }
  }, [patientId]);

  return { patientData, loading, error };
}
