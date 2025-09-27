"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";
import {
  BloodType as PrismaBloodType,
  Sex as PrismaSex,
  VitalType as PrismaVitalType,
  NoteSection as PrismaNoteSection,
  EncounterNoteType as PrismaEncounterNoteType,
  type Prisma,
} from "@prisma/client";

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  schedule: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
});

const conditionSchema = z.object({
  date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  bodyPart: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  notes: z.string().min(1),
});

const immunizationSchema = z.object({
  date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  notes: z.string().min(1),
});

const familyHistorySchema = z.object({
  date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  bodyPart: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  notes: z.string().min(1),
});

const patientDataSchema = z.object({
  name: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  dob: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  sex: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  address: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  insurance: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  emergencyContact: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  patientId: z.string().min(1),
  vitals: z
    .object({
      bloodPressure: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      heartRate: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      temperature: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      weight: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      height: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      bmi: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      bloodType: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
    })
    .default({
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      bmi: "",
      bloodType: "",
    }),
  medications: z.array(medicationSchema).default([]),
  socialHistory: z
    .object({
      smoking: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      drugs: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
      alcohol: z
        .string()
        .optional()
        .nullable()
        .transform((v) => v ?? ""),
    })
    .default({ smoking: "", drugs: "", alcohol: "" }),
  pastConditions: z.array(conditionSchema).default([]),
  immunizations: z.array(immunizationSchema).default([]),
  familyHistory: z.array(familyHistorySchema).default([]),
  allergies: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  generalNotes: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  dnr: z.boolean().optional().default(false),
  preventiveCare: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
});

function mapSex(input: string): PrismaSex {
  const v = input.trim().toLowerCase();
  if (v === "male") return PrismaSex.MALE;
  if (v === "female") return PrismaSex.FEMALE;
  if (v === "other") return PrismaSex.OTHER;
  return PrismaSex.UNKNOWN;
}

function mapBloodType(input: string): PrismaBloodType | null {
  const v = input.trim().toUpperCase();
  switch (v) {
    case "A+":
      return PrismaBloodType.A_POS;
    case "A-":
      return PrismaBloodType.A_NEG;
    case "B+":
      return PrismaBloodType.B_POS;
    case "B-":
      return PrismaBloodType.B_NEG;
    case "AB+":
      return PrismaBloodType.AB_POS;
    case "AB-":
      return PrismaBloodType.AB_NEG;
    case "O+":
      return PrismaBloodType.O_POS;
    case "O-":
      return PrismaBloodType.O_NEG;
    default:
      return null;
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const name = (fullName ?? "").trim();
  if (!name) return { firstName: "", lastName: "" };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] ?? "", lastName: "" };
  const lastName = parts.pop() ?? "";
  return { firstName: parts.join(" "), lastName };
}

