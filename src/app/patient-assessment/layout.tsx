import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function PatientAssessmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/patient-assessment");
  }

  return children;
}
