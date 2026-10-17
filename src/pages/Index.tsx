import { useState, useEffect } from "react";
import { Download, RefreshCw, Loader2, X, Camera, Shirt } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const Index = () => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [clothImage, setClothImage] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [colorName, setColorName] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedColor = localStorage.getItem("vto_selectedColor");
    const savedName = localStorage.getItem("vto_selectedColorName");
    const savedOutfit = localStorage.getItem("vto_selectedOutfit");
    if (savedColor) { setColor(savedColor); localStorage.removeItem("vto_selectedColor"); }
    if (savedName) { setColorName(savedName); localStorage.removeItem("vto_selectedColorName"); }
    if (savedOutfit) { setOutfit(savedOutfit); localStorage.removeItem("vto_selectedOutfit"); }
    if (savedColor) {
      toast.success(`Color ${savedName || savedColor} loaded from Color match`);
    }
  }, []);

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
      toast.success("Try-on generated");
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
    <Layout>
      <div className="container space-y-12 mt-5">
        <section className="glass rounded-3xl p-8 md:p-12 space-y-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                See the outfit on you before it is stitched
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Add a photo of yourself and a photo of the fabric or garment. Choose a style, and a color if you want one. The studio generates one image of you wearing it.
              </p>
              <p className="text-xs text-muted-foreground">
                The result is an AI generated image. Fit, drape and color are approximations, so check the real fabric before you order.
              </p>
              
              <ul className="grid gap-3 sm:grid-cols-2 pt-2">
                <li className="flex items-start gap-3 rounded-xl border border-white/60 bg-card/50 p-4">
                  <Shirt className="mt-0.5 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-sm">Six outfit styles</p>
                    <p className="text-xs text-muted-foreground">Shirt, frock, kurta, kameez, etc.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-white/60 bg-card/50 p-4">
                  <Camera className="mt-0.5 h-5 w-5 shrink-0 text-clay" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-sm">Upload or camera</p>
                    <p className="text-xs text-muted-foreground">Add file or snap in browser.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="/Hero-banner.png" 
                alt="Try-on showcase" 
                className="w-full max-h-[450px] object-cover rounded-2xl shadow-sm"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="step-photos" className="space-y-5">
          <h2 id="step-photos" className="text-4xl">
            <span className="mr-3 text-clay">1</span>Add your photos
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <ImageDropzone
                label="Your photo"
                hint="Full body works best"
                value={personImage}
                onChange={setPersonImage}
                cameraFacing="user"
              />
            </div>
            <div className="glass rounded-2xl p-5">
              <ImageDropzone
                label="Fabric or garment"
                hint="Optional if you pick a color"
                value={clothImage}
                onChange={setClothImage}
                cameraFacing="environment"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="step-style" className="space-y-5">
          <h2 id="step-style" className="text-4xl">
            <span className="mr-3 text-clay">2</span>Choose the style and color
          </h2>
          <div className="grid gap-6 glass rounded-2xl p-5 md:grid-cols-2 md:p-6">
            <div className="space-y-2">
              <label htmlFor="outfit" className="text-sm font-medium">
                Outfit style
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

            <div className="space-y-2">
              <label htmlFor="color-hex" className="text-sm font-medium">
                Color{" "}
                {colorName && <span className="font-normal text-muted-foreground">({colorName}, from Color match)</span>}
              </label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  aria-label="Pick a color"
                  value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#cccccc"}
                  onChange={(e) => { setColor(e.target.value); setColorName(""); }}
                  className="h-11 w-14 cursor-pointer p-1"
                />
                <Input
                  id="color-hex"
                  type="text"
                  value={color}
                  placeholder="#RRGGBB (optional)"
                  onChange={(e) => { setColor(e.target.value); setColorName(""); }}
                  className="h-11 flex-1"
                />
                {color && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => { setColor(""); setColorName(""); }}
                    aria-label="Clear color"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button onClick={generate} disabled={!canGenerate} size="lg" className="h-12 w-full text-base sm:w-auto">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating</>
            ) : (
              "Generate try-on"
            )}
          </Button>
        </section>

        {(loading || result) && (
          <section aria-labelledby="step-result" aria-live="polite" className="space-y-5">
            <h2 id="step-result" className="text-4xl">
              <span className="mr-3 text-clay">3</span>Your try-on
            </h2>

            {loading && (
              <div className="flex aspect-[4/5] max-w-md flex-col items-center justify-center gap-3 glass rounded-2xl px-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="font-medium">Generating your image</p>
                <p className="text-sm text-muted-foreground">Keep this tab open until it finishes.</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-5">
                <div className="max-w-md overflow-hidden glass rounded-2xl">
                  <img src={result} alt="Generated try-on" className="w-full" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => download(result)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button onClick={generate} variant="outline">
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Index;