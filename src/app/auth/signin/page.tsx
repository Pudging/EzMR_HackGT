"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Mail, Loader2 } from "lucide-react";

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [callbackUrl, setCallbackUrl] = useState<string | undefined>(undefined);

  // Extract callbackUrl from searchParams Promise
  React.useEffect(() => {
    void searchParams.then((params) => {
      setCallbackUrl(params.callbackUrl);
    });
  }, [searchParams]);

  // If user is already authenticated, redirect them
  if (status === "authenticated") {
    router.push(callbackUrl ?? "/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const result = await signIn("resend", {
        email: email.trim(),
        redirect: false,
        callbackUrl: callbackUrl ?? "/",
      });

      if (result?.error) {
        setMessage("Error sending magic link. Please try again.");
      } else {
        setMessage("Magic link sent! Check your email to sign in.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black flex min-h-screen items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div 
            className="mb-4 inline-flex h-16 w-16 items-center justify-center border-2 border-white overflow-hidden"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 
            className="mb-2 text-3xl font-black uppercase tracking-tight text-white drop-shadow-lg"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            EzMR
          </h1>
          <p 
            className="text-neutral-300 drop-shadow-lg"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            Welcome! Please sign in to continue
          </p>
        </div>

        <Card 
          className="border-2 border-white shadow-none overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
        >
          <CardHeader className="space-y-1 pb-6 border-b-2 border-white">
            <CardTitle 
              className="text-center text-2xl font-black uppercase tracking-wide text-white drop-shadow-lg"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              Sign in to your account
            </CardTitle>
            <CardDescription 
              className="text-center text-neutral-300 drop-shadow-lg"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              Enter your email address and we'll send you a magic link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-white text-sm font-black uppercase drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  className="h-12 w-full border-2 border-white bg-transparent text-white placeholder:text-neutral-400"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full border-2 border-white bg-white text-black font-black uppercase hover:bg-neutral-200"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-3 h-5 w-5" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>

            {message && (
              <div
                className={`rounded-lg border p-4 text-center text-sm ${
                  message.includes("sent")
                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-white" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span 
                  className="bg-black text-neutral-300 px-2 drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  Secure authentication
                </span>
              </div>
            </div>

            <div 
              className="text-neutral-300 text-center text-sm drop-shadow-lg"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="hover:text-white underline transition-colors text-white"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="hover:text-white underline transition-colors text-white"
              >
                Privacy Policy
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p 
            className="text-neutral-300 text-sm drop-shadow-lg"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            New to EzMR? Your account will be created automatically when you
            sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
