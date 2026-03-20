'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const optInt = z.coerce.number().int().optional().or(z.literal(0)).or(z.nan().transform(() => undefined));
const optNum = z.coerce.number().optional().or(z.literal(0)).or(z.nan().transform(() => undefined));

const modelSchema = z.object({
  brandId: z.coerce.number().int().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  propulsion: z.string().optional(),
  segment: z.string().optional(),
  year: optInt,
  priceEurFrom: optInt,
  priceEurTo: optInt,
  priceUsdFrom: optInt,
  priceUsdTo: optInt,
  batteryKwh: z.string().optional(),
  rangeWltpKm: optInt,
  powerKw: optInt,
  powerHp: optInt,
  torqueNm: optInt,
  topSpeedKmh: optInt,
  acceleration0100: z.string().optional(),
  lengthMm: optInt,
  widthMm: optInt,
  heightMm: optInt,
  wheelbaseMm: optInt,
  trunkLiters: optInt,
  seats: optInt,
  driveType: z.string().optional(),
  chargeTimeDcMin: optInt,
  chargePowerDcKw: z.string().optional(),
  chargePowerAcKw: z.string().optional(),
  ncapStars: optInt,
  euHomologated: z.boolean().default(false),
  euTariffPct: z.string().optional(),
  serviceEurope: z.boolean().default(false),
  warrantyYears: optInt,
  warrantyKm: optInt,
  descriptionEn: z.string().optional(),
  descriptionRo: z.string().optional(),
  highlightsEn: z.string().optional(),
  highlightsRo: z.string().optional(),
  videoUrl: z.string().optional(),
  markets: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

type ModelFormValues = z.infer<typeof modelSchema>;

interface Brand {
  id: number;
  name: string;
}

interface ModelFormProps {
  brands: Brand[];
  initialData?: any;
  mode: 'create' | 'edit';
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ModelForm({ brands, initialData, mode }: ModelFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema) as any,
    defaultValues: {
      brandId: initialData?.brandId ?? 0,
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      propulsion: initialData?.propulsion ?? '',
      segment: initialData?.segment ?? '',
      year: initialData?.year ?? undefined,
      priceEurFrom: initialData?.priceEurFrom ?? undefined,
      priceEurTo: initialData?.priceEurTo ?? undefined,
      priceUsdFrom: initialData?.priceUsdFrom ?? undefined,
      priceUsdTo: initialData?.priceUsdTo ?? undefined,
      batteryKwh: initialData?.batteryKwh ?? '',
      rangeWltpKm: initialData?.rangeWltpKm ?? undefined,
      powerKw: initialData?.powerKw ?? undefined,
      powerHp: initialData?.powerHp ?? undefined,
      torqueNm: initialData?.torqueNm ?? undefined,
      topSpeedKmh: initialData?.topSpeedKmh ?? undefined,
      acceleration0100: initialData?.acceleration0100 ?? '',
      lengthMm: initialData?.lengthMm ?? undefined,
      widthMm: initialData?.widthMm ?? undefined,
      heightMm: initialData?.heightMm ?? undefined,
      wheelbaseMm: initialData?.wheelbaseMm ?? undefined,
      trunkLiters: initialData?.trunkLiters ?? undefined,
      seats: initialData?.seats ?? undefined,
      driveType: initialData?.driveType ?? '',
      chargeTimeDcMin: initialData?.chargeTimeDcMin ?? undefined,
      chargePowerDcKw: initialData?.chargePowerDcKw ?? '',
      chargePowerAcKw: initialData?.chargePowerAcKw ?? '',
      ncapStars: initialData?.ncapStars ?? undefined,
      euHomologated: initialData?.euHomologated ?? false,
      euTariffPct: initialData?.euTariffPct ?? '',
      serviceEurope: initialData?.serviceEurope ?? false,
      warrantyYears: initialData?.warrantyYears ?? undefined,
      warrantyKm: initialData?.warrantyKm ?? undefined,
      descriptionEn: initialData?.descriptionEn ?? '',
      descriptionRo: initialData?.descriptionRo ?? '',
      highlightsEn: Array.isArray(initialData?.highlightsEn)
        ? initialData.highlightsEn.join('\n')
        : initialData?.highlightsEn ?? '',
      highlightsRo: Array.isArray(initialData?.highlightsRo)
        ? initialData.highlightsRo.join('\n')
        : initialData?.highlightsRo ?? '',
      videoUrl: initialData?.videoUrl ?? '',
      markets: Array.isArray(initialData?.markets)
        ? initialData.markets.join(', ')
        : initialData?.markets ?? '',
      isPublished: initialData?.isPublished ?? false,
      isFeatured: initialData?.isFeatured ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const isPublished = watch('isPublished');
  const isFeatured = watch('isFeatured');
  const euHomologated = watch('euHomologated');
  const serviceEurope = watch('serviceEurope');

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function onSubmit(data: ModelFormValues) {
    setSaving(true);
    setError('');

    const payload = {
      ...data,
      propulsion: data.propulsion || null,
      segment: data.segment || null,
      driveType: data.driveType || null,
      batteryKwh: data.batteryKwh || null,
      acceleration0100: data.acceleration0100 || null,
      chargePowerDcKw: data.chargePowerDcKw || null,
      chargePowerAcKw: data.chargePowerAcKw || null,
      euTariffPct: data.euTariffPct || null,
      descriptionEn: data.descriptionEn || null,
      descriptionRo: data.descriptionRo || null,
      highlightsEn: data.highlightsEn
        ? data.highlightsEn.split('\n').filter((l) => l.trim())
        : null,
      highlightsRo: data.highlightsRo
        ? data.highlightsRo.split('\n').filter((l) => l.trim())
        : null,
      videoUrl: data.videoUrl || null,
      markets: data.markets
        ? data.markets.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
    };

    try {
      const url =
        mode === 'create'
          ? '/api/admin/models'
          : `/api/admin/models/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save model');
      }

      router.push('/admin/models');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* ── Basic Info ────────────────────────────────────────── */}
      <FieldGroup title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand *" id="brandId" error={errors.brandId?.message}>
            <select
              id="brandId"
              {...register('brandId')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select brand...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name *" id="name" error={errors.name?.message}>
            <Input
              id="name"
              {...register('name', {
                onChange: (e) => {
                  if (mode === 'create') {
                    setValue('slug', generateSlug(e.target.value));
                  }
                },
              })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug *" id="slug" error={errors.slug?.message}>
            <Input id="slug" {...register('slug')} />
          </Field>
          <Field label="Year" id="year" error={errors.year?.message}>
            <Input id="year" type="number" {...register('year')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Propulsion" id="propulsion" error={errors.propulsion?.message}>
            <select
              id="propulsion"
              {...register('propulsion')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option value="BEV">BEV</option>
              <option value="PHEV">PHEV</option>
              <option value="HEV">HEV</option>
              <option value="ICE">ICE</option>
            </select>
          </Field>
          <Field label="Segment" id="segment" error={errors.segment?.message}>
            <select
              id="segment"
              {...register('segment')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="mpv">MPV</option>
              <option value="pickup">Pickup</option>
              <option value="coupe">Coupe</option>
              <option value="wagon">Wagon</option>
            </select>
          </Field>
          <Field label="Drive Type" id="driveType" error={errors.driveType?.message}>
            <select
              id="driveType"
              {...register('driveType')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sort Order" id="sortOrder" error={errors.sortOrder?.message}>
            <Input id="sortOrder" type="number" {...register('sortOrder')} />
          </Field>
          <Field label="Seats" id="seats" error={errors.seats?.message}>
            <Input id="seats" type="number" {...register('seats')} />
          </Field>
        </div>
      </FieldGroup>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <FieldGroup title="Pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price EUR From" id="priceEurFrom">
            <Input id="priceEurFrom" type="number" {...register('priceEurFrom')} />
          </Field>
          <Field label="Price EUR To" id="priceEurTo">
            <Input id="priceEurTo" type="number" {...register('priceEurTo')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price USD From" id="priceUsdFrom">
            <Input id="priceUsdFrom" type="number" {...register('priceUsdFrom')} />
          </Field>
          <Field label="Price USD To" id="priceUsdTo">
            <Input id="priceUsdTo" type="number" {...register('priceUsdTo')} />
          </Field>
        </div>
      </FieldGroup>

      {/* ── Performance ──────────────────────────────────────── */}
      <FieldGroup title="Performance">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Power (kW)" id="powerKw">
            <Input id="powerKw" type="number" {...register('powerKw')} />
          </Field>
          <Field label="Power (HP)" id="powerHp">
            <Input id="powerHp" type="number" {...register('powerHp')} />
          </Field>
          <Field label="Torque (Nm)" id="torqueNm">
            <Input id="torqueNm" type="number" {...register('torqueNm')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Top Speed (km/h)" id="topSpeedKmh">
            <Input id="topSpeedKmh" type="number" {...register('topSpeedKmh')} />
          </Field>
          <Field label="0-100 km/h (s)" id="acceleration0100">
            <Input id="acceleration0100" type="text" {...register('acceleration0100')} placeholder="e.g. 6.5" />
          </Field>
        </div>
      </FieldGroup>

      {/* ── Battery & Charging ───────────────────────────────── */}
      <FieldGroup title="Battery & Charging">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Battery (kWh)" id="batteryKwh">
            <Input id="batteryKwh" type="text" {...register('batteryKwh')} placeholder="e.g. 82.5" />
          </Field>
          <Field label="Range WLTP (km)" id="rangeWltpKm">
            <Input id="rangeWltpKm" type="number" {...register('rangeWltpKm')} />
          </Field>
          <Field label="DC Charge Time (min)" id="chargeTimeDcMin">
            <Input id="chargeTimeDcMin" type="number" {...register('chargeTimeDcMin')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="DC Charge Power (kW)" id="chargePowerDcKw">
            <Input id="chargePowerDcKw" type="text" {...register('chargePowerDcKw')} placeholder="e.g. 150.0" />
          </Field>
          <Field label="AC Charge Power (kW)" id="chargePowerAcKw">
            <Input id="chargePowerAcKw" type="text" {...register('chargePowerAcKw')} placeholder="e.g. 11.0" />
          </Field>
        </div>
      </FieldGroup>

      {/* ── Dimensions ───────────────────────────────────────── */}
      <FieldGroup title="Dimensions">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Length (mm)" id="lengthMm">
            <Input id="lengthMm" type="number" {...register('lengthMm')} />
          </Field>
          <Field label="Width (mm)" id="widthMm">
            <Input id="widthMm" type="number" {...register('widthMm')} />
          </Field>
          <Field label="Height (mm)" id="heightMm">
            <Input id="heightMm" type="number" {...register('heightMm')} />
          </Field>
          <Field label="Wheelbase (mm)" id="wheelbaseMm">
            <Input id="wheelbaseMm" type="number" {...register('wheelbaseMm')} />
          </Field>
        </div>
        <Field label="Trunk (liters)" id="trunkLiters">
          <Input id="trunkLiters" type="number" className="max-w-xs" {...register('trunkLiters')} />
        </Field>
      </FieldGroup>

      {/* ── Safety & Certification ───────────────────────────── */}
      <FieldGroup title="Safety & Certification">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Euro NCAP Stars" id="ncapStars">
            <Input id="ncapStars" type="number" min={0} max={5} {...register('ncapStars')} />
          </Field>
          <Field label="EU Tariff (%)" id="euTariffPct">
            <Input id="euTariffPct" type="text" {...register('euTariffPct')} placeholder="e.g. 17.4" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Warranty (years)" id="warrantyYears">
            <Input id="warrantyYears" type="number" {...register('warrantyYears')} />
          </Field>
          <Field label="Warranty (km)" id="warrantyKm">
            <Input id="warrantyKm" type="number" {...register('warrantyKm')} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="euHomologated"
              checked={euHomologated}
              onCheckedChange={(c) => setValue('euHomologated', c === true)}
            />
            <Label htmlFor="euHomologated" className="cursor-pointer">EU Homologated</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="serviceEurope"
              checked={serviceEurope}
              onCheckedChange={(c) => setValue('serviceEurope', c === true)}
            />
            <Label htmlFor="serviceEurope" className="cursor-pointer">Service in Europe</Label>
          </div>
        </div>
      </FieldGroup>

      {/* ── Description & Highlights ─────────────────────────── */}
      <FieldGroup title="Description & Highlights">
        <Field label="Description (English)" id="descriptionEn">
          <Textarea id="descriptionEn" rows={5} {...register('descriptionEn')} />
        </Field>
        <Field label="Description (Romanian)" id="descriptionRo">
          <Textarea id="descriptionRo" rows={5} {...register('descriptionRo')} />
        </Field>
        <Field label="Highlights EN (one per line)" id="highlightsEn">
          <Textarea id="highlightsEn" rows={4} {...register('highlightsEn')} placeholder="800km range&#10;5-star NCAP&#10;OTA updates" />
        </Field>
        <Field label="Highlights RO (one per line)" id="highlightsRo">
          <Textarea id="highlightsRo" rows={4} {...register('highlightsRo')} />
        </Field>
      </FieldGroup>

      {/* ── Media ────────────────────────────────────────────── */}
      <FieldGroup title="Media">
        <Field label="Video URL" id="videoUrl">
          <Input id="videoUrl" type="url" {...register('videoUrl')} placeholder="https://youtube.com/..." />
        </Field>
        <Field label="Markets (comma-separated)" id="markets">
          <Input id="markets" {...register('markets')} placeholder="EU, RO, DE, FR" />
        </Field>
      </FieldGroup>

      {/* ── Publishing ───────────────────────────────────────── */}
      <FieldGroup title="Publishing">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublished"
              checked={isPublished}
              onCheckedChange={(c) => setValue('isPublished', c === true)}
            />
            <Label htmlFor="isPublished" className="cursor-pointer">Published</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFeatured"
              checked={isFeatured}
              onCheckedChange={(c) => setValue('isFeatured', c === true)}
            />
            <Label htmlFor="isFeatured" className="cursor-pointer">Featured</Label>
          </div>
        </div>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Model' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/models')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
