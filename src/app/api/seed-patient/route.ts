import { NextResponse } from 'next/server';
import { seedFakePatient } from '@/lib/seed-fake-patient';

export async function POST() {
  try {
    const patient = await seedFakePatient();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully seeded fake patient data',
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        dateOfBirth: patient.dateOfBirth,
        sex: patient.sex,
        bloodType: patient.bloodType,
      },
    });

  } catch (error) {
    console.error('Error seeding patient:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed patient data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed fake patient data for Kevin Ketong Gao (MRN: 1)',
  });
}
