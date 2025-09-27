"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Brain,
  Stethoscope,
  Heart,
  Activity,
  Scan,
} from "lucide-react";

interface LoadingAnimationProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds
}

const loadingMessages = [
  { icon: Brain, text: "Initializing 3D Body Model..." },
  { icon: Scan, text: "Loading anatomical structures..." },
  { icon: Heart, text: "Preparing interactive elements..." },
  { icon: Stethoscope, text: "Calibrating medical interface..." },
  { icon: Activity, text: "Finalizing patient assessment tools..." },
];

export function LoadingAnimation({
  onComplete,
  duration = 4000,
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = duration / 100; // Update progress every 1% of duration
    const messageInterval = duration / loadingMessages.length;

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 200); // Small delay before completion
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

  const currentMessage = loadingMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-8">
      {/* Main Loading Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Animated Medical Icons */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="border-primary/20 bg-primary/10 mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IconComponent className="text-primary h-12 w-12" />
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-primary/40 absolute h-2 w-2 rounded-full"
              style={{
                top: `${20 + i * 10}%`,
                left: `${15 + i * 12}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading Messages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="mb-2 flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="text-primary h-5 w-5" />
              </motion.div>
              <h2 className="text-foreground text-xl font-semibold">
                {currentMessage.text}
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="text-muted-foreground mb-2 flex justify-between text-sm">
            <span>Loading Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="bg-secondary h-3 w-full overflow-hidden rounded-full">
            <motion.div
              className="from-primary to-primary/80 h-full bg-gradient-to-r shadow-md"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Pulsing dots */}
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-primary h-2 w-2 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Fun fact or tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="border-border/50 bg-muted/30 mt-8 rounded-lg border p-4"
        >
          <p className="text-muted-foreground text-sm">
            💡 <strong>Tip:</strong> Click on any body part in the 3D model to
            add medical notes and observations
          </p>
        </motion.div>
      </motion.div>

      {/* Background animated elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-primary/20 absolute h-1 w-1 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
