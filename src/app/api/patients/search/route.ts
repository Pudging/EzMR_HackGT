import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { getCurrentTenant } from "@/lib/tenant";

const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["id", "name"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type } = searchSchema.parse(body);
    
    // Get current tenant
    const tenant = await getCurrentTenant();
    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    let patients;
    
    if (type === "id") {
      // Search by patient MRN/ID
      patients = await db.patient.findMany({
        where: {
          tenantId: tenant.id,
          mrn: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          sex: true,
          bloodType: true,
        },
        take: 10, // Limit results
      });
    } else {
      // Search by name (first name or last name)
      const nameParts = query.toLowerCase().split(' ').filter(part => part.length > 0);
      
      patients = await db.patient.findMany({
        where: {
          tenantId: tenant.id,
          OR: nameParts.flatMap(part => [
            {
              firstName: {
                contains: part,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: part,
                mode: "insensitive",
              },
            },
          ]),
        },
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          sex: true,
          bloodType: true,
        },
        take: 10, // Limit results
      });
    }

    // Transform the results to match the frontend interface
    const searchResults = patients.map(patient => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      patientId: patient.mrn,
      dob: patient.dateOfBirth.toISOString().split('T')[0],
      sex: patient.sex,
      bloodType: patient.bloodType,
    }));

    return NextResponse.json({
      success: true,
      patients: searchResults,
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to search patients" },
      { status: 500 }
    );
  }
}
