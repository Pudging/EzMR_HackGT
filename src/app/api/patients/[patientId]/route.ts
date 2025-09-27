import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";
import { logUserAction, ActionType } from "@/lib/logging";

// Narrow delegate shim for Prisma with structural types (no any)
type InsurancePolicyRecord = {
  isPrimary: boolean;
  providerName: string;
  policyNumber: string;
  groupNumber: string | null;
};

type EmergencyContactRecord = { name: string; relation: string; phone: string };

type AllergyRecord = {
  substance: string;
  reaction: string | null;
  severity: string;
  notedOn: Date | null;
};

type MedicationRecord = {
  name: string;
  dose: string | null;
  frequency: string | null;
  active: boolean;
};

type SocialHistoryRecord = {
  tobaccoUse: boolean | null;
  alcoholUse: boolean | null;
  drugUse: boolean | null;
  occupation: string | null;
};

type PastMedicalRecord = { date: Date | null; type: string | null; description: string };

type ImmunizationRecord = { vaccine: string; administeredOn: Date; notes: string | null };

type FamilyHistoryRecord = { relation: string; condition: string; notes: string | null };

type VitalRecord = {
  type: string;
  numericValue: number | null;
  systolic: number | null;
  diastolic: number | null;
  recordedAt: Date;
};

type NoteRecord = { createdAt: Date; content: string };

type PatientRecord = {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth: Date;
  sex: string;
  bloodType: string | null;
  phoneNumber: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  insurancePolicies: InsurancePolicyRecord[];
  emergencyContacts: EmergencyContactRecord[];
  allergies: AllergyRecord[];
  medications: MedicationRecord[];
  socialHistory: SocialHistoryRecord | null;
  pastMedical: PastMedicalRecord[];
  immunizations: ImmunizationRecord[];
  familyHistory: FamilyHistoryRecord[];
  vitals: VitalRecord[];
  notes: NoteRecord[];
};

const prisma = db as unknown as {
  tenant: { findFirst: (args?: unknown) => Promise<{ id: string; subdomain: string; hospitalName: string } | null> };
  patient: { findFirst: (args: unknown) => Promise<PatientRecord & { imaging: any[] } | null> };
};


