import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, Wand2, Palette, ShirtIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Navbar } from "@/components/Navbar";
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
      toast.success("Recommendations ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="bg-gradient-hero">
        <header className="container max-w-6xl pt-10 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border shadow-soft mb-6">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wide">AI Color Stylist</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Style <span className="text-gradient">Recommendations</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Upload your photo and discover the colors that flatter your skin tone the most.
          </p>
        </header>
      </div>

      <main className="container max-w-4xl pb-16">
        <section className="bg-card rounded-3xl border border-border shadow-elegant p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ImageDropzone
              label="Your photo"
              hint="Clear daylight selfie works best"
              value={photo}
              onChange={setPhoto}
              cameraFacing="user"
            />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ShirtIcon className="w-4 h-4 text-primary" />
                  Outfit type
                </label>
                <Select value={outfit} onValueChange={setOutfit}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose an outfit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTFITS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={analyze}
                disabled={!canRun}
                size="lg"
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 shadow-elegant text-primary-foreground font-semibold transition-smooth disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Get Recommendations</>
                )}
              </Button>
            </div>
          </div>
        </section>

        {rec && (
          <section className="mt-8 bg-card rounded-3xl border border-border shadow-elegant p-6 md:p-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Your color palette</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Detected skin tone: <span className="font-medium text-foreground capitalize">{rec.skinTone}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">{rec.explanation}</p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rec.colors.map((c, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden shadow-soft flex flex-col">
                  <div
                    className="aspect-[4/3] w-full"
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{c.name}</p>
                      <code className="text-xs text-muted-foreground">{c.hex}</code>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1">{c.reason}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-lg"
                      onClick={() => {
                        localStorage.setItem("vto_selectedColor", c.hex);
                        localStorage.setItem("vto_selectedColorName", c.name);
                        localStorage.setItem("vto_selectedOutfit", outfit);
                        toast.success(`${c.name} ready in Try-On`);
                        navigate("/");
                      }}
                    >
                      Try-On with this color <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Style;
