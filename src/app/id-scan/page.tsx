"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
} from "lucide-react";

interface ExtractedData {
  fullName: string;
  age: number;
  dateOfBirth: string;
  height: string;
  weight: string;
  confidence: number;
}

export default function IDScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawOCRText, setRawOCRText] = useState<string>("");
  const [uploadMode, setUploadMode] = useState(false); // Default to camera mode
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      setError(null);
      console.log("Requesting camera permission...");

      // Check if getUserMedia is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Try back camera first, then fallback to any camera
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
        console.log("Video element updated with stream");

        // Explicitly play the video
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
      setError(
        `Camera access denied: ${errorMessage}. Please allow camera permission to scan your ID.`,
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
          void processImage(blob);
        }
      },
      "image/jpeg",
      0.8,
    );
  };

  // Process the captured image with Google Vision API
  const processImage = async (imageBlob: Blob | File) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("Starting OCR processing with Google Vision API...");
      console.log("Image type:", imageBlob.constructor.name);
      console.log("Image size:", imageBlob.size);

      // Create FormData for the API call
      const formData = new FormData();
      formData.append("image", imageBlob);

      // Call our OCR API endpoint
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to process image");
      }

      const result = await response.json();
      console.log("OCR Result:", result);

      if (result.success && result.data) {
        // Store raw OCR text for debugging
        setRawOCRText(result.data.rawText ?? "");

        // Use the structured data from Google Vision
        setExtractedData({
          fullName: result.data.fullName ?? "Name not detected",
          age: result.data.age ?? 0,
          dateOfBirth: result.data.dateOfBirth ?? "DOB not detected",
          height: result.data.height ?? "Height not detected",
          weight: result.data.weight ?? "Weight not detected",
          confidence: result.data.confidence ?? 0,
        });
      } else {
        throw new Error("Invalid response from OCR service");
      }

      setIsScanning(false);
    } catch (err) {
      console.error("OCR processing error:", err);
      setError(
        `Failed to process ID: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Start scanning
  const startScanning = () => {
    setIsScanning(true);
    setExtractedData(null);
    setError(null);
  };

  // Stop scanning
  const stopScanning = () => {
    setIsScanning(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File upload triggered");
    const file = event.target.files?.[0];
    console.log("Selected file:", file);

    if (file) {
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPG, PNG, etc.)");
        return;
      }

      // Store the selected file
      setSelectedFile(file);

      // Process the uploaded image
      console.log("Processing uploaded file...");
      void processImage(file);
    } else {
      console.log("No file selected");
      setSelectedFile(null);
    }
  };

  // Switch between camera and upload modes
  const switchToUpload = () => {
    setUploadMode(true);
    setError(null);
    setExtractedData(null);
    setIsScanning(false);
    setSelectedFile(null);
    setRawOCRText("");
  };

  const switchToCamera = () => {
    setUploadMode(false);
    setError(null);
    setExtractedData(null);
    setIsScanning(false);
    setSelectedFile(null);
    setRawOCRText("");
  };

  // Reset and scan again
  const resetScan = () => {
    setExtractedData(null);
    setError(null);
    setIsScanning(false);
    setRawOCRText("");
  };

  // Auto-request camera permission on page load
  useEffect(() => {
    if (!uploadMode && hasPermission === null) {
      void requestCameraPermission();
    }
  }, [uploadMode, hasPermission]);

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
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <header className="bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Camera className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-semibold">
                  ID Scanner
                </h1>
                <p className="text-muted-foreground text-sm">
                  Document Processing
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Description */}
          <div className="mb-8 text-center">
            <p className="text-muted-foreground text-lg">
              Point your camera at your ID to automatically extract your
              information
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Camera/Upload Section */}
            <Card className="bg-card h-fit border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2 font-mono uppercase">
                  {uploadMode ? (
                    <Upload className="h-5 w-5" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                  {uploadMode ? "UPLOAD IMAGE" : "CAMERA FEED"}
                </CardTitle>
                <CardDescription className="text-muted-foreground font-mono">
                  {uploadMode
                    ? "SELECT AN IMAGE FILE OF YOUR ID TO PROCESS"
                    : "POSITION YOUR ID WITHIN THE FRAME AND CLICK CAPTURE"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Switch Buttons */}
                <div className="mb-4 flex gap-2">
                  <Button
                    onClick={switchToCamera}
                    variant={!uploadMode ? "default" : "outline"}
                    className="flex-1 font-mono uppercase"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    CAMERA
                  </Button>
                  <Button
                    onClick={switchToUpload}
                    variant={uploadMode ? "default" : "outline"}
                    className="flex-1 font-mono uppercase"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    UPLOAD
                  </Button>
                </div>

                {/* Upload Mode */}
                {uploadMode ? (
                  <div className="py-8 text-center">
                    <Upload className="text-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground mb-4 font-mono">
                      SELECT AN IMAGE FILE OF YOUR ID
                    </p>
                    <p className="text-primary mb-4 font-mono text-xs">
                      UPLOAD MODE ACTIVE
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => {
                        console.log("Choose file button clicked");
                        console.log("File input ref:", fileInputRef.current);
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        } else {
                          console.error("File input ref is null");
                        }
                      }}
                      className="mb-4 w-full font-mono uppercase"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      CHOOSE FILE
                    </Button>

                    {selectedFile && (
                      <div className="bg-muted mb-4 rounded-lg border p-3">
                        <p className="text-foreground mb-2 font-mono text-sm">
                          SELECTED FILE:
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {selectedFile.name} (
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button
                          onClick={() => processImage(selectedFile)}
                          disabled={isProcessing}
                          className="mt-2 font-mono text-sm uppercase"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              PROCESSING...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              PROCESS IMAGE
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <p className="text-muted-foreground mt-2 font-mono text-xs">
                      SUPPORTED: JPG, PNG, GIF, WEBP
                    </p>

                    {/* Debug button */}
                    <Button
                      onClick={() => {
                        console.log("Test button clicked");
                        console.log("Upload mode:", uploadMode);
                        console.log("File input ref:", fileInputRef.current);
                        alert(
                          "Upload mode is working! Check console for details.",
                        );
                      }}
                      variant="outline"
                      className="mt-4 font-mono text-xs uppercase"
                    >
                      TEST UPLOAD MODE
                    </Button>
                  </div>
                ) : (
                  <>
                    {hasPermission === null && (
                      <div className="py-8 text-center">
                        <Camera className="text-foreground mx-auto mb-4 h-16 w-16" />
                        <p className="text-muted-foreground mb-4 font-mono">
                          CLICK THE BUTTON BELOW TO START YOUR CAMERA
                        </p>
                        <Button
                          onClick={requestCameraPermission}
                          className="w-full font-mono uppercase"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          START CAMERA
                        </Button>
                      </div>
                    )}

                    {hasPermission === false && (
                      <div className="py-8 text-center">
                        <AlertCircle className="text-destructive mx-auto mb-4 h-16 w-16" />
                        <p className="text-destructive mb-4 font-mono">
                          CAMERA ACCESS DENIED. PLEASE ALLOW CAMERA PERMISSION.
                        </p>
                        <Button
                          onClick={requestCameraPermission}
                          className="w-full font-mono uppercase"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          TRY AGAIN
                        </Button>
                      </div>
                    )}

                    {hasPermission === true && (
                      <div className="space-y-4">
                        {/* Video Feed */}
                        <div className="bg-background relative overflow-hidden rounded-lg border">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-64 w-full object-cover"
                            onLoadedMetadata={() =>
                              console.log("Video metadata loaded")
                            }
                            onCanPlay={() => console.log("Video can play")}
                            onError={(e) => console.error("Video error:", e)}
                          />
                          {isScanning && (
                            <div className="border-primary absolute inset-0 rounded-lg border-4 border-dashed">
                              <div className="bg-primary text-primary-foreground absolute top-2 right-2 left-2 rounded px-2 py-1 font-mono text-sm">
                                POSITION ID WITHIN FRAME
                              </div>
                            </div>
                          )}
                          {/* Debug info */}
                          <div className="bg-primary text-primary-foreground absolute bottom-2 left-2 rounded px-2 py-1 font-mono text-xs">
                            {hasPermission ? "CAMERA ACTIVE" : "NO CAMERA"}
                          </div>
                          {/* Manual play button if video isn't playing */}
                          {hasPermission && (
                            <div className="absolute top-2 right-2">
                              <Button
                                onClick={() => {
                                  if (videoRef.current) {
                                    videoRef.current
                                      .play()
                                      .catch(console.error);
                                  }
                                }}
                                size="sm"
                                className="px-2 py-1 font-mono text-xs"
                              >
                                PLAY
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Hidden canvas for capturing */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Controls */}
                        <div className="flex gap-2">
                          {!isScanning ? (
                            <Button
                              onClick={startScanning}
                              className="flex-1 font-mono uppercase"
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              START SCANNING
                            </Button>
                          ) : (
                            <Button
                              onClick={capturePhoto}
                              disabled={isProcessing}
                              className="flex-1 font-mono uppercase"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  PROCESSING...
                                </>
                              ) : (
                                <>
                                  <Camera className="mr-2 h-4 w-4" />
                                  CAPTURE PHOTO
                                </>
                              )}
                            </Button>
                          )}

                          {isScanning && (
                            <Button
                              onClick={stopScanning}
                              variant="outline"
                              className="font-mono uppercase"
                            >
                              STOP
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {error && (
                  <div className="bg-destructive/10 border-destructive rounded-lg border p-4">
                    <div className="text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-mono font-medium uppercase">
                        ERROR
                      </span>
                    </div>
                    <p className="text-destructive mt-1 font-mono">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-card h-fit border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2 font-mono uppercase">
                  <CheckCircle className="h-5 w-5" />
                  EXTRACTED INFORMATION
                </CardTitle>
                <CardDescription className="text-muted-foreground font-mono">
                  REVIEW THE INFORMATION EXTRACTED FROM YOUR ID
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!extractedData ? (
                  <div className="py-8 text-center">
                    <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <Camera className="text-primary-foreground h-8 w-8" />
                    </div>
                    <p className="text-muted-foreground font-mono">
                      NO DATA EXTRACTED YET. SCAN YOUR ID TO SEE RESULTS.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-lg border p-3">
                        <span className="font-mono font-medium uppercase">
                          FULL NAME:
                        </span>
                        <span className="font-mono font-semibold">
                          {extractedData.fullName}
                        </span>
                      </div>

                      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-lg border p-3">
                        <span className="font-mono font-medium uppercase">
                          AGE:
                        </span>
                        <span className="font-mono font-semibold">
                          {extractedData.age} YEARS OLD
                        </span>
                      </div>

                      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-lg border p-3">
                        <span className="font-mono font-medium uppercase">
                          DATE OF BIRTH:
                        </span>
                        <span className="font-mono font-semibold">
                          {extractedData.dateOfBirth}
                        </span>
                      </div>

                      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-lg border p-3">
                        <span className="font-mono font-medium uppercase">
                          HEIGHT:
                        </span>
                        <span className="font-mono font-semibold">
                          {extractedData.height}
                        </span>
                      </div>

                      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-lg border p-3">
                        <span className="font-mono font-medium uppercase">
                          WEIGHT:
                        </span>
                        <span className="font-mono font-semibold">
                          {extractedData.weight}
                        </span>
                      </div>
                    </div>

                    <div className="bg-secondary text-secondary-foreground mt-6 rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-sm font-medium uppercase">
                          CONFIDENCE SCORE:
                        </span>
                        <span className="font-mono text-sm font-semibold">
                          {extractedData.confidence}%
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${extractedData.confidence}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button
                        onClick={resetScan}
                        variant="outline"
                        className="flex-1 font-mono uppercase"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        SCAN AGAIN
                      </Button>
                      <Button className="flex-1 font-mono uppercase">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        CONFIRM & CONTINUE
                      </Button>
                    </div>

                    {/* Debug: Raw OCR Text */}
                    {rawOCRText && (
                      <div className="bg-muted text-muted-foreground mt-6 rounded-lg border p-4">
                        <h4 className="mb-2 font-mono text-sm uppercase">
                          RAW OCR TEXT:
                        </h4>
                        <pre className="font-mono text-xs break-words whitespace-pre-wrap">
                          {rawOCRText}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="bg-card mt-8 border">
            <CardHeader>
              <CardTitle className="text-card-foreground font-mono uppercase">
                SCANNING INSTRUCTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="bg-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-primary-foreground font-mono text-lg font-bold">
                      1
                    </span>
                  </div>
                  <h3 className="text-foreground mb-2 font-mono font-semibold uppercase">
                    POSITION ID
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    PLACE YOUR ID CARD FLAT WITHIN THE CAMERA FRAME
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-primary-foreground font-mono text-lg font-bold">
                      2
                    </span>
                  </div>
                  <h3 className="text-foreground mb-2 font-mono font-semibold uppercase">
                    ENSURE CLARITY
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    MAKE SURE THE TEXT IS CLEAR AND WELL-LIT
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-primary-foreground font-mono text-lg font-bold">
                      3
                    </span>
                  </div>
                  <h3 className="text-foreground mb-2 font-mono font-semibold uppercase">
                    CAPTURE
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    CLICK CAPTURE WHEN THE ID IS PROPERLY POSITIONED
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
