import { NextResponse } from 'next/server';
import { seedFakePatient } from '@/lib/seed-fake-patient';

export async function POST() {
  try {
    const result = await seedFakePatient();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully seeded fake patient data',
      patient: {
        id: result.localhostPatient.id,
        name: `${result.localhostPatient.firstName} ${result.localhostPatient.lastName}`,
        mrn: result.localhostPatient.mrn,
        dateOfBirth: result.localhostPatient.dateOfBirth,
        sex: result.localhostPatient.sex,
        bloodType: result.localhostPatient.bloodType,
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
