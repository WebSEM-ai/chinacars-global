import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BrandsTable } from './brands-table';

export const dynamic = 'force-dynamic';

async function getBrands() {
  const result = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      logoUrl: brands.logoUrl,
      isPublished: brands.isPublished,
      sortOrder: brands.sortOrder,
      createdAt: brands.createdAt,
      modelCount: count(models.id),
    })
    .from(brands)
    .leftJoin(models, eq(models.brandId, brands.id))
    .groupBy(brands.id)
    .orderBy(brands.sortOrder, brands.name);

  return result;
}

export default async function AdminBrandsPage() {
  const data = await getBrands();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Link href="/admin/brands/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </Link>
      </div>
      <BrandsTable data={data} />
    </div>
  );
}
