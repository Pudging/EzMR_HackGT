export function isAdmin(role?: string) {
  return role === "ADMIN";
}

export const ALL_DASHBOARD_PERMISSIONS = [
  "VIEW_DEMOGRAPHICS",
  "VIEW_CONTACT",
  "VIEW_INSURANCE",
  "VIEW_EMERGENCY_CONTACTS",
  "VIEW_IMMUNIZATIONS",
  "VIEW_ALLERGIES",
  "VIEW_MEDICATIONS",
  "VIEW_SOCIAL_HISTORY",
  "VIEW_PAST_CONDITIONS",
  "VIEW_VITALS",
  "VIEW_ASSESSMENT",
  "VIEW_RECORDS",
  "VIEW_NOTES",
  "VIEW_FAMILY_HISTORY",
  "VIEW_CARE_PLANS",
] as const;

export type DashboardPermission = (typeof ALL_DASHBOARD_PERMISSIONS)[number];

export function hasPermission(
  userPermissions: string[] | undefined,
  permission: DashboardPermission,
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
}
