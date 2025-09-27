import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActionModalTrigger } from "@/components/admin/user-action-modal";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Users,
  Crown,
  Clock,
} from "lucide-react";

export default async function AdminUsersPage() {
  // Check admin access
  const session = await auth();
  console.log("Admin page session:", session);

  if (!session?.user) {
    console.log("No session found, redirecting to sign in");
    redirect("/auth/signin");
  }

  console.log("User role:", session.user.role);

  if (session.user.role !== "ADMIN") {
    console.log("User is not admin, redirecting to home");
    redirect("/");
  }

  // Fetch all users from database
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      image: true,
      _count: {
        select: {
          sessions: true,
          accounts: true,
        },
      },
    },
    orderBy: [
      { role: "desc" }, // Admins first
      { name: "asc" },
    ],
  });

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const regularUsers = totalUsers - adminUsers;

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
              <Shield className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-3xl font-bold">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Total Users
                    </p>
                    <p className="text-foreground text-2xl font-bold">
                      {totalUsers}
                    </p>
                  </div>
                  <Users className="text-primary h-8 w-8" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Admin Users
                    </p>
                    <p className="text-foreground text-2xl font-bold">
                      {adminUsers}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Regular Users
                    </p>
                    <p className="text-foreground text-2xl font-bold">
                      {regularUsers}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>
              Complete list of all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name ?? "User"}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="text-primary h-6 w-6" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground font-medium">
                          {user.name ?? "No name"}
                        </h3>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                          className={
                            user.role === "ADMIN"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : ""
                          }
                        >
                          {user.role === "ADMIN" ? (
                            <>
                              <Crown className="mr-1 h-3 w-3" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User className="mr-1 h-3 w-3" />
                              User
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email ?? "No email"}
                        </div>

                        {user.emailVerified && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Verified{" "}
                            {new Date(user.emailVerified).toLocaleDateString()}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {user._count.sessions} active sessions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!user.emailVerified && (
                      <Badge variant="outline" className="text-red-600">
                        Unverified
                      </Badge>
                    )}

                    <UserActionModalTrigger
                      userId={user.id}
                      userName={user.name}
                    />
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="py-8 text-center">
                  <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-foreground mb-2 font-medium">
                    No users found
                  </h3>
                  <p className="text-muted-foreground">
                    No users have been registered yet.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
