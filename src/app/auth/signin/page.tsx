import { redirect } from "next/navigation";
import { auth, signIn } from "@/server/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { GoogleLogo } from "@/components/ui/google-logo";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  // If user is already authenticated, redirect them
  if (session) {
    redirect(callbackUrl ?? "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            EzMR
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome! Please sign in to continue
          </p>
        </div>

        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Use your Google account to access EzMR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              action={async () => {
                "use server";
                await signIn("google", {
                  redirectTo: callbackUrl ?? "/",
                });
              }}
            >
              <Button
                type="submit"
                className="h-12 w-full border border-gray-300 bg-white text-base font-medium text-gray-900 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                variant="outline"
              >
                <GoogleLogo className="mr-3 h-5 w-5" />
                Continue with Google
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Secure authentication
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="underline transition-colors hover:text-gray-900 dark:hover:text-gray-200"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline transition-colors hover:text-gray-900 dark:hover:text-gray-200"
              >
                Privacy Policy
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            New to EzMR? Your account will be created automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
