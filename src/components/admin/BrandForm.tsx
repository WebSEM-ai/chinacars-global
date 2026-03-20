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

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionRo: z.string().optional(),
  foundedYear: z.coerce.number().int().min(1800).max(2100).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

type BrandFormValues = {
  name: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  descriptionEn?: string;
  descriptionRo?: string;
  foundedYear?: number;
  isPublished: boolean;
  sortOrder: number;
};

interface BrandFormProps {
  initialData?: BrandFormValues & { id?: number };
  mode: 'create' | 'edit';
}

export function BrandForm({ initialData, mode }: BrandFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      logoUrl: initialData?.logoUrl ?? '',
      websiteUrl: initialData?.websiteUrl ?? '',
      descriptionEn: initialData?.descriptionEn ?? '',
      descriptionRo: initialData?.descriptionRo ?? '',
      foundedYear: initialData?.foundedYear ?? 0,
      isPublished: initialData?.isPublished ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const isPublished = watch('isPublished');

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function onSubmit(data: BrandFormValues) {
    setSaving(true);
    setError('');

    const payload = {
      ...data,
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl || null,
      descriptionEn: data.descriptionEn || null,
      descriptionRo: data.descriptionRo || null,
      foundedYear: data.foundedYear || null,
    };

    try {
      const url =
        mode === 'create'
          ? '/api/admin/brands'
          : `/api/admin/brands/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save brand');
      }

      router.push('/admin/brands');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
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
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register('slug')} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" type="url" {...register('logoUrl')} />
              {errors.logoUrl && (
                <p className="text-xs text-destructive">{errors.logoUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input id="websiteUrl" type="url" {...register('websiteUrl')} />
              {errors.websiteUrl && (
                <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input id="foundedYear" type="number" {...register('foundedYear')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" {...register('sortOrder')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            <Textarea id="descriptionEn" rows={4} {...register('descriptionEn')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionRo">Description (Romanian)</Label>
            <Textarea id="descriptionRo" rows={4} {...register('descriptionRo')} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublished"
              checked={isPublished}
              onCheckedChange={(checked) => setValue('isPublished', checked === true)}
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Published
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Brand' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/brands')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
