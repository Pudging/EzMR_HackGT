import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  try {
    let tenant = await getCurrentTenant();
    
    // Default fallback for localhost - use any available tenant
    if (!tenant) {
      tenant = await db.tenant.findFirst();
    }
    
    if (!tenant) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    console.log(`🧹 Cleaning up patient data for tenant: ${tenant.subdomain}`);

    // Find patient with MRN 1
    const patient = await db.patient.findFirst({
      where: {
        tenantId: tenant.id,
        mrn: '1',
      },
    });

    if (patient) {
      console.log(`🗑️ Deleting all data for patient: ${patient.firstName} ${patient.lastName}`);

      // Delete all related records (in correct order due to foreign keys)
      await db.clinicalNote.deleteMany({ where: { patientId: patient.id } });
      await db.vitalSign.deleteMany({ where: { patientId: patient.id } });
      await db.immunization.deleteMany({ where: { patientId: patient.id } });
      await db.familyHistoryCondition.deleteMany({ where: { patientId: patient.id } });
      await db.pastMedicalEvent.deleteMany({ where: { patientId: patient.id } });
      await db.socialHistory.deleteMany({ where: { patientId: patient.id } });
      await db.medication.deleteMany({ where: { patientId: patient.id } });
      await db.allergy.deleteMany({ where: { patientId: patient.id } });
      await db.insurancePolicy.deleteMany({ where: { patientId: patient.id } });
      await db.emergencyContact.deleteMany({ where: { patientId: patient.id } });
      
      // Finally delete the patient
      await db.patient.delete({ where: { id: patient.id } });
      
      console.log(`✅ Successfully cleaned up patient data`);
    }

    return NextResponse.json({ 
      message: `Successfully cleaned up patient data for tenant ${tenant.subdomain}`,
      deletedPatient: patient ? `${patient.firstName} ${patient.lastName}` : 'No patient found'
    });

  } catch (error) {
    console.error("Error cleaning up patient data:", error);
    return NextResponse.json(
      { error: "Failed to clean up patient data" },
      { status: 500 }
    );
  }
}
