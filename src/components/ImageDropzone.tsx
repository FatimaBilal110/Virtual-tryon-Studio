import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Upload, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraCapture } from "./CameraCapture";

interface ImageDropzoneProps {
  label: string;
  hint: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Preferred camera facing when opening capture modal */
  cameraFacing?: "user" | "environment";
}

const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_DIMENSION = 1600;

// Compress/resize an image data URL to keep payloads small.
const compressDataUrl = (dataUrl: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(dataUrl);
        return;
      }
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

export const ImageDropzone = ({ label, hint, value, onChange, cameraFacing = "environment" }: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  useEffect(() => {
    setCameraSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
    );
  }, []);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      const compressed = await compressDataUrl(raw);
      onChange(compressed);
    };
    reader.onerror = () => setError("Failed to read image");
    reader.readAsDataURL(file);
  }, [onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span id={labelId} className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{hint}</span>
      </div>

      {value ? (
        <div className="relative h-72 overflow-hidden rounded-xl border border-bronze/40 bg-muted">
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/70 bg-card/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      ) : (
        <div
          role="group"
          aria-labelledby={labelId}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex h-72 w-full flex-col items-center justify-center gap-5 rounded-xl border border-dashed bg-card/40 p-4 transition-colors",
            isDragging ? "border-clay bg-card/80" : "border-bronze/60"
          )}
        >
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop the photo here" : "Drag a photo here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">PNG or JPG, up to 8MB</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[0_8px_18px_-10px_hsl(22_45%_22%/0.8)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <Upload className="h-4 w-4" /> Upload a file
            </button>
            {cameraSupported && (
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-card/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <Camera className="h-4 w-4" /> Use camera
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-labelledby={labelId}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {cameraSupported && (
        <CameraCapture
          open={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={async (dataUrl) => {
            const compressed = await compressDataUrl(dataUrl);
            onChange(compressed);
          }}
          defaultFacing={cameraFacing}
        />
      )}
    </div>
  );
};
