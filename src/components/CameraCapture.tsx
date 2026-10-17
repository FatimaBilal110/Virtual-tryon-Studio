import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check, X, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  /** Preferred facing mode: "user" for selfies, "environment" for rear */
  defaultFacing?: "user" | "environment";
}

const MAX_DIMENSION = 1280; // compress to keep payload small

export const CameraCapture = ({ open, onClose, onCapture, defaultFacing = "user" }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">(defaultFacing);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [starting, setStarting] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async (mode: "user" | "environment") => {
    setError(null);
    setStarting(true);
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // detect multiple cameras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch {
        // ignore
      }
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setError("Camera permission denied. Please upload from your device instead.");
      } else if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
        setError("No camera found on this device.");
      } else {
        setError("Couldn't access the camera. Try uploading from your device.");
      }
    } finally {
      setStarting(false);
    }
  }, [stop]);

  useEffect(() => {
    if (open) {
      setCaptured(null);
      setFacing(defaultFacing);
      start(defaultFacing);
    } else {
      stop();
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // mirror selfie horizontally so it matches preview
    if (facing === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCaptured(dataUrl);
    stop();
  };

  const retake = () => {
    setCaptured(null);
    start(facing);
  };

  const confirm = () => {
    if (captured) {
      onCapture(captured);
      onClose();
    }
  };

  const switchCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    start(next);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl p-0">
        <DialogTitle className="sr-only">Camera capture</DialogTitle>
        <DialogDescription className="sr-only">Use your camera to take a photo</DialogDescription>

        <div className="relative bg-black aspect-[3/4] sm:aspect-video w-full">
          {error ? (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
              <p className="max-w-xs text-sm">{error}</p>
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured preview" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
              style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
            />
          )}

          {!captured && !error && hasMultipleCameras && (
            <button
              type="button"
              onClick={switchCamera}
              className="absolute right-3 top-3 rounded-lg bg-black/60 p-2.5 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          {starting && !captured && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
              Starting camera
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 bg-card p-4">
          {error ? (
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          ) : captured ? (
            <>
              <Button onClick={retake} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" /> Retake
              </Button>
              <Button onClick={confirm}>
                <Check className="w-4 h-4 mr-2" /> Use photo
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="ghost">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button
                onClick={capture}
                disabled={starting}
                className="px-6"
              >
                <Camera className="w-4 h-4 mr-2" /> Capture
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
