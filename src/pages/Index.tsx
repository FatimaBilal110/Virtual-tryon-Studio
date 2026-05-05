import { useState, useEffect } from "react";
import { Sparkles, Download, RefreshCw, Loader2, Wand2, ShirtIcon, Palette, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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



const Index = () => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [clothImage, setClothImage] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [colorName, setColorName] = useState<string>("");
  const [garmentFromGhost, setGarmentFromGhost] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = localStorage.getItem("vto_selectedColor");
    const cn = localStorage.getItem("vto_selectedColorName");
    const o = localStorage.getItem("vto_selectedOutfit");
    const g = localStorage.getItem("vto_garmentImage");
    if (c) { setColor(c); localStorage.removeItem("vto_selectedColor"); }
    if (cn) { setColorName(cn); localStorage.removeItem("vto_selectedColorName"); }
    if (o) { setOutfit(o); localStorage.removeItem("vto_selectedOutfit"); }
    if (g) {
      setClothImage(g);
      setGarmentFromGhost(true);
      localStorage.removeItem("vto_garmentImage");
    }
    if (c || g) {
      toast.success(g ? "Garment loaded from Ghost Mannequin" : `Color ${cn || c} loaded from Style AI`);
    }
  }, []);

  // Need either a cloth image OR a color to generate
  const canGenerate = personImage && outfit && (clothImage || color) && !loading;

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("tryon", {
        body: { personImage, clothImage, outfitType: outfit, color: color || undefined, colorName: colorName || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.image) throw new Error("No image returned");

      setResult(data.image);
      toast.success("Try-on generated!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const download = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `tryon-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="bg-gradient-hero">
        <header className="container max-w-6xl pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border shadow-soft mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wide">AI Powered Virtual Fitting</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Virtual Try-On <span className="text-gradient">Studio</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a photo and any fabric — see yourself wearing custom outfits in seconds.
          </p>
        </header>
      </div>

      <main className="container max-w-6xl pb-16">
        <section className="bg-card rounded-3xl border border-border shadow-elegant p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ImageDropzone
              label="Person photo"
              hint="Full body works best"
              value={personImage}
              onChange={setPersonImage}
              cameraFacing="user"
            />
            <div className="space-y-2">
              <ImageDropzone
                label={garmentFromGhost ? "Garment (from Ghost Mannequin)" : "Fabric or garment"}
                hint={garmentFromGhost ? "Auto-loaded — replace if you want" : "Pattern, color, texture. Optional if a color is selected."}
                value={clothImage}
                onChange={(v) => { setClothImage(v); if (!v) setGarmentFromGhost(false); }}
                cameraFacing="environment"
              />
              {garmentFromGhost && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="w-3 h-3" /> Loaded from Ghost Mannequin
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ShirtIcon className="w-4 h-4 text-primary" />
                Outfit style
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

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Selected color {colorName && <span className="text-xs text-muted-foreground font-normal">· from Style AI</span>}
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <Input
                    type="color"
                    value={color || "#cccccc"}
                    onChange={(e) => { setColor(e.target.value); setColorName(""); }}
                    className="h-12 w-14 rounded-xl p-1 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={color}
                  placeholder="#RRGGBB (optional)"
                  onChange={(e) => { setColor(e.target.value); setColorName(""); }}
                  className="h-12 rounded-xl flex-1"
                />
                {color && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => { setColor(""); setColorName(""); }}
                    aria-label="Clear color"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={generate}
              disabled={!canGenerate}
              size="lg"
              className="h-12 rounded-xl bg-gradient-primary hover:opacity-90 shadow-elegant text-primary-foreground font-semibold px-8 transition-smooth disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Generate Try-On</>
              )}
            </Button>
          </div>
        </section>

        {(loading || result) && (
          <section className="mt-8 bg-card rounded-3xl border border-border shadow-elegant p-6 md:p-10">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your virtual try-on
            </h2>

            {loading && (
              <div className="aspect-[4/5] max-w-md mx-auto rounded-2xl bg-gradient-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="p-5 rounded-full bg-gradient-primary shadow-glow">
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                </div>
                <div className="text-center px-6">
                  <p className="font-medium">Crafting your look…</p>
                  <p className="text-sm text-muted-foreground mt-1">This usually takes 10–20 seconds</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-elegant border border-border">
                  <img src={result} alt="Generated try-on" className="w-full" />
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => download(result)} variant="default" className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button onClick={generate} variant="outline" className="rounded-xl">
                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="text-center text-xs text-muted-foreground mt-12">
          Powered by Lovable AI · Images processed securely
        </footer>
      </main>
    </div>
  );
};

export default Index;
