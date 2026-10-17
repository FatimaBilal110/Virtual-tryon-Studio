import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OUTFITS = [
  { value: "button-down-shirt", label: "Button-down shirt" },
  { value: "frock", label: "Frock" },
  { value: "kurta", label: "Kurta" },
  { value: "kameez", label: "Kameez" },
  { value: "shalwar-kameez", label: "Shalwar Kameez" },
  { value: "pants", label: "Pants" },
];

interface Recommendation {
  skinTone: string;
  explanation: string;
  colors: { name: string; hex: string; reason: string }[];
}

const Style = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [outfit, setOutfit] = useState("");
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);

  const canRun = photo && outfit && !loading;

  const analyze = async () => {
    if (!canRun) return;
    setLoading(true);
    setRec(null);
    try {
      const { data, error } = await supabase.functions.invoke("style-recommend", {
        body: { photo, outfitType: outfit },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRec(data);
      toast.success("Recommendations ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Color match">
      <div className="container space-y-12 mt-5">
        {/* Single wide glass card with title, description, and your banner image */}
        <section className="glass rounded-3xl p-8 md:p-12 space-y-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                Find colors that suit your skin tone
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Add a clear photo taken in daylight and choose the outfit you have in mind. The tool names a skin tone category and suggests three colors, each with a short reason. Pick one to carry it into the try-on.
              </p>
            </div>
            <div>
              <img 
                src="/Style-banner.png" 
                alt="Color match showcase" 
                className="w-full max-h-[360px] object-cover rounded-2xl shadow-sm"
              />
            </div>
          </div>
        </section>

        <section aria-label="Photo and outfit" className="glass rounded-2xl p-5 md:p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <ImageDropzone
              label="Your photo"
              hint="A daylight selfie works best"
              value={photo}
              onChange={setPhoto}
              cameraFacing="user"
            />
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="outfit" className="text-sm font-medium">
                  Outfit type
                </label>
                <Select value={outfit} onValueChange={setOutfit}>
                  <SelectTrigger id="outfit" className="h-11">
                    <SelectValue placeholder="Choose an outfit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTFITS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={analyze} disabled={!canRun} size="lg" className="h-12 w-full text-base">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing</>
                ) : (
                  "Get color suggestions"
                )}
              </Button>
            </div>
          </div>
        </section>

        {rec && (
          <section aria-labelledby="palette-heading" aria-live="polite" className="space-y-5">
            <h2 id="palette-heading" className="text-4xl">Your colors</h2>
            <div className="space-y-1 text-muted-foreground">
              <p>
                Detected skin tone: <span className="font-medium capitalize text-foreground">{rec.skinTone}</span>
              </p>
              <p>{rec.explanation}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {rec.colors.map((c, i) => (
                <div key={i} className="flex flex-col overflow-hidden glass rounded-2xl">
                  <div
                    className="aspect-[4/3] w-full border-b border-border"
                    style={{ backgroundColor: c.hex }}
                    role="img"
                    aria-label={`${c.name} swatch`}
                  />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-medium">{c.name}</p>
                      <code className="text-xs text-muted-foreground">{c.hex}</code>
                    </div>
                    <p className="flex-1 text-sm text-muted-foreground">{c.reason}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        localStorage.setItem("vto_selectedColor", c.hex);
                        localStorage.setItem("vto_selectedColorName", c.name);
                        localStorage.setItem("vto_selectedOutfit", outfit);
                        toast.success(`${c.name} ready in Try-on`);
                        navigate("/");
                      }}
                    >
                      Try on this color <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Style;