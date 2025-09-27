"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";
import { type Prisma } from "@prisma/client";

// Define enum types locally to avoid import issues
type PrismaBloodType = "A_POS" | "A_NEG" | "B_POS" | "B_NEG" | "AB_POS" | "AB_NEG" | "O_POS" | "O_NEG" | "UNKNOWN";
type PrismaSex = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
type PrismaVitalType = "TEMPERATURE" | "HEART_RATE" | "BLOOD_PRESSURE" | "RESPIRATORY_RATE" | "OXYGEN_SATURATION" | "HEIGHT" | "WEIGHT" | "BMI";
type PrismaNoteSection = "CURRENT_INJURIES" | "ASSESSMENT_PLAN" | "CLINICAL_NOTES";
type PrismaEncounterNoteType = "ADMISSION" | "PROGRESS" | "DISCHARGE" | "CONSULTATION";

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
  uploadedFiles: z.array(z.string().url()).default([]),
  dicomSeries: z.array(z.object({
    seriesName: z.string(),
    modality: z.string().optional(),
    files: z.array(z.object({
      name: z.string(),
      url: z.string(),
    })),
  })).default([]),
});

function mapSex(input: string): PrismaSex {
  const v = input.trim().toLowerCase();
  if (v === "male") return "MALE";
  if (v === "female") return "FEMALE";
  if (v === "other") return "OTHER";
  return "UNKNOWN";
}