interface PatientParams {
  patientId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<PatientParams> },
) {
  try {
    let tenant = await getCurrentTenant();

    // Default fallback for localhost - use any available tenant
    tenant ??= await db.tenant.findFirst();

    if (!tenant) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const { patientId } = await params;

    console.log(
      `🔍 Looking for patient with MRN: ${patientId} in tenant: ${tenant.subdomain} (${tenant.id})`,
    );

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
        imaging: {
          orderBy: { performedOn: "desc" },
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

    console.log(
      `🏥 Found patient: ${patient ? `${patient.firstName} ${patient.lastName} (ID: ${patient.id})` : "None"}`,
    );

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const transformedData = {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      patientId: patient.mrn,
      dob: patient.dateOfBirth.toISOString().split("T")[0],
      sex: patient.sex,
      bloodType: patient.bloodType,

      phone: patient.phoneNumber,
      secondaryPhone: undefined, // Could add secondary phone to schema if needed
      email: patient.email,
      address: patient.addressLine1
        ? {
            line1: patient.addressLine1,
            line2: patient.addressLine2 ?? undefined,
            city: patient.city ?? "",
            state: patient.state ?? "",
            postalCode: patient.postalCode ?? "",
          }
        : undefined,

      insurance: {
        primary: patient.insurancePolicies.find(
          (p: {
            isPrimary: boolean;
            providerName: string;
            policyNumber: string;
            groupNumber: string | null;
          }) => p.isPrimary,
        )
          ? {
              provider: patient.insurancePolicies.find(
                (p: {
                  isPrimary: boolean;
                  providerName: string;
                  policyNumber: string;
                  groupNumber: string | null;
                }) => p.isPrimary,
              )!.providerName,
              policyNumber: patient.insurancePolicies.find(
                (p: {
                  isPrimary: boolean;
                  providerName: string;
                  policyNumber: string;
                  groupNumber: string | null;
                }) => p.isPrimary,
              )!.policyNumber,
              groupNumber:
                patient.insurancePolicies.find(
                  (p: {
                    isPrimary: boolean;
                    providerName: string;
                    policyNumber: string;
                    groupNumber: string | null;
                  }) => p.isPrimary,
                )!.groupNumber ?? undefined,
            }
          : undefined,
        secondary: patient.insurancePolicies.find(
          (p: {
            isPrimary: boolean;
            providerName: string;
            policyNumber: string;
          }) => !p.isPrimary,
        )
          ? {
              provider: patient.insurancePolicies.find(
                (p: {
                  isPrimary: boolean;
                  providerName: string;
                  policyNumber: string;
                }) => !p.isPrimary,
              )!.providerName,
              policyNumber: patient.insurancePolicies.find(
                (p: {
                  isPrimary: boolean;
                  providerName: string;
                  policyNumber: string;
                }) => !p.isPrimary,
              )!.policyNumber,
            }
          : undefined,
      },

      emergencyContacts: patient.emergencyContacts.map(
        (contact: { name: string; relation: string; phone: string }) => ({
          name: contact.name,
          relationship: contact.relation,
          phone: contact.phone,
          type: "Emergency Contact", // Could enhance schema to track contact type
        }),
      ),

      allergies: patient.allergies.map(
        (allergy: {
          substance: string;
          reaction: string | null;
          severity: string;
          notedOn: Date | null;
        }) => ({
          substance: allergy.substance,
          reaction: allergy.reaction ?? "Unknown reaction",
          severity: allergy.severity.toLowerCase() as
            | "mild"
            | "moderate"
            | "severe",
          notedOn: allergy.notedOn
            ? allergy.notedOn.toISOString().split("T")[0]
            : undefined,
        }),
      ),

      medications: patient.medications.map(
        (med: {
          name: string;
          dose: string | null;
          frequency: string | null;
          active: boolean;
        }) => ({
          name: med.name,
          dose: med.dose ?? "Unknown dose",
          frequency: med.frequency ?? "As needed",
          active: med.active,
          refills: 0, // Could add refills to schema if needed
        }),
      ),

      socialHistory: patient.socialHistory
        ? {
            tobacco: patient.socialHistory.tobaccoUse,
            alcohol: patient.socialHistory.alcoholUse,
            drugs: patient.socialHistory.drugUse,
            occupation: patient.socialHistory.occupation,
          }
        : undefined,

      pastConditions: patient.pastMedical.map(
        (event: {
          date: Date | null;
          type: string | null;
          description: string;
        }) => ({
          date: event.date
            ? event.date.toISOString().split("T")[0]
            : "Unknown date",
          bodyPart: event.type ?? "OTHER",
          notes: event.description,
        }),
      ),

      immunizations: patient.immunizations.map(
        (imm: {
          vaccine: string;
          administeredOn: Date;
          notes: string | null;
        }) => ({
          vaccine: imm.vaccine,
          administeredOn: imm.administeredOn.toISOString().split("T")[0],
          notes: imm.notes ?? undefined,
        }),
      ),

      familyHistory: patient.familyHistory.map(
        (history: {
          relation: string;
          condition: string;
          notes: string | null;
        }) => ({
          relation: history.relation,
          condition: history.condition,
          notes: history.notes ?? undefined,
        }),
      ),

      vitals: (() => {
        // Get the most recent vitals and organize them
        const latestVitals: Record<
          string,
          {
            type: string;
            numericValue: number | null;
            systolic: number | null;
            diastolic: number | null;
            recordedAt: Date;
          }
        > = {};

        patient.vitals.forEach(
          (vital: {
            type: string;
            numericValue: number | null;
            systolic: number | null;
            diastolic: number | null;
            recordedAt: Date;
          }) => {
            const existing = latestVitals[vital.type];
            if (
              !existing ||
              new Date(vital.recordedAt) > new Date(existing.recordedAt)
            ) {
              latestVitals[vital.type] = vital;
            }
          },
        );

        return {
          bloodPressure: latestVitals.BLOOD_PRESSURE
            ? {
                systolic: latestVitals.BLOOD_PRESSURE.systolic ?? 0,
                diastolic: latestVitals.BLOOD_PRESSURE.diastolic ?? 0,
              }
            : undefined,
          heartRate: latestVitals.HEART_RATE?.numericValue ?? undefined,
          temperature: latestVitals.TEMPERATURE?.numericValue ?? undefined,
          height: latestVitals.HEIGHT
            ? `${latestVitals.HEIGHT.numericValue}m`
            : undefined,
          weight: latestVitals.WEIGHT
            ? `${latestVitals.WEIGHT.numericValue}kg`
            : undefined,
          bmi: latestVitals.BMI?.numericValue ?? undefined,
          respiratoryRate:
            latestVitals.RESPIRATION_RATE?.numericValue ?? undefined,
          oxygenSaturation: latestVitals.SPO2?.numericValue ?? undefined,
        };
      })(),

      recentNotes: patient.notes
        .filter((note: { createdAt: Date; content: string }) => {
          // Filter out assessment notes (they have their own section)
          const bodyParts = [
            "HEAD:",
            "NECK:",
            "CHEST:",
            "HEART:",
            "LEFT LUNG:",
            "RIGHT LUNG:",
            "ABDOMEN:",
            "STOMACH:",
            "LIVER:",
            "LEFT KIDNEY:",
            "RIGHT KIDNEY:",
            "LEFT SHOULDER:",
            "RIGHT SHOULDER:",
            "LEFT ARM:",
            "RIGHT ARM:",
            "LEFT FOREARM:",
            "RIGHT FOREARM:",
            "LEFT WRIST:",
            "RIGHT WRIST:",
            "LEFT THIGH:",
            "RIGHT THIGH:",
            "LEFT SHIN:",
            "RIGHT SHIN:",
            "LEFT FOOT:",
            "RIGHT FOOT:",
            "SPINE:",
            "PELVIS:",
          ];
          return !bodyParts.some((part) => note.content.startsWith(part));
        })
        .map((note: { createdAt: Date; content: string }) => ({
          date: note.createdAt.toISOString().split("T")[0],
          provider: "Clinical Provider", // Could enhance schema to track provider
          content: note.content,
        })),

      upcomingAppointments: [], // Could implement appointments table if needed
      
      // DICOM Files from ImagingStudy table
      dicomFiles: (() => {
        console.log(`🔍 Found ${patient.imaging.length} imaging studies for patient ${patient.id}`);
        return patient.imaging.map((study: any) => {
        // Try to parse imageUrl as JSON array (for series), fallback to single URL
        let imageUrls: Array<{ name: string; url: string }> = [];
        try {
          imageUrls = JSON.parse(study.imageUrl || '[]');
        } catch {
          // Fallback for single URL format
          if (study.imageUrl) {
            imageUrls = [{ name: study.description || 'DICOM Image', url: study.imageUrl }];
          }
        }

        const dicomFile = {
          id: study.id,
          name: study.description ?? `${study.modality} Study`,
          modality: study.modality,
          description: study.description,
          performedOn: study.performedOn?.toISOString().split('T')[0],
          images: imageUrls, // Array of images in the series
          url: imageUrls[0]?.url || '', // First image URL for backward compatibility
        };
        console.log(`📋 DICOM file processed:`, dicomFile);
        return dicomFile;
      });
      })(),
    };

    await logUserAction({
      action: ActionType.ACCESS,
      resource: "patient",
      resourceId: patient.id,
      request,
      success: true,
      metadata: { mrn: patient.mrn },
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    await logUserAction({
      action: ActionType.ACCESS,
      resource: "patient",
      request,
      success: false,
    });
    return NextResponse.json(
      { error: "Failed to fetch patient data" },
      { status: 500 },
    );
  }
}
