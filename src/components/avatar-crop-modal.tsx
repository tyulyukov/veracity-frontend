import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImg, type Area } from '@/lib/crop-image';

interface AvatarCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function AvatarCropModal({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCrop();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === '+' || e.key === '=' || e.key === ']') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.1, 3));
      } else if (e.key === '-' || e.key === '_' || e.key === '[') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.1, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleCrop, onOpenChange]);

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh]">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Crop Avatar</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[400px] sm:h-[500px] bg-black/20">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
              },
              cropAreaStyle: {
                border: '2px solid oklch(0.78 0.12 75)',
                boxShadow: '0 0 20px oklch(0.78 0.12 75 / 0.3)',
              },
            }}
          />
        </div>

        <div className="px-6 py-4 bg-card/50 border-t border-border">
          <div className="flex items-center gap-3">
            <ZoomOut className="size-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 relative">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:transition-transform
                  [&::-moz-range-thumb]:hover:scale-110"
              />
            </div>
            <ZoomIn className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-muted-foreground min-w-[3.5rem] text-right">
              {zoomPercentage}%
            </span>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            disabled={isProcessing || !croppedAreaPixels}
            className="min-w-[100px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Crop'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
