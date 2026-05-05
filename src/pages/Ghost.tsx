import { useState } from "react";
import { Sparkles, Loader2, Wand2, Download, RefreshCw, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Ghost = () => {
  const [garment, setGarment] = useState<string | null>(null);
  const [gender, setGender] = useState("female");
  const [bodyType, setBodyType] = useState("regular");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canRun = garment && !loading;

  const generate = async () => {
    if (!canRun) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ghost-mannequin", {
        body: { garmentImage: garment, gender, bodyType },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.image) throw new Error("No image returned");
      setResult(data.image);
      toast.success("Model shot generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const download = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-shot-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="bg-gradient-hero">
        <header className="container max-w-6xl pt-10 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border shadow-soft mb-6">
            <UserSquare2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wide">Ghost Mannequin → Model</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Catalog-Ready <span className="text-gradient">Model Shots</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Turn flat-lay, hanger, or mannequin photos into studio-quality images on a realistic model.
          </p>
        </header>
      </div>

      <main className="container max-w-4xl pb-16">
        <section className="bg-card rounded-3xl border border-border shadow-elegant p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ImageDropzone
              label="Garment photo"
              hint="Hanger, flat lay, or mannequin"
              value={garment}
              onChange={setGarment}
              cameraFacing="environment"
            />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Body type</label>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={generate}
                disabled={!canRun}
                size="lg"
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 shadow-elegant text-primary-foreground font-semibold transition-smooth disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Generate Model Shot</>
                )}
              </Button>
            </div>
          </div>
        </section>

        {(loading || result) && (
          <section className="mt-8 bg-card rounded-3xl border border-border shadow-elegant p-6 md:p-10">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Studio result
            </h2>
            {loading && (
              <div className="aspect-[4/5] max-w-md mx-auto rounded-2xl bg-gradient-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="p-5 rounded-full bg-gradient-primary shadow-glow">
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                </div>
                <div className="text-center px-6">
                  <p className="font-medium">Building your model shot…</p>
                  <p className="text-sm text-muted-foreground mt-1">10–20 seconds</p>
                </div>
              </div>
            )}
            {result && !loading && (
              <div className="space-y-6">
                <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-elegant border border-border">
                  <img src={result} alt="Generated model" className="w-full" />
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => download(result)} className="rounded-xl">
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
      </main>
    </div>
  );
};

export default Ghost;
