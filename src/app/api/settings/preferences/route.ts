import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/config";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, we'll return default preferences since we don't have a preferences table yet
    // In a real application, you'd fetch from a user preferences table
    const defaultPreferences = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        systemUpdates: true,
        patientUpdates: true,
        emergencyAlerts: true,
        shiftReminders: true,
      },
      privacy: {
        profileVisibility: "team",
        showOnlineStatus: true,
        allowDirectMessages: true,
        shareActivity: false,
      },
      appearance: {
        theme: "system",
        fontSize: "medium",
        compactMode: false,
        sidebarCollapsed: false,
      },
      clinical: {
        defaultNoteTemplate: "SOAP",
        autoSave: true,
        autoSaveInterval: 30,
        showPatientPhotos: true,
        enableVoiceNotes: true,
        enableDictation: false,
      },
    };

    return NextResponse.json(defaultPreferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await request.json();

    // Validate preferences structure
    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Invalid preferences data" },
        { status: 400 },
      );
    }

    // In a real application, you'd save to a user preferences table
    // For now, we'll just return success
    // TODO: Create UserPreferences model in Prisma schema and implement actual saving

    console.log("Saving preferences for user:", session.user.id, preferences);

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
