"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Database,
  BarChart3,
  FileText,
  Heart,
  Activity,
  Stethoscope,
  Users,
  Shield,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";

interface DashboardLoadingAnimationProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds
  patientName?: string;
}

const loadingMessages = [
  { icon: Database, text: "Accessing patient database..." },
  { icon: FileText, text: "Loading medical records..." },
  { icon: Heart, text: "Retrieving vital signs..." },
  { icon: Activity, text: "Processing assessment data..." },
  { icon: BarChart3, text: "Generating health analytics..." },
  { icon: Users, text: "Loading family history..." },
  { icon: Shield, text: "Verifying insurance information..." },
  { icon: Stethoscope, text: "Preparing clinical interface..." },
  { icon: Clock, text: "Synchronizing recent notes..." },
  { icon: Zap, text: "Finalizing dashboard..." },
];

export function DashboardLoadingAnimation({
  onComplete,
  duration = 5000,
  patientName = "Patient",
}: DashboardLoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const interval = duration / 100; // Update progress every 1% of duration
    const messageInterval = duration / loadingMessages.length;

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setShowSparkles(true);
          setTimeout(onComplete, 500); // Small delay before completion
          return 100;
        }
        return prev + 1;
      });
    }, interval);

    // Message rotation
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = (prev + 1) % loadingMessages.length;
        return next;
      });
    }, messageInterval);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [duration, onComplete]);

  const currentMessage = loadingMessages[currentMessageIndex]!;
  const IconComponent = currentMessage.icon;

  return (
    <div className="from-background via-background to-primary/5 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-8">
      {/* Main Loading Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl text-center"
      >
        {/* Patient Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-foreground mb-2 text-4xl font-bold">
            Welcome, {patientName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Preparing your comprehensive medical dashboard
          </p>
        </motion.div>

        {/* Animated Medical Icons with Glow Effect */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            className="border-primary/30 bg-primary/10 mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 shadow-2xl"
            style={{
              boxShadow:
                "0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)",
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <IconComponent className="text-primary h-16 w-16 drop-shadow-lg" />
            </motion.div>
          </motion.div>

          {/* Rotating outer ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="border-primary/20 absolute inset-0 rounded-full border-2"
            style={{
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
            }}
          />

          {/* Floating medical icons */}
          {[
            { icon: Heart, delay: 0, duration: 2.5 },
            { icon: Activity, delay: 0.5, duration: 3 },
            { icon: FileText, delay: 1, duration: 2.8 },
            { icon: BarChart3, delay: 1.5, duration: 3.2 },
            { icon: Users, delay: 2, duration: 2.7 },
            { icon: Shield, delay: 2.5, duration: 3.1 },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-primary/20 absolute flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                top: `${20 + (i % 3) * 30}%`,
                left: `${10 + (i % 2) * 80}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                x: [-5, 5, -5],
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                delay: item.delay,
              }}
            >
              <item.icon className="text-primary h-4 w-4" />
            </motion.div>
          ))}

          {/* Sparkle effects */}
          {showSparkles && (
            <AnimatePresence>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: 2,
                  }}
                  className="absolute"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Loading Messages with Enhanced Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-center gap-4">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity },
                }}
              >
                <Loader2 className="text-primary h-6 w-6" />
              </motion.div>
              <h2 className="text-foreground text-2xl font-semibold">
                {currentMessage.text}
              </h2>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
              className="bg-primary/20 mx-auto h-1 w-32 rounded-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="text-muted-foreground mb-4 flex justify-between text-lg">
            <span className="font-medium">Loading Progress</span>
            <motion.span
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-primary font-bold"
            >
              {progress}%
            </motion.span>
          </div>
          <div className="bg-secondary h-4 w-full overflow-hidden rounded-full shadow-inner">
            <motion.div
              className="from-primary via-primary/90 to-primary/70 h-full bg-gradient-to-r shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
              }}
            />
          </div>
        </div>

        {/* Animated progress indicators */}
        <div className="flex justify-center gap-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-primary h-3 w-3 rounded-full"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 1, 0.3],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>

        {/* Fun medical facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="border-border/50 bg-muted/40 mt-8 rounded-xl border p-6 shadow-lg"
        >
          <div className="mb-2 flex items-center gap-3">
            <Zap className="text-primary h-5 w-5" />
            <h3 className="text-foreground font-semibold">Did you know?</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your medical dashboard processes over 50 different data points to
            provide a comprehensive view of your health status, including
            real-time vital signs, medication interactions, and personalized
            health recommendations.
          </p>
        </motion.div>
      </motion.div>

      {/* Enhanced background animated elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {[...Array(15)].map((_, i) => {
          const positions = [
            { top: 10, left: 15 },
            { top: 20, left: 85 },
            { top: 30, left: 45 },
            { top: 40, left: 25 },
            { top: 50, left: 75 },
            { top: 60, left: 35 },
            { top: 70, left: 65 },
            { top: 80, left: 55 },
            { top: 15, left: 70 },
            { top: 25, left: 30 },
            { top: 35, left: 90 },
            { top: 45, left: 10 },
            { top: 55, left: 50 },
            { top: 65, left: 80 },
            { top: 75, left: 40 },
          ];
          const durations = [
            4, 3.5, 4.2, 3.8, 4.5, 3.2, 4.1, 3.9, 4.3, 3.6, 4.4, 3.7, 4.0, 3.4,
            4.6,
          ];
          const delays = [
            0, 0.3, 0.6, 0.9, 1.2, 0.2, 0.5, 0.8, 1.1, 0.4, 0.7, 1.0, 0.1, 0.4,
            0.7,
          ];

          return (
            <motion.div
              key={i}
              className="bg-primary/30 absolute h-2 w-2 rounded-full"
              style={{
                top: `${positions[i]?.top ?? 50}%`,
                left: `${positions[i]?.left ?? 50}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
                y: [-20, 20, -20],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: durations[i] ?? 4,
                repeat: Infinity,
                delay: delays[i] ?? 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
