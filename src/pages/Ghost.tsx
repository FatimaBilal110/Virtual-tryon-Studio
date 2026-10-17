import { useState } from "react";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Layout } from "@/components/Layout";
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
      toast.success("Model shot generated");
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
    <Layout title="Model shots">
      <div className="container space-y-12 mt-5">
        <section className="glass rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                Turn a garment photo into a model shot
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Add a photo of a garment on a hanger, laid flat or on a mannequin. Choose the model type and the studio generates a catalog style image of the garment being worn.
              </p>
            </div>
            <div>
              <img 
                src="/Ghost-banner.png" 
                alt="Model shots showcase" 
                className="w-full h-auto rounded-2xl object-cover shadow-sm"
              />
            </div>
          </div>
        </section>

        <section aria-label="Garment and model options" className="glass rounded-2xl p-5 md:p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <ImageDropzone
              label="Garment photo"
              hint="Hanger, flat lay or mannequin"
              value={garment}
              onChange={setGarment}
              cameraFacing="environment"
            />
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender" className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="body-type" className="text-sm font-medium">Body type</label>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger id="body-type" className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generate} disabled={!canRun} size="lg" className="h-12 w-full text-base">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating</>
                ) : (
                  "Generate model shot"
                )}
              </Button>
            </div>
          </div>
        </section>

        {(loading || result) && (
          <section aria-labelledby="result-heading" aria-live="polite" className="space-y-5">
            <h2 id="result-heading" className="text-4xl">Your model shot</h2>
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
                  <img src={result} alt="Generated model shot" className="w-full" />
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

export default Ghost;