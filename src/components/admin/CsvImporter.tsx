'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string }>;
}

const EXPECTED_COLUMNS = [
  'name', 'slug', 'brand_slug', 'propulsion', 'segment', 'year',
  'price_eur_from', 'price_eur_to', 'price_usd_from', 'price_usd_to',
  'battery_kwh', 'range_wltp_km', 'power_kw', 'power_hp', 'torque_nm',
  'top_speed_kmh', 'acceleration_0_100', 'length_mm', 'width_mm',
  'height_mm', 'wheelbase_mm', 'trunk_liters', 'seats', 'drive_type',
  'charge_time_dc_min', 'charge_power_dc_kw', 'charge_power_ac_kw',
  'ncap_stars', 'eu_homologated', 'eu_tariff_pct', 'service_europe',
  'warranty_years', 'warranty_km', 'description_en', 'video_url',
  'is_published', 'is_featured',
];

export function CsvImporter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const parsePreview = useCallback(async (f: File) => {
    setError('');
    setResult(null);

    const text = await f.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      setError('File must have at least a header row and one data row.');
      return;
    }

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1, 11).map(parseCsvLine); // preview first 10

    setPreview({ headers, rows });

    // Auto-map columns by matching names
    const map: Record<string, string> = {};
    headers.forEach((h) => {
      const normalized = h.toLowerCase().trim().replace(/\s+/g, '_');
      if (EXPECTED_COLUMNS.includes(normalized)) {
        map[h] = normalized;
      }
    });
    setColumnMap(map);
  }, []);

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',' || ch === ';') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    parsePreview(f);
  }

  function handleColumnMapChange(fileCol: string, targetCol: string) {
    setColumnMap((prev) => {
      const next = { ...prev };
      if (targetCol === '') {
        delete next[fileCol];
      } else {
        next[fileCol] = targetCol;
      }
      return next;
    });
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMap', JSON.stringify(columnMap));

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Import failed');
      }

      setResult(body);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV or Excel (.xlsx) file with model data. The first row should contain column
              headers.
            </p>
            <div className="flex items-center gap-4">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Mapping */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Map each file column to the corresponding database field. Unmapped columns will be
              skipped.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {preview.headers.map((h) => (
                <div key={h} className="flex items-center gap-2">
                  <Label className="w-32 truncate text-xs font-mono" title={h}>
                    {h}
                  </Label>
                  <select
                    value={columnMap[h] ?? ''}
                    onChange={(e) => handleColumnMapChange(h, e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- skip --</option>
                    {EXPECTED_COLUMNS.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview (first 10 rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.headers.map((h) => (
                      <TableHead key={h} className="text-xs whitespace-nowrap">
                        {h}
                        {columnMap[h] && (
                          <span className="block text-[10px] text-primary font-normal">
                            → {columnMap[h]}
                          </span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j} className="text-xs whitespace-nowrap max-w-[200px] truncate">
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {preview && (
        <div className="flex items-center gap-4">
          <Button onClick={handleImport} disabled={importing || Object.keys(columnMap).length === 0}>
            {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Data
          </Button>
          {Object.keys(columnMap).length === 0 && (
            <span className="text-sm text-muted-foreground">Map at least one column to import</span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              Successfully imported <strong>{result.success}</strong> rows.
            </p>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-destructive font-medium">
                  {result.errors.length} row(s) had errors:
                </p>
                <ul className="text-xs text-destructive space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
