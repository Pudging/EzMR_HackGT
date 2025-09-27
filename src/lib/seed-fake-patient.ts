import { db } from "@/server/db";
import { Sex, BloodType, AllergySeverity, VitalType, MedicationRoute } from "@prisma/client";

async function createPatientForTenant(tenantId: string, tenantName: string) {
  // Create Kevin Ketong Gao patient with MRN 1 for this tenant
  const kevin = await db.patient.upsert({
    where: { 
      tenantId_mrn: {
        tenantId: tenantId,
        mrn: '1'
      }
    },
    update: {
      firstName: 'Kevin',
      lastName: 'Ketong Gao',
      dateOfBirth: new Date('1995-03-15'),
      sex: Sex.MALE,
      bloodType: BloodType.O_POS,
      addressLine1: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      phoneNumber: '+1-555-0123',
      email: 'kevin.gao@example.com',
    },
    create: {
      tenantId: tenantId,
      mrn: '1',
      firstName: 'Kevin',
      lastName: 'Ketong Gao',
      dateOfBirth: new Date('1995-03-15'),
      sex: Sex.MALE,
      bloodType: BloodType.O_POS,
      addressLine1: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      phoneNumber: '+1-555-0123',
      email: 'kevin.gao@example.com',
    },
  });

  // Add emergency contact
  await db.emergencyContact.upsert({
    where: { id: `emergency_${kevin.id}` },
    update: {},
    create: {
      id: `emergency_${kevin.id}`,
      patientId: kevin.id,
      name: 'Sarah Gao',
      relation: 'Sister',
      phone: '+1-555-0124',
      address: '456 Family Lane, San Francisco, CA 94102',
    },
  });

  // Add insurance policy
  await db.insurancePolicy.upsert({
    where: { id: `insurance_${kevin.id}` },
    update: {},
    create: {
      id: `insurance_${kevin.id}`,
      patientId: kevin.id,
      providerName: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS123456789',
      groupNumber: 'GRP001',
      planName: 'Premium Health Plan',
      effectiveDate: new Date('2023-01-01'),
      isPrimary: true,
    },
  });

  // Add allergies
  const allergies = [
    { substance: 'Penicillin', reaction: 'Skin rash, hives', severity: AllergySeverity.MODERATE, notedOn: new Date('2023-06-15') },
    { substance: 'Shellfish', reaction: 'Swelling, difficulty breathing', severity: AllergySeverity.SEVERE, notedOn: new Date('2020-08-10') },
    { substance: 'Peanuts', reaction: 'Mild digestive upset', severity: AllergySeverity.MILD, notedOn: new Date('2019-03-22') },
  ];

  for (const allergy of allergies) {
    await db.allergy.create({
      data: {
        patientId: kevin.id,
        ...allergy,
      },
    });
  }

  // Add medications
  const medications = [
    {
      name: 'Lisinopril',
      dose: '10mg',
      route: MedicationRoute.PO,
      frequency: 'Once daily',
      startDate: new Date('2023-01-15'),
      notes: 'For blood pressure management',
    },
    {
      name: 'Vitamin D3',
      dose: '2000 IU',
      route: MedicationRoute.PO,
      frequency: 'Once daily',
      startDate: new Date('2023-02-01'),
      notes: 'Supplement for vitamin D deficiency',
    },
  ];

  for (const med of medications) {
    await db.medication.create({
      data: {
        patientId: kevin.id,
        ...med,
      },
    });
  }

  // Add social history
  await db.socialHistory.upsert({
    where: { patientId: kevin.id },
    update: {},
    create: {
      patientId: kevin.id,
      tobaccoUse: 'Former smoker, quit 2019',
      alcoholUse: 'Social drinker, 2-3 drinks per week',
      drugUse: 'No illicit drug use',
      occupation: 'Software Engineer',
      livingSituation: 'Lives alone in apartment',
      notes: 'Active lifestyle, exercises regularly',
    },
  });

  // Add past medical events
  const pastEvents = [
    {
      type: 'Surgery',
      description: 'Appendectomy - successful recovery',
      date: new Date('2018-07-20'),
    },
    {
      type: 'Injury',
      description: 'Fractured left wrist from skateboarding accident',
      date: new Date('2020-09-15'),
    },
    {
      type: 'Illness',
      description: 'COVID-19 infection, mild symptoms',
      date: new Date('2022-01-10'),
    },
  ];

  for (const event of pastEvents) {
    await db.pastMedicalEvent.create({
      data: {
        patientId: kevin.id,
        ...event,
      },
    });
  }

  // Add family history
  const familyHistory = [
    {
      relation: 'Father',
      condition: 'Hypertension',
      notes: 'Diagnosed at age 45, well controlled',
    },
    {
      relation: 'Mother',
      condition: 'Type 2 Diabetes',
      notes: 'Well controlled with medication',
    },
    {
      relation: 'Grandfather (paternal)',
      condition: 'Heart disease',
      notes: 'Had heart attack at age 68',
    },
  ];

  for (const history of familyHistory) {
    await db.familyHistoryCondition.create({
      data: {
        patientId: kevin.id,
        ...history,
      },
    });
  }

  // Add immunizations
  const immunizations = [
    {
      vaccine: 'COVID-19 (Pfizer)',
      administeredOn: new Date('2021-04-15'),
      notes: 'First dose',
    },
    {
      vaccine: 'COVID-19 Booster (Pfizer)',
      administeredOn: new Date('2023-11-15'),
      notes: 'Updated booster',
    },
    {
      vaccine: 'Influenza',
      administeredOn: new Date('2024-10-01'),
      notes: 'Annual flu shot',
    },
  ];

  for (const imm of immunizations) {
    await db.immunization.create({
      data: {
        patientId: kevin.id,
        ...imm,
      },
    });
  }

  // Add vital signs
  const vitals = [
    {
      type: VitalType.BLOOD_PRESSURE,
      recordedAt: new Date('2024-01-15'),
      systolic: 128,
      diastolic: 82,
      unit: 'mmHg',
    },
    {
      type: VitalType.HEART_RATE,
      recordedAt: new Date('2024-01-15'),
      numericValue: 72,
      unit: 'bpm',
    },
    {
      type: VitalType.TEMPERATURE,
      recordedAt: new Date('2024-01-15'),
      numericValue: 98.6,
      unit: '°F',
    },
    {
      type: VitalType.HEIGHT,
      recordedAt: new Date('2024-01-15'),
      numericValue: 1.75,
      unit: 'm',
    },
    {
      type: VitalType.WEIGHT,
      recordedAt: new Date('2024-01-15'),
      numericValue: 70,
      unit: 'kg',
    },
    {
      type: VitalType.BMI,
      recordedAt: new Date('2024-01-15'),
      numericValue: 22.9,
      unit: 'kg/m²',
    },
  ];

  for (const vital of vitals) {
    await db.vitalSign.create({
      data: {
        patientId: kevin.id,
        ...vital,
      },
    });
  }

  // Add clinical notes
  const clinicalNotes = [
    {
      content: '[2024-01-15 10:30] Patient presents for annual physical examination. Generally feeling well. No acute complaints.',
      type: 'PROGRESS' as const,
      section: 'OTHER' as const,
    },
    {
      content: '[2023-12-20 14:45] Routine follow-up for hypertension management. Blood pressure well controlled on current medication.',
      type: 'PROGRESS' as const,
      section: 'HEART' as const,
    },
    {
      content: '[2023-11-10 09:15] Patient reports occasional headaches, possibly stress-related. Advised stress management techniques.',
      type: 'PROGRESS' as const,
      section: 'HEAD' as const,
    },
  ];

  for (const note of clinicalNotes) {
    await db.clinicalNote.create({
      data: {
        patientId: kevin.id,
        ...note,
      },
    });
  }

  console.log(`✅ Successfully seeded fake patient data for Kevin Ketong Gao (MRN: 1) in ${tenantName}`);
  return kevin;
}

export async function seedFakePatient() {
  try {
    // Create both localhost and emory tenants for flexibility
    const localhostTenant = await db.tenant.upsert({
      where: { subdomain: 'localhost' },
      update: {},
      create: {
        subdomain: 'localhost',
        hospitalName: 'Local Development Hospital',
      },
    });

    // Also create emory tenant
    const emoryTenant = await db.tenant.upsert({
      where: { subdomain: 'emory' },
      update: {},
      create: {
        subdomain: 'emory',
        hospitalName: 'Emory University Hospital',
      },
    });

    // Create patients for both tenants
    const localhostPatient = await createPatientForTenant(localhostTenant.id, 'localhost');
    const emoryPatient = await createPatientForTenant(emoryTenant.id, 'emory');

    console.log('🎉 Successfully seeded patients for both localhost and emory tenants');
    return { localhostPatient, emoryPatient };

  } catch (error) {
    console.error('❌ Error seeding tenants and patients:', error);
    throw error;
  }
}