function parseNumber(input: string): number | null {
  const match = /-?\d+(?:\.\d+)?/.exec(input);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

function parseBloodPressure(
  input: string,
): { systolic: number; diastolic: number } | null {
  const m = /(\d{2,3})\s*[/\\]\s*(\d{2,3})/.exec(input);
  if (!m) return null;
  const sys = Number(m[1]);
  const dia = Number(m[2]);
  if (!Number.isFinite(sys) || !Number.isFinite(dia)) return null;
  return { systolic: sys, diastolic: dia };
}

export type SaveEmrResult = { ok: true } | { ok: false; error: string };

export async function saveEmrFromForm(
  formData: FormData,
): Promise<SaveEmrResult> {
  // Keep headers() usage to ensure this runs on server and can read host
  await headers();

  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return { ok: false, error: "Missing payload" } as const;
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(payloadRaw);
  } catch (err) {
    return { ok: false, error: "Invalid JSON" } as const;
  }

  const parsed = patientDataSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } as const;
  }

  const data = parsed.data;

  const tenant = await getCurrentTenant();
  if (!tenant) {
    return { ok: false, error: "Tenant not found in host" } as const;
  }

  const { firstName, lastName } = splitName(data.name);
  const sex = mapSex(data.sex);
  const bloodType = mapBloodType(data.vitals.bloodType);
  const dob = data.dob ? new Date(data.dob) : null;

  try {
    // Upsert Patient by tenantId + MRN
    const patient = await db.patient.upsert({
      where: {
        tenantId_mrn: {
          tenantId: tenant.id,
          mrn: data.patientId,
        },
      },
      update: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        dateOfBirth: dob ?? undefined,
        sex,
        addressLine1: data.address || undefined,
        phoneNumber: data.phone || undefined,
        bloodType: bloodType ?? undefined,
      },
      create: {
        tenantId: tenant.id,
        mrn: data.patientId,
        firstName: firstName || "",
        lastName: lastName || "",
        dateOfBirth: dob ?? new Date(),
        sex,
        addressLine1: data.address || null,
        phoneNumber: data.phone || null,
        bloodType: bloodType ?? undefined,
      },
      select: { id: true },
    });

    // Upsert SocialHistory (unique on patientId)
    if (
      data.socialHistory.smoking ||
      data.socialHistory.alcohol ||
      data.socialHistory.drugs
    ) {
      await db.socialHistory.upsert({
        where: { patientId: patient.id },
        update: {
          tobaccoUse: data.socialHistory.smoking || undefined,
          alcoholUse: data.socialHistory.alcohol || undefined,
          drugUse: data.socialHistory.drugs || undefined,
        },
        create: {
          patientId: patient.id,
          tobaccoUse: data.socialHistory.smoking || null,
          alcoholUse: data.socialHistory.alcohol || null,
          drugUse: data.socialHistory.drugs || null,
        },
      });
    }

    // Vitals entries
    const vitalsToCreate: Prisma.VitalSignCreateManyInput[] = [];
    const heartRate = parseNumber(data.vitals.heartRate);
    if (heartRate !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: PrismaVitalType.HEART_RATE,
        unit: "bpm",
        numericValue: heartRate,
      });
    }
    const temperature = parseNumber(data.vitals.temperature);
    if (temperature !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: PrismaVitalType.TEMPERATURE,
        unit: "F",
        numericValue: temperature,
      });
    }
    const weight = parseNumber(data.vitals.weight);
    if (weight !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: PrismaVitalType.WEIGHT,
        unit: "kg",
        numericValue: weight,
      });
    }
    const height = parseNumber(data.vitals.height);
    if (height !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: PrismaVitalType.HEIGHT,
        unit: "m",
        numericValue: height,
      });
    }
    const bmi = parseNumber(data.vitals.bmi);
    if (bmi !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: PrismaVitalType.BMI,
        numericValue: bmi,
      });
    }
    const bp = parseBloodPressure(data.vitals.bloodPressure);
    if (bp) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: PrismaVitalType.BLOOD_PRESSURE,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
      });
    }
    if (vitalsToCreate.length > 0) {
      await db.vitalSign.createMany({ data: vitalsToCreate });
    }

    // General Notes and Allergies captured as Clinical Notes
    const notesToCreate: Array<{ content: string }> = [];
    if (data.generalNotes) notesToCreate.push({ content: data.generalNotes });
    if (data.allergies)
      notesToCreate.push({ content: `Allergies: ${data.allergies}` });
    if (notesToCreate.length > 0) {
      await db.clinicalNote.createMany({
        data: notesToCreate.map((n) => ({
          patientId: patient.id,
          section: PrismaNoteSection.OTHER,
          type: PrismaEncounterNoteType.OTHER,
          content: n.content,
        })),
      });
    }

    // Medications - Add new medications, don't duplicate existing ones
    if (data.medications.length > 0) {
      const existingMedications = await db.medication.findMany({
        where: { patientId: patient.id, active: true },
        select: { name: true, dose: true, frequency: true }
      });
      
      const medicationsToCreate = data.medications
        .filter(med => {
          if (!med.name.trim()) return false;
          // Check if this medication already exists for this patient
          return !existingMedications.some(existing => 
            existing.name === med.name && 
            existing.dose === (med.dosage || null) &&
            existing.frequency === (med.schedule || null)
          );
        })
        .map(med => ({
          patientId: patient.id,
          name: med.name,
          dose: med.dosage || null,
          frequency: med.schedule || null,
          active: true,
        }));
      
      if (medicationsToCreate.length > 0) {
        await db.medication.createMany({ data: medicationsToCreate });
      }
    }

    // Past Medical Conditions - Add new conditions, avoid duplicates
    if (data.pastConditions.length > 0) {
      const existingConditions = await db.pastMedicalEvent.findMany({
        where: { patientId: patient.id },
        select: { type: true, description: true }
      });
      
      const conditionsToCreate = data.pastConditions
        .filter(condition => {
          if (!condition.notes.trim()) return false;
          // Check if this condition already exists for this patient
          return !existingConditions.some(existing => 
            existing.type === (condition.bodyPart || 'Unknown') && 
            existing.description === condition.notes
          );
        })
        .map(condition => ({
          patientId: patient.id,
          type: condition.bodyPart || 'Unknown',
          description: condition.notes,
          date: condition.date ? new Date(condition.date) : null,
        }));
      
      if (conditionsToCreate.length > 0) {
        await db.pastMedicalEvent.createMany({ data: conditionsToCreate });
      }
    }

    // Immunizations - Add new immunizations, avoid duplicates
    if (data.immunizations.length > 0) {
      const existingImmunizations = await db.immunization.findMany({
        where: { patientId: patient.id },
        select: { vaccine: true, notes: true }
      });
      
      const immunizationsToCreate = data.immunizations
        .filter(immunization => {
          if (!immunization.notes.trim()) return false;
          // Check if this immunization already exists for this patient
          return !existingImmunizations.some(existing => 
            existing.vaccine === immunization.notes && 
            existing.notes === immunization.notes
          );
        })
        .map(immunization => ({
          patientId: patient.id,
          vaccine: immunization.notes, // Using notes as vaccine name for now
          administeredOn: immunization.date ? new Date(immunization.date) : new Date(),
          notes: immunization.notes,
        }));
      
      if (immunizationsToCreate.length > 0) {
        await db.immunization.createMany({ data: immunizationsToCreate });
      }
    }

    // Family History - Add new family history, avoid duplicates
    if (data.familyHistory.length > 0) {
      const existingFamilyHistory = await db.familyHistoryCondition.findMany({
        where: { patientId: patient.id },
        select: { relation: true, condition: true }
      });
      
      const familyHistoryToCreate = data.familyHistory
        .filter(history => {
          if (!history.notes.trim()) return false;
          // Check if this family history already exists for this patient
          return !existingFamilyHistory.some(existing => 
            existing.relation === (history.bodyPart || 'Unknown') && 
            existing.condition === history.notes
          );
        })
        .map(history => ({
          patientId: patient.id,
          relation: history.bodyPart || 'Unknown',
          condition: history.notes,
          notes: history.date ? `Date: ${history.date}` : null,
        }));
      
      if (familyHistoryToCreate.length > 0) {
        await db.familyHistoryCondition.createMany({ data: familyHistoryToCreate });
      }
    }

    // Advance care plan
    if (data.dnr || data.preventiveCare) {
      await db.advanceCarePlan.create({
        data: {
          patientId: patient.id,
          dnr: Boolean(data.dnr),
          notes: data.preventiveCare || null,
        },
      });
    }

    return { ok: true } as const;
  } catch (err) {
    return { ok: false, error: "Failed to save EMR" } as const;
  }
}

// Wrapper compatible with useFormState(prevState, formData)
export async function saveEmr(
  _prevState: SaveEmrResult,
  formData: FormData,
): Promise<SaveEmrResult> {
  return saveEmrFromForm(formData);
}
