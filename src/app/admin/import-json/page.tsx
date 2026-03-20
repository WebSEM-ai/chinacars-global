'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileJson, Upload, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ParsedSummary {
  brand: string;
  model: string;
  powertrain: string;
  bodyType: string;
  year: number | null;
  variantCount: number;
  imageCount: number;
  marketsCount: number;
  hasTranslations: string[];
  status: string;
}

interface ImportResultData {
  success: boolean;
  modelId?: number;
  brandId?: number;
  variantsCreated?: number;
  errors: string[];
  warnings: string[];
  // batch fields
  total?: number;
  successful?: number;
  failed?: number;
  results?: ImportResultData[];
}

function parseSummary(data: any): ParsedSummary | null {
  if (!data?.identity) return null;
  const identity = data.identity;
  const meta = data.meta || {};
  const markets = data.markets || {};
  const content = data.content || {};

  return {
    brand: identity.brand || 'Unknown',
    model: identity.model_name || 'Unknown',
    powertrain: meta.powertrain_type || 'BEV',
    bodyType: identity.body_type || 'N/A',
    year: identity.year_introduced || null,
    variantCount: Array.isArray(data.variants) ? data.variants.length : 0,
    imageCount: Array.isArray(data.media?.images) ? data.media.images.length : 0,
    marketsCount: Array.isArray(markets.available_in) ? markets.available_in.length : 0,
    hasTranslations: content.translations ? Object.keys(content.translations) : [],
    status: meta.status || 'draft',
  };
}

export default function ImportJsonPage() {
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [summary, setSummary] = useState<ParsedSummary | ParsedSummary[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResultData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = useCallback((text: string) => {
    setParseError(null);
    setSummary(null);
    setParsedData(null);
    setResult(null);

    if (!text.trim()) return;

    try {
      const data = JSON.parse(text);

      if (Array.isArray(data)) {
        const summaries = data.map(parseSummary).filter(Boolean) as ParsedSummary[];
        if (summaries.length === 0) {
          setParseError('Array contains no valid vehicle objects (each must have an "identity" section).');
          return;
        }
        setParsedData(data);
        setSummary(summaries);
      } else {
        const s = parseSummary(data);
        if (!s) {
          setParseError('JSON must have an "identity" section with brand, model_name, and model_slug.');
          return;
        }
        setParsedData(data);
        setSummary(s);
      }
    } catch (e: any) {
      setParseError(`Invalid JSON: ${e.message}`);
    }
  }, []);

  const handleTextChange = (value: string) => {
    setJsonText(value);
    // Auto-parse on paste if long enough
    if (value.length > 20) {
      handleParse(value);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      handleParse(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setImporting(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({
        success: false,
        errors: [e.message || 'Network error'],
        warnings: [],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setJsonText('');
    setParsedData(null);
    setSummary(null);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isBatch = Array.isArray(summary);
  const summaries = isBatch ? (summary as ParsedSummary[]) : summary ? [summary as ParsedSummary] : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileJson className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">JSON Import</h1>
          <p className="text-muted-foreground text-sm">
            Import vehicle data from structured JSON (v1.1.0 schema). Paste JSON or upload a .json file.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">JSON Data</CardTitle>
              <CardDescription>
                Paste a single vehicle JSON object or an array of vehicles for batch import.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload .json
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {jsonText && (
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                )}
              </div>

              <Textarea
                placeholder='{"identity": {"brand": "BYD", "model_name": "Seal U", ...}}'
                className="font-mono text-xs min-h-[400px] resize-y"
                value={jsonText}
                onChange={(e) => handleTextChange(e.target.value)}
              />

              {jsonText && !summary && !parseError && (
                <Button variant="outline" size="sm" onClick={() => handleParse(jsonText)}>
                  Parse JSON
                </Button>
              )}

              {parseError && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview & Actions */}
        <div className="space-y-4">
          {summaries.length > 0 && (
            <>
              {isBatch && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Batch Import</CardTitle>
                    <CardDescription>
                      {summaries.length} vehicle{summaries.length !== 1 ? 's' : ''} detected in array
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {summaries.map((s, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {s.brand} {s.model}
                      </CardTitle>
                      <Badge variant={s.status === 'published' ? 'default' : 'secondary'}>
                        {s.status}
                      </Badge>
                    </div>
                    {s.year && (
                      <CardDescription>Year: {s.year}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Powertrain</span>
                        <p className="font-medium">{s.powertrain}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Body Type</span>
                        <p className="font-medium">{s.bodyType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Variants</span>
                        <p className="font-medium">{s.variantCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Images</span>
                        <p className="font-medium">{s.imageCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Markets</span>
                        <p className="font-medium">{s.marketsCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Translations</span>
                        <p className="font-medium">
                          {s.hasTranslations.length > 0
                            ? s.hasTranslations.join(', ').toUpperCase()
                            : 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />

              <Button
                className="w-full"
                size="lg"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileJson className="h-4 w-4 mr-2" />
                    Import {isBatch ? `${summaries.length} Vehicles` : 'Vehicle'}
                  </>
                )}
              </Button>
            </>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {result.success || (result.successful && result.successful > 0) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  Import Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Single result */}
                {result.modelId && (
                  <div className="text-sm space-y-1">
                    <p>Model ID: <span className="font-mono font-medium">{result.modelId}</span></p>
                    <p>Brand ID: <span className="font-mono font-medium">{result.brandId}</span></p>
                    <p>Variants created: <span className="font-medium">{result.variantsCreated}</span></p>
                  </div>
                )}

                {/* Batch result */}
                {result.total != null && (
                  <div className="text-sm space-y-1">
                    <p>Total: <span className="font-medium">{result.total}</span></p>
                    <p className="text-green-600">Successful: <span className="font-medium">{result.successful}</span></p>
                    {(result.failed ?? 0) > 0 && (
                      <p className="text-destructive">Failed: <span className="font-medium">{result.failed}</span></p>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-1">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-600">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Errors */}
                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-1">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                        <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{e}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Batch sub-results */}
                {result.results && result.results.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Separator />
                    <p className="text-xs text-muted-foreground font-medium">Per-vehicle details:</p>
                    {result.results.map((r, i) => (
                      <div key={i} className="text-xs p-2 rounded bg-muted/50 space-y-1">
                        <div className="flex items-center gap-2">
                          {r.success ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-destructive" />
                          )}
                          <span className="font-medium">
                            {r.modelId ? `Model #${r.modelId}` : `Vehicle ${i + 1}`}
                          </span>
                          {r.variantsCreated != null && (
                            <span className="text-muted-foreground">
                              ({r.variantsCreated} variant{r.variantsCreated !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        {r.warnings?.map((w, wi) => (
                          <p key={wi} className="text-amber-600 pl-5">{w}</p>
                        ))}
                        {r.errors?.map((e, ei) => (
                          <p key={ei} className="text-destructive pl-5">{e}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!summary && !result && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                <FileJson className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Paste or upload JSON to see a preview here.</p>
                <p className="mt-1 text-xs">
                  Supports single vehicle objects and arrays for batch import.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
