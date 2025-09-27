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
        <div className="brutalist-card p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin border-8 border-black border-t-transparent dark:border-white"></div>
          <p className="text-muted-foreground font-bold tracking-wide uppercase">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="bg-primary mb-6 inline-flex h-20 w-20 rotate-3 transform items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <Sparkles className="text-primary-foreground h-10 w-10" />
          </div>
          <h1 className="text-foreground brutalist-text-shadow mb-4 text-5xl font-black tracking-tighter uppercase">
            EZMR
          </h1>
          <div className="bg-secondary -rotate-1 transform border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-secondary-foreground font-bold tracking-wide uppercase">
              WELCOME! PLEASE SIGN IN TO CONTINUE
            </p>
          </div>
        </div>

        <Card className="brutalist-card">
          <CardHeader className="space-y-4 pb-8">
            <CardTitle className="text-foreground brutalist-text-shadow text-center text-3xl font-black tracking-tight uppercase">
              SIGN IN TO YOUR ACCOUNT
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center font-bold tracking-wide uppercase">
              ENTER YOUR EMAIL ADDRESS AND WE'LL SEND YOU A MAGIC LINK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-foreground text-sm font-black tracking-wider uppercase"
                >
                  EMAIL ADDRESS
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  className="brutalist-input h-14 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="brutalist-button h-14 w-full text-lg"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Mail className="mr-3 h-6 w-6" />
                    SEND MAGIC LINK
                  </>
                )}
              </Button>
            </form>

            {message && (
              <div
                className={`border-4 p-6 text-center font-bold tracking-wide uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${
                  message.includes("sent")
                    ? "border-green-500 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                    : "border-red-500 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                }`}
              >
                {message.toUpperCase()}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-4 border-black dark:border-white" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background text-muted-foreground border-2 border-black px-4 py-2 font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  SECURE AUTHENTICATION
                </span>
              </div>
            </div>

            <div className="text-muted-foreground text-center font-bold tracking-wide uppercase">
              BY SIGNING IN, YOU AGREE TO OUR{" "}
              <a
                href="#"
                className="hover:text-foreground font-black underline transition-colors"
              >
                TERMS OF SERVICE
              </a>{" "}
              AND{" "}
              <a
                href="#"
                className="hover:text-foreground font-black underline transition-colors"
              >
                PRIVACY POLICY
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="bg-accent rotate-1 transform border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-accent-foreground font-bold tracking-wide uppercase">
              NEW TO EZMR? YOUR ACCOUNT WILL BE CREATED AUTOMATICALLY WHEN YOU
              SIGN IN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
