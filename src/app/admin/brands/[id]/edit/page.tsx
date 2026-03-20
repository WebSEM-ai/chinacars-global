import { db } from '@/db';
import { brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { BrandForm } from '@/components/admin/BrandForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;
  const brandId = parseInt(id, 10);
  if (isNaN(brandId)) notFound();

  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  });

  if (!brand) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Brand: {brand.name}</h1>
      <BrandForm
        mode="edit"
        initialData={{
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl ?? '',
          websiteUrl: brand.websiteUrl ?? '',
          descriptionEn: brand.descriptionEn ?? '',
          descriptionRo: brand.descriptionRo ?? '',
          foundedYear: brand.foundedYear ?? 0,
          isPublished: brand.isPublished ?? false,
          sortOrder: brand.sortOrder ?? 0,
        }}
      />
    </div>
  );
}
