import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";

interface PatientParams {
  patientId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: PatientParams }
) {
  try {
    let tenant = await getCurrentTenant();
    
    // Default fallback for localhost - use any available tenant
    if (!tenant) {
      tenant = await db.tenant.findFirst();
    }
    
    if (!tenant) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const { patientId } = params;
    
    console.log(`🔍 Looking for patient with MRN: ${patientId} in tenant: ${tenant.subdomain} (${tenant.id})`);

    // Fetch patient with all related data (patientId is actually the MRN)
    const patient = await db.patient.findFirst({
      where: {
        tenantId: tenant.id,
        mrn: patientId,
      },
      include: {
        allergies: {
          where: { active: true },
          orderBy: { notedOn: "desc" },
        },
        medications: {
          where: { active: true },
          orderBy: { startDate: "desc" },
        },
        socialHistory: true,
        immunizations: {
          orderBy: { administeredOn: "desc" },
        },
        vitals: {
          orderBy: { recordedAt: "desc" },
          take: 10, // Get latest 10 vital measurements
        },
        pastMedical: {
          orderBy: { date: "desc" },
        },
        familyHistory: true,
        notes: {
          orderBy: { createdAt: "desc" },
          take: 10, // Get latest 10 notes
        },
        insurancePolicies: {
          orderBy: { isPrimary: "desc" },
        },
        emergencyContacts: true,
        encounters: {
          orderBy: { occurredAt: "desc" },
          take: 5, // Get latest 5 encounters
          include: {
            notes: true,
          },
        },
      },
    });

    console.log(`🏥 Found patient: ${patient ? `${patient.firstName} ${patient.lastName} (ID: ${patient.id})` : 'None'}`);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const transformedData = {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      patientId: patient.mrn,
      dob: patient.dateOfBirth.toISOString().split('T')[0],
      sex: patient.sex,
      bloodType: patient.bloodType,
      
      phone: patient.phoneNumber,
      secondaryPhone: undefined, // Could add secondary phone to schema if needed
      email: patient.email,
      address: patient.addressLine1 ? {
        line1: patient.addressLine1,
        line2: patient.addressLine2 || undefined,
        city: patient.city || "",
        state: patient.state || "",
        postalCode: patient.postalCode || "",
      } : undefined,
      
      insurance: {
        primary: patient.insurancePolicies.find(p => p.isPrimary) ? {
          provider: patient.insurancePolicies.find(p => p.isPrimary)!.providerName,
          policyNumber: patient.insurancePolicies.find(p => p.isPrimary)!.policyNumber,
          groupNumber: patient.insurancePolicies.find(p => p.isPrimary)!.groupNumber || undefined,
        } : undefined,
        secondary: patient.insurancePolicies.find(p => !p.isPrimary) ? {
          provider: patient.insurancePolicies.find(p => !p.isPrimary)!.providerName,
          policyNumber: patient.insurancePolicies.find(p => !p.isPrimary)!.policyNumber,
        } : undefined,
      },
      
      emergencyContacts: patient.emergencyContacts.map(contact => ({
        name: contact.name,
        relationship: contact.relation,
        phone: contact.phone,
        type: "Emergency Contact", // Could enhance schema to track contact type
      })),
      
      allergies: patient.allergies.map(allergy => ({
        substance: allergy.substance,
        reaction: allergy.reaction || "Unknown reaction",
        severity: allergy.severity.toLowerCase() as "mild" | "moderate" | "severe",
        notedOn: allergy.notedOn ? allergy.notedOn.toISOString().split('T')[0] : undefined,
      })),
      
      medications: patient.medications.map(med => ({
        name: med.name,
        dose: med.dose || "Unknown dose",
        frequency: med.frequency || "As needed",
        active: med.active,
        refills: 0, // Could add refills to schema if needed
      })),
      
      socialHistory: patient.socialHistory ? {
        tobacco: patient.socialHistory.tobaccoUse,
        alcohol: patient.socialHistory.alcoholUse,
        drugs: patient.socialHistory.drugUse,
        occupation: patient.socialHistory.occupation,
      } : undefined,
      
      pastConditions: patient.pastMedical.map(event => ({
        date: event.date ? event.date.toISOString().split('T')[0] : "Unknown date",
        bodyPart: event.type || "OTHER",
        notes: event.description,
      })),
      
      immunizations: patient.immunizations.map(imm => ({
        vaccine: imm.vaccine,
        administeredOn: imm.administeredOn.toISOString().split('T')[0],
        notes: imm.notes || undefined,
      })),
      
      familyHistory: patient.familyHistory.map(history => ({
        relation: history.relation,
        condition: history.condition,
        notes: history.notes || undefined,
      })),
      
      vitals: (() => {
        // Get the most recent vitals and organize them
        const latestVitals: any = {};
        
        patient.vitals.forEach(vital => {
          if (!latestVitals[vital.type] || new Date(vital.recordedAt) > new Date(latestVitals[vital.type].recordedAt)) {
            latestVitals[vital.type] = vital;
          }
        });
        
        return {
          bloodPressure: latestVitals.BLOOD_PRESSURE ? {
            systolic: latestVitals.BLOOD_PRESSURE.systolic || 0,
            diastolic: latestVitals.BLOOD_PRESSURE.diastolic || 0,
          } : undefined,
          heartRate: latestVitals.HEART_RATE?.numericValue || undefined,
          temperature: latestVitals.TEMPERATURE?.numericValue || undefined,
          height: latestVitals.HEIGHT ? `${latestVitals.HEIGHT.numericValue}m` : undefined,
          weight: latestVitals.WEIGHT ? `${latestVitals.WEIGHT.numericValue}kg` : undefined,
          bmi: latestVitals.BMI?.numericValue || undefined,
          respiratoryRate: latestVitals.RESPIRATION_RATE?.numericValue || undefined,
          oxygenSaturation: latestVitals.SPO2?.numericValue || undefined,
        };
      })(),
      
      recentNotes: patient.notes.map(note => ({
        date: note.createdAt.toISOString().split('T')[0],
        provider: "Clinical Provider", // Could enhance schema to track provider
        content: note.content,
      })),
      
      upcomingAppointments: [], // Could implement appointments table if needed
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient data" },
      { status: 500 }
    );
  }
}
