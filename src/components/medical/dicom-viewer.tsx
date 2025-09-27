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

interface DicomViewerProps {
  isOpen: boolean;
  onClose: () => void;
  dicomData: {
    images: Array<{ name: string; url: string }>;
    name: string;
    modality: string;
    description?: string;
  };
}

export function DicomViewer({ isOpen, onClose, dicomData }: DicomViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [currentSlice, setCurrentSlice] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [windowLevel, setWindowLevel] = useState(40);
  const [windowWidth, setWindowWidth] = useState(400);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [metadata, setMetadata] = useState<any>(null);

  const totalSlices = dicomData?.images?.length || 0;

  // Initialize Cornerstone and load all DICOM images
  useEffect(() => {
    if (!isOpen || !dicomData?.images?.length) {
      console.log('DICOM viewer not opening:', { isOpen, hasImages: !!dicomData?.images?.length });
      return;
    }
    
    console.log('DICOM viewer initializing with data:', {
      name: dicomData.name,
      modality: dicomData.modality,
      imageCount: dicomData.images.length,
      firstImageUrl: dicomData.images[0]?.url,
      allImageUrls: dicomData.images.map(img => img.url)
    });

    let cornerstone: any;
    let cornerstoneWADOImageLoader: any;
    let cornerstoneWebImageLoader: any;
    let dicomParser: any;

    const initCornerstone = async () => {
      setIsLoading(true);
      setError(null);
      setLoadedImages([]);

      try {
        console.log('🔧 Starting Cornerstone imports...');
        
        // Dynamic imports to avoid SSR issues
        cornerstone = (await import('cornerstone-core')).default;
        console.log('✅ Cornerstone core imported:', !!cornerstone);
        
        cornerstoneWADOImageLoader = (await import('cornerstone-wado-image-loader')).default;
        console.log('✅ WADO image loader imported:', !!cornerstoneWADOImageLoader);
        
        cornerstoneWebImageLoader = (await import('cornerstone-web-image-loader')).default;
        console.log('✅ Web image loader imported:', !!cornerstoneWebImageLoader);
        
        dicomParser = (await import('dicom-parser')).default;
        console.log('✅ DICOM parser imported:', !!dicomParser);

        // Initialize cornerstone
        console.log('🔧 Initializing Cornerstone loaders...');
        
        try {
          // Set external dependencies
          cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
          cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
          
          // Register the WADO image loader
          if (cornerstoneWADOImageLoader.wadouri && cornerstoneWADOImageLoader.wadouri.register) {
            cornerstoneWADOImageLoader.wadouri.register(cornerstone);
            console.log('✅ WADO loader registered');
          } else {
            console.warn('⚠️ WADO loader register function not found');
          }
          
          console.log('✅ WADO loader configured');
        } catch (err) {
          console.error('❌ Failed to configure WADO loader:', err);
        }
        
        try {
          cornerstoneWebImageLoader.external.cornerstone = cornerstone;
          cornerstoneWebImageLoader.external.dicomParser = dicomParser;
          
          // Register the web image loader  
          if (cornerstoneWebImageLoader.configure) {
            cornerstoneWebImageLoader.configure({
              beforeSend: function(xhr: XMLHttpRequest) {
                xhr.setRequestHeader('Accept', 'image/*');
              }
            });
          }
          
          console.log('✅ Web loader configured');
        } catch (err) {
          console.error('❌ Failed to configure web loader:', err);
        }

        // Configure loaders
        console.log('🔧 Configuring WADO loader...');
        try {
          cornerstoneWADOImageLoader.configure({
            useWebWorkers: false, // Disable web workers for better compatibility
            decodeConfig: {
              convertFloatPixelDataToInt: false,
              usePDFJS: false,
            },
            beforeSend: function(xhr: XMLHttpRequest) {
              xhr.setRequestHeader('Accept', 'application/dicom, */*');
              xhr.setRequestHeader('Cache-Control', 'no-cache');
            },
          });
          console.log('✅ WADO loader configured successfully');
        } catch (err) {
          console.error('❌ Failed to configure WADO loader:', err);
        }

        const canvas = canvasRef.current;
        if (canvas) {
          console.log('Enabling cornerstone on canvas:', {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
          });
          
          // Ensure canvas has proper dimensions
          if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
          } else {
            // Fallback dimensions
            canvas.width = 512;
            canvas.height = 512;
          }
          
          console.log('Canvas dimensions set:', canvas.width, 'x', canvas.height);
          
          // Test canvas by drawing a simple rectangle
          const testCtx = canvas.getContext('2d');
          if (testCtx) {
            testCtx.fillStyle = '#ff0000';
            testCtx.fillRect(10, 10, 50, 50);
            testCtx.fillStyle = '#00ff00';
            testCtx.fillRect(canvas.width - 60, 10, 50, 50);
            testCtx.fillStyle = '#ffffff';
            testCtx.font = '16px Arial';
            testCtx.fillText('Canvas Working', 70, 30);
            console.log('Test pattern drawn on canvas');
          }
          
          cornerstone.enable(canvas);
          
          // Test what image loaders are registered
          console.log('🔍 Testing registered image loaders...');
          const testImageIds = [
            'wadouri:test',
            'http:test', 
            'https:test'
          ];
          
          testImageIds.forEach(testId => {
            try {
              const loader = cornerstone.imageLoader.getImageLoader(testId);
              console.log(`✅ Image loader found for ${testId}:`, !!loader);
            } catch (err) {
              console.log(`❌ No image loader for ${testId}:`, err instanceof Error ? err.message : String(err));
            }
          });
          
          console.log('Cornerstone enabled, loading images...');
          await loadAllDicomImages();
        } else {
          throw new Error('Canvas element not found');
        }
      } catch (err) {
        console.error('Failed to initialize Cornerstone:', err);
        setError(`Failed to initialize DICOM viewer: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    const loadAllDicomImages = async () => {
      const images: any[] = [];
      
      try {
        console.log(`Loading ${dicomData.images.length} DICOM images...`);
        
        // Initialize progress
        setLoadingProgress({ current: 0, total: dicomData.images.length, fileName: '' });
        
        for (let i = 0; i < dicomData.images.length; i++) {
          const imageFile = dicomData.images[i];
          if (!imageFile) {
            console.warn(`Skipping undefined image at index ${i}`);
            continue;
          }
          
          // Update progress (throttled to avoid too many re-renders for large series)
          if (i % 5 === 0 || i === dicomData.images.length - 1) {
            setLoadingProgress({ 
              current: i + 1, 
              total: dicomData.images.length, 
              fileName: imageFile.name 
            });
          }
          
          console.log(`Loading image ${i + 1}/${dicomData.images.length}: ${imageFile.name}`);
          
          try {
            console.log(`Processing image ${i + 1}: ${imageFile.url}`);
            
            // Try different image ID formats for better compatibility
            let imageId = `wadouri:${imageFile.url}`;
            
            // Alternative: try without wadouri prefix as fallback
            const alternativeImageId = imageFile.url;
            
            console.log(`Attempting to load image with ID: ${imageId}`);
            
            // Test if cornerstone.loadImage function exists
            if (!cornerstone.loadImage) {
              throw new Error('cornerstone.loadImage function not available');
            }
            
            // Load the image using cornerstone
            console.log('📥 Calling cornerstone.loadImage...');
            let image;
            
            try {
              image = await cornerstone.loadImage(imageId);
              console.log('📥 Image loaded with wadouri, type:', typeof image, 'keys:', image ? Object.keys(image) : 'null');
            } catch (wadouriError) {
              console.warn('⚠️ Failed to load with wadouri, trying alternative:', wadouriError);
              try {
                image = await cornerstone.loadImage(alternativeImageId);
                console.log('📥 Image loaded with alternative ID, type:', typeof image, 'keys:', image ? Object.keys(image) : 'null');
              } catch (altError) {
                console.error('❌ Both loading methods failed:', { wadouriError, altError });
                throw altError;
              }
            }
            
            if (!image) {
              throw new Error('Image loaded but is null/undefined');
            }
            
            console.log(`Image ${i + 1} loaded successfully:`, {
              width: image.width,
              height: image.height,
              minPixelValue: image.minPixelValue,
              maxPixelValue: image.maxPixelValue,
              slope: image.slope,
              intercept: image.intercept,
              windowCenter: image.windowCenter,
              windowWidth: image.windowWidth
            });
            
            images.push(image);
            
            // Display first image immediately and set initial metadata
            if (i === 0) {
              console.log('🎯 Displaying first image with data:', {
                width: image.width,
                height: image.height,
                minPixelValue: image.minPixelValue,
                maxPixelValue: image.maxPixelValue,
                windowCenter: image.windowCenter,
                windowWidth: image.windowWidth,
                hasPixelData: !!image.getPixelData,
                pixelDataLength: image.getPixelData ? image.getPixelData().length : 'N/A'
              });
              displayImage(image);
              
              // Set metadata
              setMetadata({
                width: image.width,
                height: image.height,
                pixelSpacing: image.pixelSpacing || [1, 1],
                modality: dicomData.modality || 'Unknown',
                sliceThickness: image.sliceThickness || 'Unknown',
                windowCenter: image.windowCenter || windowLevel,
                windowWidth: image.windowWidth || windowWidth,
                minPixelValue: image.minPixelValue,
                maxPixelValue: image.maxPixelValue,
              });
              
              // Set appropriate window/level from DICOM metadata if available
              if (image.windowCenter && image.windowWidth) {
                setWindowLevel(Array.isArray(image.windowCenter) ? image.windowCenter[0] : image.windowCenter);
                setWindowWidth(Array.isArray(image.windowWidth) ? image.windowWidth[0] : image.windowWidth);
              }
            }
          } catch (imageError) {
            console.error(`Failed to load image ${imageFile?.name || `index ${i}`}:`, imageError);
            // Continue loading other images even if one fails
          }
        }

        setLoadedImages(images);
        
        if (images.length === 0) {
          // If no DICOM images loaded, show a test pattern
          console.warn('No DICOM images loaded, showing test pattern');
          const canvas = canvasRef.current;
          if (canvas) {
            const errorCtx = canvas.getContext('2d');
            if (errorCtx) {
              errorCtx.fillStyle = '#333333';
              errorCtx.fillRect(0, 0, canvas.width, canvas.height);
              errorCtx.fillStyle = '#ffffff';
              errorCtx.font = '20px Arial';
              errorCtx.textAlign = 'center';
              errorCtx.fillText('No DICOM images could be loaded', canvas.width / 2, canvas.height / 2);
              errorCtx.fillText(`Tried to load ${dicomData.images.length} images`, canvas.width / 2, canvas.height / 2 + 30);
            }
          }
          throw new Error('No DICOM images could be loaded');
        }
        
        console.log(`Successfully loaded ${images.length} out of ${dicomData.images.length} DICOM images`);
        setLoadingProgress({ current: 0, total: 0, fileName: '' });
        setIsLoading(false);
        
      } catch (err) {
        console.error('Failed to load DICOM images:', err);
        setError(`Failed to load DICOM images: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoadingProgress({ current: 0, total: 0, fileName: '' });
        setIsLoading(false);
      }
    };

    const displayImage = (image: any) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas not available for display');
        return;
      }
      
      if (!image) {
        console.error('No image provided for display');
        return;
      }

      try {
        console.log('Displaying image on canvas:', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          imageWidth: image.width,
          imageHeight: image.height,
          imageData: {
            minPixelValue: image.minPixelValue,
            maxPixelValue: image.maxPixelValue,
            slope: image.slope,
            intercept: image.intercept,
            windowCenter: image.windowCenter,
            windowWidth: image.windowWidth,
            photometricInterpretation: image.photometricInterpretation
          }
        });
        
        // Clear canvas first
        const clearCtx = canvas.getContext('2d');
        if (clearCtx) {
          clearCtx.clearRect(0, 0, canvas.width, canvas.height);
          clearCtx.fillStyle = '#000000';
          clearCtx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Display the image
        console.log('🖼️ Calling cornerstone.displayImage...');
        try {
          cornerstone.displayImage(canvas, image);
          console.log('🖼️ cornerstone.displayImage completed successfully');
        } catch (displayError) {
          console.error('❌ cornerstone.displayImage failed:', displayError);
          
          // Try manual pixel rendering as fallback
          console.log('🔄 Attempting manual pixel rendering...');
          if (image.getPixelData && typeof image.getPixelData === 'function') {
            const pixelData = image.getPixelData();
            const ctx = canvas.getContext('2d');
            if (ctx && pixelData) {
              const imageData = ctx.createImageData(image.width, image.height);
              const data = imageData.data;
              
              // Simple grayscale rendering
              for (let i = 0; i < pixelData.length; i++) {
                const pixelValue = pixelData[i];
                // Normalize pixel value to 0-255 range
                const normalizedValue = Math.min(255, Math.max(0, 
                  ((pixelValue - image.minPixelValue) / (image.maxPixelValue - image.minPixelValue)) * 255
                ));
                
                const dataIndex = i * 4;
                data[dataIndex] = normalizedValue;     // R
                data[dataIndex + 1] = normalizedValue; // G
                data[dataIndex + 2] = normalizedValue; // B
                data[dataIndex + 3] = 255;             // A
              }
              
              ctx.putImageData(imageData, 0, 0);
              console.log('✅ Manual pixel rendering completed');
            }
          }
          throw displayError;
        }
        
        // Get and modify viewport
        const viewport = cornerstone.getViewport(canvas);
        
        console.log('📊 Current viewport before changes:', viewport);
        
        // Use image's default window/level if available, otherwise calculate from pixel values
        let defaultWindowCenter = image.windowCenter?.[0] || image.windowCenter;
        let defaultWindowWidth = image.windowWidth?.[0] || image.windowWidth;
        
        // If no window/level in DICOM, calculate from pixel range
        if (!defaultWindowCenter || !defaultWindowWidth) {
          const pixelRange = image.maxPixelValue - image.minPixelValue;
          defaultWindowCenter = image.minPixelValue + (pixelRange / 2);
          defaultWindowWidth = pixelRange;
          console.log('📊 Calculated window/level from pixel range:', {
            minPixel: image.minPixelValue,
            maxPixel: image.maxPixelValue,
            calculatedCenter: defaultWindowCenter,
            calculatedWidth: defaultWindowWidth
          });
        } else {
          // Use fallback values if still not set
          defaultWindowCenter = defaultWindowCenter || windowLevel;
          defaultWindowWidth = defaultWindowWidth || windowWidth;
        }
        
        console.log('📊 Using window settings:', {
          center: defaultWindowCenter,
          width: defaultWindowWidth,
          fromImage: !!image.windowCenter
        });
        
        // Set window/level values
        viewport.voi.windowWidth = defaultWindowWidth;
        viewport.voi.windowCenter = defaultWindowCenter;
        viewport.scale = zoom;
        viewport.translation = pan;
        
        // Ensure viewport is valid
        if (viewport.voi.windowWidth <= 0) {
          console.warn('⚠️ Invalid window width, using default');
          viewport.voi.windowWidth = 400;
        }
        
        console.log('📊 Applying viewport:', viewport);
        
        // Apply viewport changes
        cornerstone.setViewport(canvas, viewport);
        
        console.log('✅ Viewport applied successfully');
        
        // Force a draw
        console.log('🎨 Forcing canvas draw...');
        cornerstone.draw(canvas);
        
        // Add a small test overlay to verify canvas is responsive
        setTimeout(() => {
          const overlayCtx = canvas.getContext('2d');
          if (overlayCtx) {
            overlayCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            overlayCtx.fillRect(10, 10, 20, 20);
            overlayCtx.fillStyle = 'white';
            overlayCtx.font = '12px Arial';
            overlayCtx.fillText('Test', 15, 45);
            console.log('🔴 Added test overlay to canvas');
          }
        }, 100);
        
        // Check if anything was actually drawn to the canvas
        const analysisCtx = canvas.getContext('2d');
        if (analysisCtx) {
          const imageData = analysisCtx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height));
          const pixels = imageData.data;
          let hasNonBlackPixels = false;
          
          // Check if there are any non-black pixels in a sample area
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] !== 0 || pixels[i + 1] !== 0 || pixels[i + 2] !== 0) {
              hasNonBlackPixels = true;
              break;
            }
          }
          
          console.log('🔍 Canvas pixel analysis:', {
            hasNonBlackPixels,
            sampleSize: `${Math.min(100, canvas.width)}x${Math.min(100, canvas.height)}`,
            firstPixelRGBA: [pixels[0], pixels[1], pixels[2], pixels[3]]
          });
        }
        
        console.log('✅ Image display process completed');
        
      } catch (err) {
        console.error('❌ Error displaying image with cornerstone:', err);
        
        // Fallback: try to render some basic info to canvas
        console.log('🔄 Attempting fallback canvas rendering...');
        const fallbackCtx = canvas.getContext('2d');
        if (fallbackCtx && image) {
          fallbackCtx.fillStyle = '#333333';
          fallbackCtx.fillRect(0, 0, canvas.width, canvas.height);
          
          fallbackCtx.fillStyle = '#ffffff';
          fallbackCtx.font = '16px Arial';
          fallbackCtx.textAlign = 'center';
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          fallbackCtx.fillText('DICOM Image Loaded', centerX, centerY - 60);
          fallbackCtx.fillText(`Dimensions: ${image.width} x ${image.height}`, centerX, centerY - 30);
          fallbackCtx.fillText(`Pixel Range: ${image.minPixelValue} - ${image.maxPixelValue}`, centerX, centerY);
          fallbackCtx.fillText('Display Error - Check Console', centerX, centerY + 30);
          
          console.log('📝 Fallback info rendered to canvas');
        }
        
        setError(`Failed to display image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initCornerstone();

    return () => {
      if (playInterval) clearInterval(playInterval);
      if (cornerstone && canvasRef.current) {
        try {
          cornerstone.disable(canvasRef.current);
        } catch (err) {
          console.warn('Error disabling cornerstone:', err);
        }
      }
    };
  }, [isOpen, dicomData]);

  // Update displayed image when slice changes
  useEffect(() => {
    if (loadedImages.length > 0 && currentSlice < loadedImages.length) {
      const image = loadedImages[currentSlice];
      const canvas = canvasRef.current;
      if (canvas && image) {
        try {
          const cornerstone = require('cornerstone-core').default;
          cornerstone.displayImage(canvas, image);
          
          // Apply current viewport settings
          const viewport = cornerstone.getViewport(canvas);
          viewport.voi.windowWidth = windowWidth;
          viewport.voi.windowCenter = windowLevel;
          viewport.scale = zoom;
          viewport.translation = pan;
          cornerstone.setViewport(canvas, viewport);
        } catch (err) {
          console.error('Error updating displayed image:', err);
        }
      }
    }
  }, [currentSlice, loadedImages, windowWidth, windowLevel, zoom, pan]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && totalSlices > 1) {
      const interval = setInterval(() => {
        setCurrentSlice(prev => (prev + 1) % totalSlices);
      }, 200); // 5 FPS
      setPlayInterval(interval);
    } else {
      if (playInterval) {
        clearInterval(playInterval);
        setPlayInterval(null);
      }
    }

    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [isPlaying, totalSlices]);

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

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4 font-semibold">DICOM Viewer Error</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              DICOM Viewer - {dicomData.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{totalSlices} image{totalSlices !== 1 ? 's' : ''}</Badge>
              <Badge variant="outline">{dicomData.modality}</Badge>
              {loadedImages.length < totalSlices && (
                <Badge variant="destructive">
                  {loadedImages.length}/{totalSlices} loaded
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
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
                  
                  <p className="text-sm mt-4 text-gray-300">This may take a moment for large series</p>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain cursor-move"
              style={{ 
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                display: 'block' // Always show canvas
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* Slice overlay */}
            {!isLoading && totalSlices > 1 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                Slice {currentSlice + 1} / {totalSlices}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 p-4 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Slice Navigation */}
              {totalSlices > 1 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Slice Navigation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePrevSlice}
                        disabled={currentSlice === 0}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={togglePlayback}
                        disabled={totalSlices <= 1}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNextSlice}
                        disabled={currentSlice === totalSlices - 1}
                      >
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
                      max={2000}
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
                      min={-1000}
                      max={1000}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Zoom and Tools */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Tools
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
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

              {/* Series Information */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Series Information
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Images: {totalSlices}</p>
                  <p>Loaded: {loadedImages.length} / {totalSlices}</p>
                  <p>Modality: {dicomData.modality}</p>
                  {dicomData.description && <p>Description: {dicomData.description}</p>}
                </div>
              </div>

              {/* Image Details */}
              {metadata && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Image Details
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Dimensions: {metadata.width} × {metadata.height}</p>
                    <p>
                      Pixel Spacing: {metadata.pixelSpacing[0]?.toFixed(2) || 'N/A'} × {metadata.pixelSpacing[1]?.toFixed(2) || 'N/A'} mm
                    </p>
                    {metadata.sliceThickness && (
                      <p>Slice Thickness: {metadata.sliceThickness} mm</p>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Instructions
                </h3>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Click and drag to pan image</div>
                  <div>• Use zoom controls or scroll wheel</div>
                  <div>• Adjust window/level for contrast</div>
                  <div>• Navigate slices with controls or slider</div>
                  <div>• Play button animates through slices</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}