function mapBloodType(input: string): PrismaBloodType | null {
  const v = input.trim().toUpperCase();
  switch (v) {
    case "A+":
      return "A_POS";
    case "A-":
      return "A_NEG";
    case "B+":
      return "B_POS";
    case "B-":
      return "B_NEG";
    case "AB+":
      return "AB_POS";
    case "AB-":
      return "AB_NEG";
    case "O+":
      return "O_POS";
    case "O-":
      return "O_NEG";
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
  } catch (_err) {
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
    const patient = await (db as any).patient.upsert({
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
      await (db as any).socialHistory.upsert({
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
    const vitalsToCreate: any[] = [];
    const heartRate = parseNumber(data.vitals.heartRate);
    if (heartRate !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: "HEART_RATE",
        unit: "bpm",
        numericValue: heartRate,
      });
    }
    const temperature = parseNumber(data.vitals.temperature);
    if (temperature !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: "TEMPERATURE",
        unit: "F",
        numericValue: temperature,
      });
    }
    const weight = parseNumber(data.vitals.weight);
    if (weight !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: "WEIGHT",
        unit: "kg",
        numericValue: weight,
      });
    }
    const height = parseNumber(data.vitals.height);
    if (height !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: "HEIGHT",
        unit: "m",
        numericValue: height,
      });
    }
    const bmi = parseNumber(data.vitals.bmi);
    if (bmi !== null) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: "BMI",
        numericValue: bmi,
      });
    }
    const bp = parseBloodPressure(data.vitals.bloodPressure);
    if (bp) {
      vitalsToCreate.push({
        patientId: patient.id,
        type: "BLOOD_PRESSURE",
        systolic: bp.systolic,
        diastolic: bp.diastolic,
      });
    }
    if (vitalsToCreate.length > 0) {
      await (db as any).vitalSign.createMany({ data: vitalsToCreate });
    }

    // General Notes and Allergies captured as Clinical Notes
    const notesToCreate: Array<{ content: string }> = [];
    if (data.generalNotes) notesToCreate.push({ content: data.generalNotes });
    if (data.allergies)
      notesToCreate.push({ content: `Allergies: ${data.allergies}` });
    if (notesToCreate.length > 0) {
      await (db as any).clinicalNote.createMany({
        data: notesToCreate.map((n) => ({
          patientId: patient.id,
          section: "CLINICAL_NOTES",
          type: "ADMISSION",
          content: n.content,
        })),
      });
    }

    // Medications - Add new medications, don't duplicate existing ones
    if (data.medications.length > 0) {
      const existingMedications = await (db as any).medication.findMany({
        where: { patientId: patient.id, active: true },
        select: { name: true, dose: true, frequency: true },
      });

      const medicationsToCreate = data.medications
        .filter((med) => {
          if (!med.name.trim()) return false;
          // Check if this medication already exists for this patient
          return !existingMedications.some(
            (existing: any) =>
              existing.name === med.name &&
              existing.dose === (med.dosage || null) &&
              existing.frequency === (med.schedule || null),
          );
        })
        .map((med) => ({
          patientId: patient.id,
          name: med.name,
          dose: med.dosage || null,
          frequency: med.schedule || null,
          active: true,
        }));

      if (medicationsToCreate.length > 0) {
        await (db as any).medication.createMany({ data: medicationsToCreate });
      }
    }

    // Past Medical Conditions - Add new conditions, avoid duplicates
    if (data.pastConditions.length > 0) {
      const existingConditions = await (db as any).pastMedicalEvent.findMany({
        where: { patientId: patient.id },
        select: { type: true, description: true },
      });

      const conditionsToCreate = data.pastConditions
        .filter((condition) => {
          if (!condition.notes.trim()) return false;
          // Check if this condition already exists for this patient
          return !existingConditions.some(
            (existing: any) =>
              existing.type === (condition.bodyPart || "Unknown") &&
              existing.description === condition.notes,
          );
        })
        .map((condition) => ({
          patientId: patient.id,
          type: condition.bodyPart || "Unknown",
          description: condition.notes,
          date: condition.date ? new Date(condition.date) : null,
        }));

      if (conditionsToCreate.length > 0) {
        await (db as any).pastMedicalEvent.createMany({ data: conditionsToCreate });
      }
    }

    // Immunizations - Add new immunizations, avoid duplicates
    if (data.immunizations.length > 0) {
      const existingImmunizations = await (db as any).immunization.findMany({
        where: { patientId: patient.id },
        select: { vaccine: true, notes: true },
      });

      const immunizationsToCreate = data.immunizations
        .filter((immunization) => {
          if (!immunization.notes.trim()) return false;
          // Check if this immunization already exists for this patient
          return !existingImmunizations.some(
            (existing: any) =>
              existing.vaccine === immunization.notes &&
              existing.notes === immunization.notes,
          );
        })
        .map((immunization) => ({
          patientId: patient.id,
          vaccine: immunization.notes, // Using notes as vaccine name for now
          administeredOn: immunization.date
            ? new Date(immunization.date)
            : new Date(),
          notes: immunization.notes,
        }));

      if (immunizationsToCreate.length > 0) {
        await (db as any).immunization.createMany({ data: immunizationsToCreate });
      }
    }

    // Family History - Add new family history, avoid duplicates
    if (data.familyHistory.length > 0) {
      const existingFamilyHistory = await (db as any).familyHistoryCondition.findMany({
        where: { patientId: patient.id },
        select: { relation: true, condition: true },
      });

      const familyHistoryToCreate = data.familyHistory
        .filter((history) => {
          if (!history.notes.trim()) return false;
          // Check if this family history already exists for this patient
          return !existingFamilyHistory.some(
            (existing: any) =>
              existing.relation === (history.bodyPart || "Unknown") &&
              existing.condition === history.notes,
          );
        })
        .map((history) => ({
          patientId: patient.id,
          relation: history.bodyPart || "Unknown",
          condition: history.notes,
          notes: history.date ? `Date: ${history.date}` : null,
        }));

      if (familyHistoryToCreate.length > 0) {
        await (db as any).familyHistoryCondition.createMany({
          data: familyHistoryToCreate,
        });
      }
    }

    // Advance care plan
    if (data.dnr || data.preventiveCare) {
      await (db as any).advanceCarePlan.create({
        data: {
          patientId: patient.id,
          dnr: Boolean(data.dnr),
          notes: data.preventiveCare || null,
        },
      });
    }

    // Upload files handling - save uploaded file URLs to Document table
    if (data.uploadedFiles.length > 0) {
      const documentsToCreate = data.uploadedFiles.map((fileUrl) => {
        // Extract filename from URL for title
        const urlParts = fileUrl.split("/");
        const filename = urlParts[urlParts.length - 1] ?? "Uploaded Document";
        const title = filename.includes(".")
          ? filename.substring(0, filename.lastIndexOf("."))
          : filename;

        // Determine content type from URL extension
        let contentType = "application/octet-stream";
        if (fileUrl.includes(".pdf")) contentType = "application/pdf";
        else if (fileUrl.includes(".jpg") || fileUrl.includes(".jpeg"))
          contentType = "image/jpeg";
        else if (fileUrl.includes(".png")) contentType = "image/png";
        else if (fileUrl.includes(".doc")) contentType = "application/msword";
        else if (fileUrl.includes(".docx"))
          contentType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        return {
          patientId: patient.id,
          title,
          url: fileUrl,
          contentType,
          notes: "Uploaded via EMR upload form",
        };
      });

      await (db as any).document.createMany({
        data: documentsToCreate,
      });
    }

    // DICOM series handling - save DICOM series to ImagingStudy table
    if (data.dicomSeries.length > 0) {
      console.log(`💾 Saving ${data.dicomSeries.length} DICOM series to database:`, data.dicomSeries);
      const imagingStudiesToCreate = data.dicomSeries.map((series) => {
        // Determine modality from provided modality or series name
        let modality: "CT" | "MRI" | "XRAY" | "ULTRASOUND" | "OTHER" = "OTHER";
        const modalityCheck = (series.modality || series.seriesName).toLowerCase();
        if (modalityCheck.includes("ct")) modality = "CT";
        else if (modalityCheck.includes("mri")) modality = "MRI";
        else if (modalityCheck.includes("xray") || modalityCheck.includes("x-ray")) modality = "XRAY";
        else if (modalityCheck.includes("ultrasound")) modality = "ULTRASOUND";
        else if (series.modality && ["CT", "MRI", "XRAY", "ULTRASOUND"].includes(series.modality)) {
          modality = series.modality as "CT" | "MRI" | "XRAY" | "ULTRASOUND";
        }

        return {
          patientId: patient.id,
          modality,
          description: `${series.seriesName} (${series.files.length} slices)`,
          imageUrl: JSON.stringify(series.files), // Store all URLs as JSON
          performedOn: new Date(),
        };
      });

      console.log(`💾 Creating ${imagingStudiesToCreate.length} imaging studies:`, imagingStudiesToCreate);
      await (db as any).imagingStudy.createMany({
        data: imagingStudiesToCreate,
      });
      console.log(`✅ Successfully saved ${imagingStudiesToCreate.length} DICOM series to database`);
    }

    return { ok: true } as const;
  } catch (_err) {
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
