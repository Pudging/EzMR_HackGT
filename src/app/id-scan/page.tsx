"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, CheckCircle, AlertCircle, RefreshCw, Upload } from "lucide-react";

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
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawOCRText, setRawOCRText] = useState<string>('');
  const [uploadMode, setUploadMode] = useState(false); // Default to camera mode
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      setError(null);
      console.log('Requesting camera permission...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      
      // Try back camera first, then fallback to any camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (backCameraError) {
        console.log('Back camera failed, trying any camera:', backCameraError);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      }
      
      console.log('Camera stream obtained:', stream);
      setCameraStream(stream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Video element updated with stream');
        
        // Explicitly play the video
        videoRef.current.play().then(() => {
          console.log('Video started playing successfully');
        }).catch((playError) => {
          console.error('Error playing video:', playError);
        });
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
      setError(`Camera access denied: ${errorMessage}. Please allow camera permission to scan your ID.`);
      setHasPermission(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        void processImage(blob);
      }
    }, 'image/jpeg', 0.8);
  };

  // Process the captured image with Google Vision API
  const processImage = async (imageBlob: Blob | File) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Starting OCR processing with Google Vision API...');
      console.log('Image type:', imageBlob.constructor.name);
      console.log('Image size:', imageBlob.size);
      
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('image', imageBlob);
      
      // Call our OCR API endpoint
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? 'Failed to process image');
      }
      
      const result = await response.json();
      console.log('OCR Result:', result);
      
      if (result.success && result.data) {
        // Store raw OCR text for debugging
        setRawOCRText(result.data.rawText ?? '');
        
        // Use the structured data from Google Vision
        setExtractedData({
          fullName: result.data.fullName ?? 'Name not detected',
          age: result.data.age ?? 0,
          dateOfBirth: result.data.dateOfBirth ?? 'DOB not detected',
          height: result.data.height ?? 'Height not detected',
          weight: result.data.weight ?? 'Weight not detected',
          confidence: result.data.confidence ?? 0
        });
      } else {
        throw new Error('Invalid response from OCR service');
      }
      
      setIsScanning(false);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(`Failed to process ID: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    console.log('File upload triggered');
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    
    if (file) {
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Store the selected file
      setSelectedFile(file);
      
      // Process the uploaded image
      console.log('Processing uploaded file...');
      void processImage(file);
    } else {
      console.log('No file selected');
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
    setRawOCRText('');
  };

  const switchToCamera = () => {
    setUploadMode(false);
    setError(null);
    setExtractedData(null);
    setIsScanning(false);
    setSelectedFile(null);
    setRawOCRText('');
  };

  // Reset and scan again
  const resetScan = () => {
    setExtractedData(null);
    setError(null);
    setIsScanning(false);
    setRawOCRText('');
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
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-wide">
              ID Scanner
            </h1>
            <p className="text-lg text-gray-300">
              Point your camera at your ID to automatically extract your information
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera/Upload Section */}
            <Card className="h-fit bg-black border-2 border-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white font-mono uppercase">
                  {uploadMode ? <Upload className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  {uploadMode ? 'UPLOAD IMAGE' : 'CAMERA FEED'}
                </CardTitle>
                <CardDescription className="text-gray-300 font-mono">
                  {uploadMode 
                    ? 'SELECT AN IMAGE FILE OF YOUR ID TO PROCESS'
                    : 'POSITION YOUR ID WITHIN THE FRAME AND CLICK CAPTURE'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Switch Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button 
                    onClick={switchToCamera} 
                    className={`flex-1 font-mono uppercase ${
                      !uploadMode 
                        ? 'bg-white text-black' 
                        : 'bg-gray-800 text-white border-2 border-white hover:bg-gray-700'
                    }`}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    CAMERA
                  </Button>
                  <Button 
                    onClick={switchToUpload} 
                    className={`flex-1 font-mono uppercase ${
                      uploadMode 
                        ? 'bg-white text-black' 
                        : 'bg-gray-800 text-white border-2 border-white hover:bg-gray-700'
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    UPLOAD
                  </Button>
                </div>

                {/* Upload Mode */}
                {uploadMode ? (
                  <div className="text-center py-8">
                    <Upload className="h-16 w-16 mx-auto text-white mb-4" />
                    <p className="text-gray-300 mb-4 font-mono">
                      SELECT AN IMAGE FILE OF YOUR ID
                    </p>
                    <p className="text-green-400 text-xs mb-4 font-mono">
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
                        console.log('Choose file button clicked');
                        console.log('File input ref:', fileInputRef.current);
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        } else {
                          console.error('File input ref is null');
                        }
                      }} 
                      className="w-full bg-white text-black hover:bg-gray-200 font-mono uppercase mb-4"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      CHOOSE FILE
                    </Button>
                    
                    {selectedFile && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg border-2 border-gray-600">
                        <p className="text-white font-mono text-sm mb-2">SELECTED FILE:</p>
                        <p className="text-gray-300 font-mono text-xs">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button 
                          onClick={() => processImage(selectedFile)} 
                          disabled={isProcessing}
                          className="mt-2 bg-white text-black hover:bg-gray-200 font-mono uppercase text-sm"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              PROCESSING...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              PROCESS IMAGE
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-gray-400 text-xs mt-2 font-mono">
                      SUPPORTED: JPG, PNG, GIF, WEBP
                    </p>
                    
                    {/* Debug button */}
                    <Button 
                      onClick={() => {
                        console.log('Test button clicked');
                        console.log('Upload mode:', uploadMode);
                        console.log('File input ref:', fileInputRef.current);
                        alert('Upload mode is working! Check console for details.');
                      }} 
                      className="mt-4 bg-gray-600 text-white hover:bg-gray-500 font-mono uppercase text-xs"
                    >
                      TEST UPLOAD MODE
                    </Button>
                  </div>
                ) : (
                  <>
                    {hasPermission === null && (
                      <div className="text-center py-8">
                        <Camera className="h-16 w-16 mx-auto text-white mb-4" />
                        <p className="text-gray-300 mb-4 font-mono">
                          CLICK THE BUTTON BELOW TO START YOUR CAMERA
                        </p>
                        <Button onClick={requestCameraPermission} className="w-full bg-white text-black hover:bg-gray-200 font-mono uppercase">
                          <Camera className="h-4 w-4 mr-2" />
                          START CAMERA
                        </Button>
                      </div>
                    )}

                {hasPermission === false && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
                    <p className="text-red-400 mb-4 font-mono">
                      CAMERA ACCESS DENIED. PLEASE ALLOW CAMERA PERMISSION.
                    </p>
                    <Button onClick={requestCameraPermission} className="w-full bg-white text-black hover:bg-gray-200 font-mono uppercase border-2 border-white">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      TRY AGAIN
                    </Button>
                  </div>
                )}

                {hasPermission === true && (
                  <div className="space-y-4">
                    {/* Video Feed */}
                    <div className="relative bg-black rounded-lg overflow-hidden border-2 border-white">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                        onLoadedMetadata={() => console.log('Video metadata loaded')}
                        onCanPlay={() => console.log('Video can play')}
                        onError={(e) => console.error('Video error:', e)}
                      />
                      {isScanning && (
                        <div className="absolute inset-0 border-4 border-white border-dashed rounded-lg">
                          <div className="absolute top-2 left-2 right-2 bg-white text-black text-sm px-2 py-1 rounded font-mono">
                            POSITION ID WITHIN FRAME
                          </div>
                        </div>
                      )}
                      {/* Debug info */}
                      <div className="absolute bottom-2 left-2 bg-white text-black text-xs px-2 py-1 rounded font-mono">
                        {hasPermission ? 'CAMERA ACTIVE' : 'NO CAMERA'}
                      </div>
                      {/* Manual play button if video isn't playing */}
                      {hasPermission && (
                        <div className="absolute top-2 right-2">
                          <Button
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(console.error);
                              }
                            }}
                            className="bg-white text-black hover:bg-gray-200 text-xs px-2 py-1 font-mono"
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
                        <Button onClick={startScanning} className="flex-1 bg-white text-black hover:bg-gray-200 font-mono uppercase">
                          <Camera className="h-4 w-4 mr-2" />
                          START SCANNING
                        </Button>
                      ) : (
                        <Button onClick={capturePhoto} disabled={isProcessing} className="flex-1 bg-white text-black hover:bg-gray-200 font-mono uppercase">
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              PROCESSING...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              CAPTURE PHOTO
                            </>
                          )}
                        </Button>
                      )}
                      
                      {isScanning && (
                        <Button onClick={stopScanning} className="bg-black text-white border-2 border-white hover:bg-gray-800 font-mono uppercase">
                          STOP
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                  </>
                )}

                {error && (
                  <div className="bg-red-900/20 border-2 border-red-400 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium font-mono uppercase">ERROR</span>
                    </div>
                    <p className="text-red-400 mt-1 font-mono">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="h-fit bg-black border-2 border-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white font-mono uppercase">
                  <CheckCircle className="h-5 w-5" />
                  EXTRACTED INFORMATION
                </CardTitle>
                <CardDescription className="text-gray-300 font-mono">
                  REVIEW THE INFORMATION EXTRACTED FROM YOUR ID
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!extractedData ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-black" />
                    </div>
                    <p className="text-gray-300 font-mono">
                      NO DATA EXTRACTED YET. SCAN YOUR ID TO SEE RESULTS.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center p-3 bg-white text-black rounded-lg border-2 border-white">
                        <span className="font-medium font-mono uppercase">FULL NAME:</span>
                        <span className="font-semibold font-mono">
                          {extractedData.fullName}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white text-black rounded-lg border-2 border-white">
                        <span className="font-medium font-mono uppercase">AGE:</span>
                        <span className="font-semibold font-mono">
                          {extractedData.age} YEARS OLD
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white text-black rounded-lg border-2 border-white">
                        <span className="font-medium font-mono uppercase">DATE OF BIRTH:</span>
                        <span className="font-semibold font-mono">
                          {extractedData.dateOfBirth}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white text-black rounded-lg border-2 border-white">
                        <span className="font-medium font-mono uppercase">HEIGHT:</span>
                        <span className="font-semibold font-mono">
                          {extractedData.height}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white text-black rounded-lg border-2 border-white">
                        <span className="font-medium font-mono uppercase">WEIGHT:</span>
                        <span className="font-semibold font-mono">
                          {extractedData.weight}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white text-black rounded-lg border-2 border-white">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium font-mono uppercase">CONFIDENCE SCORE:</span>
                        <span className="text-sm font-semibold font-mono">
                          {extractedData.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-black rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${extractedData.confidence}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button onClick={resetScan} className="flex-1 bg-black text-white border-2 border-white hover:bg-gray-800 font-mono uppercase">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        SCAN AGAIN
                      </Button>
                      <Button className="flex-1 bg-white text-black hover:bg-gray-200 font-mono uppercase">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        CONFIRM & CONTINUE
                      </Button>
                    </div>

                    {/* Debug: Raw OCR Text */}
                    {rawOCRText && (
                      <div className="mt-6 p-4 bg-gray-900 text-white rounded-lg border-2 border-gray-600">
                        <h4 className="font-mono uppercase text-sm mb-2">RAW OCR TEXT:</h4>
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
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
          <Card className="mt-8 bg-black border-2 border-white">
            <CardHeader>
              <CardTitle className="text-white font-mono uppercase">SCANNING INSTRUCTIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-black font-bold text-lg font-mono">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 font-mono uppercase">POSITION ID</h3>
                  <p className="text-sm text-gray-300 font-mono">
                    PLACE YOUR ID CARD FLAT WITHIN THE CAMERA FRAME
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-black font-bold text-lg font-mono">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 font-mono uppercase">ENSURE CLARITY</h3>
                  <p className="text-sm text-gray-300 font-mono">
                    MAKE SURE THE TEXT IS CLEAR AND WELL-LIT
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-black font-bold text-lg font-mono">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 font-mono uppercase">CAPTURE</h3>
                  <p className="text-sm text-gray-300 font-mono">
                    CLICK CAPTURE WHEN THE ID IS PROPERLY POSITIONED
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
