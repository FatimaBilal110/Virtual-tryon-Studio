import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, ImageIcon, Camera } from "lucide-react";
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
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-border shadow-soft aspect-[4/5] bg-muted">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/90 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition-smooth hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "w-full aspect-[4/5] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-smooth p-4",
            "bg-card",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border"
          )}
        >
          <div className="p-4 rounded-full bg-gradient-primary shadow-glow">
            {isDragging ? <Upload className="w-6 h-6 text-primary-foreground" /> : <ImageIcon className="w-6 h-6 text-primary-foreground" />}
          </div>
          <div className="text-center px-2">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop it here" : "Add a photo"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 8MB</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 text-secondary-foreground text-xs font-medium transition-smooth"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            {cameraSupported && (
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-medium shadow-soft hover:opacity-90 transition-smooth"
              >
                <Camera className="w-3.5 h-3.5" /> Use camera
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
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

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
