import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";

type ClinicalNoteRecord = {
  content: string;
  section?: string | null;
  createdAt?: Date;
};

// Narrowly typed prisma delegate shim to avoid explicit any and missing delegate types
const prisma = db as unknown as {
  tenant: { findFirst: (args?: unknown) => Promise<{ id: string; subdomain: string; hospitalName: string } | null> };
  patient: { findFirst: (args: unknown) => Promise<{ id: string } | null> };
  clinicalNote: {
    findMany: (args: unknown) => Promise<ClinicalNoteRecord[]>;
    deleteMany: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<ClinicalNoteRecord>;
  };
};

interface PatientParams {
  patientId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<PatientParams> }
) {
  try {
    let tenant = await getCurrentTenant();
    
    // Default fallback for localhost - use any available tenant
    tenant ??= await prisma.tenant.findFirst();
    
    if (!tenant) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const { patientId } = await params;
    
    console.log(`🔍 Looking for assessment data for patient MRN: ${patientId} in tenant: ${tenant.subdomain}`);

    // First, find the patient to get their internal ID
    const patient = await prisma.patient.findFirst({
      where: {
        tenantId: tenant.id,
        mrn: patientId,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch clinical notes that contain assessment data
    const clinicalNotes = await prisma.clinicalNote.findMany({
      where: {
        patientId: patient.id,
        OR: [
          {
            type: 'OTHER',
            content: {
              contains: ':'
            }
          },
          {
            section: {
              in: ['HEAD', 'ARM', 'HEART']
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform clinical notes into assessment data format
    const assessmentData: Record<string, string> = {};

    // Look for notes that start with body part indicators
    const bodyPartPatterns = [
      'head', 'neck', 'chest', 'heart', 'left-lung', 'right-lung',
      'abdomen', 'stomach', 'liver', 'left-kidney', 'right-kidney',
      'left-shoulder', 'right-shoulder', 'left-arm', 'right-arm',
      'left-forearm', 'right-forearm', 'left-wrist', 'right-wrist',
      'left-thigh', 'right-thigh', 'left-shin', 'right-shin',
      'left-foot', 'right-foot', 'spine', 'pelvis'
    ];

    clinicalNotes.forEach((note: ClinicalNoteRecord) => {
      const _content = note.content.toLowerCase();
      
      // Try to match body part from note content
      for (const bodyPart of bodyPartPatterns) {
        const bodyPartUpper = bodyPart.toUpperCase().replace('-', ' ');
        
        // Look for patterns like "HEAD: note content" or "[BODY_PART] note content"
        const patterns = [
          new RegExp(`^${bodyPartUpper}:?\\s*(.+)`, 'i'),
          new RegExp(`\\[${bodyPartUpper}\\]\\s*(.+)`, 'i'),
          new RegExp(`${bodyPartUpper}\\s*-\\s*(.+)`, 'i'),
        ];
        
        for (const pattern of patterns) {
          const match = note.content.match(pattern);
          if (match?.[1]) {
            // If we don't already have data for this body part, or if this note is newer
            if (!assessmentData[bodyPart]) {
              assessmentData[bodyPart] = match[1].trim();
              break;
            }
          }
        }
      }
      
      // Also check section field if it matches our body parts
      if (note.section?.length && note.section !== 'OTHER') {
        const sectionBodyPart = note.section.toLowerCase().replace('_', '-');
        if (bodyPartPatterns.includes(sectionBodyPart) && !assessmentData[sectionBodyPart]) {
          assessmentData[sectionBodyPart] = note.content;
        }
      }
    });

    console.log(`📋 Found assessment data for ${Object.keys(assessmentData).length} body parts`);

    return NextResponse.json(assessmentData);

  } catch (error) {
    console.error('Error fetching patient assessment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<PatientParams> }
) {
  try {
    let tenant = await getCurrentTenant();
    
    // Default fallback for localhost - use any available tenant
    tenant ??= await prisma.tenant.findFirst();
    
    if (!tenant) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const { patientId } = await params;
    const assessmentData = await request.json();
    
    console.log(`💾 Saving assessment data for patient MRN: ${patientId}`);

    // First, find the patient to get their internal ID
    const patient = await prisma.patient.findFirst({
      where: {
        tenantId: tenant.id,
        mrn: patientId,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Save each body part's assessment data as a clinical note (upsert strategy)
    const notes = [];
    for (const [bodyPart, content] of Object.entries(assessmentData)) {
      const bodyPartUpper = bodyPart.toUpperCase().replace('-', ' ');
      
      if (content && typeof content === 'string' && content.trim().length > 0) {
        const noteContent = `${bodyPartUpper}: ${content.trim()}`;
        
        // Map body part to section if possible
        let section = 'OTHER';
        if (bodyPart.includes('head')) section = 'HEAD';
        else if (bodyPart.includes('arm') || bodyPart.includes('shoulder') || bodyPart.includes('wrist')) section = 'ARM';
        else if (bodyPart.includes('heart')) section = 'HEART';
        
        // First, delete any existing assessment notes for this body part
        await prisma.clinicalNote.deleteMany({
          where: {
            patientId: patient.id,
            type: 'OTHER',
            content: {
              startsWith: `${bodyPartUpper}:`
            }
          }
        });
        
        // Then create the new note
        const note = await prisma.clinicalNote.create({
          data: {
            patientId: patient.id,
            section: section as 'HEAD' | 'ARM' | 'HEART' | 'EXTRA' | 'OTHER',
            type: 'OTHER',
            content: noteContent,
          },
        });
        
        notes.push(note);
      } else {
        // If content is empty, delete any existing notes for this body part
        await prisma.clinicalNote.deleteMany({
          where: {
            patientId: patient.id,
            type: 'OTHER',
            content: {
              startsWith: `${bodyPartUpper}:`
            }
          }
        });
      }
    }

    console.log(`✅ Saved ${notes.length} assessment notes`);

    return NextResponse.json({ success: true, notesCreated: notes.length });

  } catch (error) {
    console.error('Error saving patient assessment data:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment data' },
      { status: 500 }
    );
  }
}
