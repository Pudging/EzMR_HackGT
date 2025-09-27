"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Info,
  X,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface ModernDicomViewerProps {
  isOpen: boolean;
  onClose: () => void;
  dicomData: {
    images: Array<{ name: string; url: string }>;
    name: string;
    modality: string;
    description?: string;
  };
}

interface DicomImage {
  pixelData: Uint8Array | Uint16Array;
  width: number;
  height: number;
  minPixelValue: number;
  maxPixelValue: number;
  windowCenter?: number;
  windowWidth?: number;
  slope: number;
  intercept: number;
  name: string;
}

export function ModernDicomViewer({ isOpen, onClose, dicomData }: ModernDicomViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<DicomImage[]>([]);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [currentSlice, setCurrentSlice] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [playSpeed, setPlaySpeed] = useState(5); // FPS (frames per second)
  const [windowLevel, setWindowLevel] = useState(40);
  const [windowWidth, setWindowWidth] = useState(400);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [metadata, setMetadata] = useState<any>(null);

  const totalSlices = dicomData?.images?.length || 0;

  // Load and parse DICOM files using only dicom-parser
  useEffect(() => {
    if (!isOpen || !dicomData?.images?.length) {
      console.log('Modern DICOM viewer not opening:', { isOpen, hasImages: !!dicomData?.images?.length });
      return;
    }

    const loadDicomImages = async () => {
      setIsLoading(true);
      setError(null);
      setLoadedImages([]);

      try {
        console.log('🚀 Starting modern DICOM loading...');
        
        // Import dicom-parser
        const dicomParser = (await import('dicom-parser')).default;
        console.log('✅ DICOM parser imported');

        const images: DicomImage[] = [];
        setLoadingProgress({ current: 0, total: dicomData.images.length, fileName: '' });

        for (let i = 0; i < dicomData.images.length; i++) {
          const imageFile = dicomData.images[i];
          if (!imageFile) continue;

          // Update progress
          if (i % 5 === 0 || i === dicomData.images.length - 1) {
            setLoadingProgress({ 
              current: i + 1, 
              total: dicomData.images.length, 
              fileName: imageFile.name 
            });
          }

          try {
            console.log(`📥 Loading DICOM ${i + 1}/${dicomData.images.length}: ${imageFile.name}`);
            
            // Fetch DICOM file
            const response = await fetch(imageFile.url);
            if (!response.ok) {
              throw new Error(`Failed to fetch: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const byteArray = new Uint8Array(arrayBuffer);
            
            console.log(`📋 Parsing DICOM data (${byteArray.length} bytes)...`);
            
            // Parse DICOM
            const dataSet = dicomParser.parseDicom(byteArray);
            
            // Extract image information
            const width = dataSet.uint16('x00280011'); // Columns
            const height = dataSet.uint16('x00280010'); // Rows
            const bitsAllocated = dataSet.uint16('x00280100') || 16;
            const pixelRepresentation = dataSet.uint16('x00280103') || 0;
            const slope = dataSet.floatString('x00281053') || 1;
            const intercept = dataSet.floatString('x00281052') || 0;
            
            // Get window/level if available
            const windowCenter = dataSet.floatString('x00281050');
            const windowWidth = dataSet.floatString('x00281051');
            
            console.log(`📊 DICOM metadata:`, {
              width, height, bitsAllocated, pixelRepresentation,
              slope, intercept, windowCenter, windowWidth
            });

            // Get pixel data
            const pixelDataElement = dataSet.elements.x7fe00010;
            if (!pixelDataElement) {
              throw new Error('No pixel data found in DICOM');
            }

            let pixelData: Uint8Array | Uint16Array;
            
            if (bitsAllocated <= 8) {
              pixelData = new Uint8Array(byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
            } else {
              pixelData = new Uint16Array(byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
            }

            // Calculate min/max pixel values
            let minPixelValue = Number.MAX_VALUE;
            let maxPixelValue = Number.MIN_VALUE;
            
            for (let j = 0; j < Math.min(pixelData.length, 10000); j++) { // Sample for performance
              const value = pixelData[j] * slope + intercept;
              minPixelValue = Math.min(minPixelValue, value);
              maxPixelValue = Math.max(maxPixelValue, value);
            }

            const dicomImage: DicomImage = {
              pixelData,
              width,
              height,
              minPixelValue,
              maxPixelValue,
              windowCenter: windowCenter || (minPixelValue + maxPixelValue) / 2,
              windowWidth: windowWidth || (maxPixelValue - minPixelValue),
              slope,
              intercept,
              name: imageFile.name
            };

            images.push(dicomImage);
            console.log(`✅ DICOM ${i + 1} loaded:`, {
              width, height, 
              pixelCount: pixelData.length,
              minPixel: minPixelValue,
              maxPixel: maxPixelValue
            });

            // Display first image
            if (i === 0) {
              displayImage(dicomImage);
              
              // Set initial window/level from first image
              if (dicomImage.windowCenter && dicomImage.windowWidth) {
                setWindowLevel(dicomImage.windowCenter);
                setWindowWidth(dicomImage.windowWidth);
              }
              
              setMetadata({
                width: dicomImage.width,
                height: dicomImage.height,
                minPixelValue: dicomImage.minPixelValue,
                maxPixelValue: dicomImage.maxPixelValue,
                modality: dicomData.modality,
                windowCenter: dicomImage.windowCenter,
                windowWidth: dicomImage.windowWidth,
              });
            }

          } catch (imageError) {
            console.error(`❌ Failed to load ${imageFile.name}:`, imageError);
          }
        }

        setLoadedImages(images);
        console.log(`🎉 Successfully loaded ${images.length} DICOM images`);
        
      } catch (err) {
        console.error('❌ Failed to load DICOM images:', err);
        setError(`Failed to load DICOM images: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoadingProgress({ current: 0, total: 0, fileName: '' });
        setIsLoading(false);
      }
    };

    loadDicomImages();
  }, [isOpen, dicomData]);

  // Display image on canvas
  const displayImage = (image: DicomImage) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    console.log('🖼️ Displaying image:', image.name);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Create ImageData
    const imageData = ctx.createImageData(image.width, image.height);
    const data = imageData.data;

    // Apply window/level
    const center = windowLevel;
    const width = windowWidth;
    const minWindow = center - width / 2;
    const maxWindow = center + width / 2;

    console.log(`🎨 Rendering with window/level: ${center}/${width}`);

    // Convert DICOM pixels to RGB
    for (let i = 0; i < image.pixelData.length; i++) {
      const pixelValue = image.pixelData[i] * image.slope + image.intercept;
      
      // Apply window/level
      let displayValue = 0;
      if (pixelValue <= minWindow) {
        displayValue = 0;
      } else if (pixelValue >= maxWindow) {
        displayValue = 255;
      } else {
        displayValue = Math.round(((pixelValue - minWindow) / width) * 255);
      }

      const dataIndex = i * 4;
      data[dataIndex] = displayValue;     // R
      data[dataIndex + 1] = displayValue; // G
      data[dataIndex + 2] = displayValue; // B
      data[dataIndex + 3] = 255;          // A
    }

    // Draw to canvas
    ctx.putImageData(imageData, 0, 0);
    console.log('✅ Image rendered to canvas');
  };

  // Handle slice navigation
  useEffect(() => {
    if (loadedImages.length > 0 && currentSlice < loadedImages.length) {
      displayImage(loadedImages[currentSlice]);
    }
  }, [currentSlice, loadedImages]);

  // Handle window/level changes
  useEffect(() => {
    if (loadedImages.length > 0 && currentSlice < loadedImages.length) {
      displayImage(loadedImages[currentSlice]);
    }
  }, [windowLevel, windowWidth]);

  // Playback functionality
  useEffect(() => {
    if (isPlaying && totalSlices > 1) {
      const intervalTime = 1000 / playSpeed; // Convert FPS to milliseconds
      const interval = setInterval(() => {
        setCurrentSlice(prev => (prev + 1) % totalSlices);
      }, intervalTime);
      setPlayInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (playInterval) {
        clearInterval(playInterval);
        setPlayInterval(null);
      }
    }
  }, [isPlaying, totalSlices, playSpeed]);

  // Mouse handlers for pan/zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setWindowLevel(40);
    setWindowWidth(400);
  };

  const togglePlayback = () => {
    if (totalSlices > 1) {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevSlice = () => {
    setCurrentSlice(prev => Math.max(0, prev - 1));
  };

  const handleNextSlice = () => {
    setCurrentSlice(prev => Math.min(totalSlices - 1, prev + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-7xl w-full h-full max-h-screen m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Modern DICOM Viewer
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dicomData.name} • {dicomData.modality}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Main Viewer */}
          <div className="flex-1 bg-black relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center max-w-md mx-auto px-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
                  <p className="mb-4">Loading {totalSlices} DICOM image{totalSlices !== 1 ? 's' : ''}...</p>
                  
                  {loadingProgress.total > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Progress: {loadingProgress.current} of {loadingProgress.total}</span>
                        <span>{Math.round((loadingProgress.current / loadingProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      {loadingProgress.fileName && (
                        <p className="text-xs text-gray-400 truncate">
                          Loading: {loadingProgress.fileName}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm mt-4 text-gray-300">Modern parser - no Cornerstone needed</p>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain cursor-move"
              style={{ 
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                imageRendering: 'pixelated'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
            
            {/* Error display */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center bg-red-900 bg-opacity-75 p-6 rounded-lg">
                  <p className="text-lg font-semibold mb-2">Error Loading DICOM</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Slice overlay */}
            {!isLoading && totalSlices > 1 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                Slice {currentSlice + 1} of {totalSlices}
                {isPlaying && (
                  <span className="ml-2 text-green-400">
                    ▶ {playSpeed} FPS
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 space-y-6 overflow-y-auto">
            {/* Playback Controls */}
            {totalSlices > 1 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Playback Controls
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePrevSlice}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={togglePlayback}
                      className="w-16"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextSlice}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  <Slider
                    value={[currentSlice]}
                    onValueChange={(value) => setCurrentSlice(value[0] ?? 0)}
                    max={totalSlices - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {currentSlice + 1} / {totalSlices}
                  </div>
                  
                  {/* Speed Control */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Playback Speed: {playSpeed} FPS
                    </label>
                    <Slider
                      value={[playSpeed]}
                      onValueChange={(value) => setPlaySpeed(value[0] ?? 5)}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>1 FPS (Slow)</span>
                      <span>30 FPS (Fast)</span>
                    </div>
                    
                    {/* Speed Presets */}
                    <div className="flex justify-center space-x-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPlaySpeed(2)}
                        className={`text-xs px-2 py-1 ${playSpeed === 2 ? 'bg-blue-100 border-blue-300' : ''}`}
                      >
                        2x
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPlaySpeed(5)}
                        className={`text-xs px-2 py-1 ${playSpeed === 5 ? 'bg-blue-100 border-blue-300' : ''}`}
                      >
                        5x
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPlaySpeed(10)}
                        className={`text-xs px-2 py-1 ${playSpeed === 10 ? 'bg-blue-100 border-blue-300' : ''}`}
                      >
                        10x
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPlaySpeed(15)}
                        className={`text-xs px-2 py-1 ${playSpeed === 15 ? 'bg-blue-100 border-blue-300' : ''}`}
                      >
                        15x
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Window/Level Controls */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                Window/Level
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Window Width: {windowWidth}
                  </label>
                  <Slider
                    value={[windowWidth]}
                    onValueChange={(value) => setWindowWidth(value[0] ?? 400)}
                    min={1}
                    max={4000}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Window Level: {windowLevel}
                  </label>
                  <Slider
                    value={[windowLevel]}
                    onValueChange={(value) => setWindowLevel(value[0] ?? 40)}
                    min={-2000}
                    max={2000}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                View Controls
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(z * 1.2, 5))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(z / 1.2, 0.1))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetView}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Zoom: {Math.round(zoom * 100)}%
                </div>
              </div>
            </div>

            {/* Metadata */}
            {metadata && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Image Information
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Dimensions: {metadata.width} × {metadata.height}</p>
                  <p>Modality: {metadata.modality}</p>
                  <p>Pixel Range: {Math.round(metadata.minPixelValue)} - {Math.round(metadata.maxPixelValue)}</p>
                  <p>Images: {loadedImages.length} / {totalSlices}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
