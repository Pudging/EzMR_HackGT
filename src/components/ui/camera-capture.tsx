"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Camera,
  AlertCircle,
  RefreshCw,
  Upload,
} from "lucide-react";

interface CameraCaptureProps {
  onImageCapture: (imageBlob: Blob) => void;
  isProcessing?: boolean;
  error?: string | null;
  onError?: (error: string) => void;
}

export function CameraCapture({
  onImageCapture,
  isProcessing = false,
  error = null,
  onError,
}: CameraCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      onError?.("");
      console.log("Requesting camera permission...");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (backCameraError) {
        console.log("Back camera failed, trying any camera:", backCameraError);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }

      console.log("Camera stream obtained:", stream);
      setCameraStream(stream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .then(() => {
            console.log("Video started playing successfully");
          })
          .catch((playError) => {
            console.error("Error playing video:", playError);
          });
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown camera error";
      onError?.(
        `Camera access denied: ${errorMessage}. Please allow camera permission to scan your ID.`
      );
      setHasPermission(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onImageCapture(blob);
        }
      },
      "image/jpeg",
      0.8
    );
  };

  // Auto-request camera permission on page load
  useEffect(() => {
    if (hasPermission === null) {
      void requestCameraPermission();
    }
  }, [hasPermission]);

  // Handle video playing when stream is available
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="space-y-4">
      {hasPermission === null && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Click the button below to start your camera
          </p>
          <Button
            onClick={requestCameraPermission}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        </div>
      )}

      {hasPermission === false && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive mb-4">
            Camera access denied. Please allow camera permission.
          </p>
          <Button
            onClick={requestCameraPermission}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {hasPermission === true && (
        <div className="space-y-4">
          {/* Video Feed */}
          <div className="relative overflow-hidden rounded-lg border bg-background">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-64 w-full object-cover"
            />
          </div>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Simple Capture Button */}
          <Button
            onClick={capturePhoto}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border-destructive rounded-lg border p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
