import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ModelsTable } from './models-table';

export const dynamic = 'force-dynamic';

async function getModels() {
  const result = await db
    .select({
      id: models.id,
      name: models.name,
      slug: models.slug,
      brandName: brands.name,
      propulsion: models.propulsion,
      priceEurFrom: models.priceEurFrom,
      year: models.year,
      isPublished: models.isPublished,
      isFeatured: models.isFeatured,
      sortOrder: models.sortOrder,
    })
    .from(models)
    .leftJoin(brands, eq(models.brandId, brands.id))
    .orderBy(models.sortOrder, models.name);

  return result;
}

export default async function AdminModelsPage() {
  const data = await getModels();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Models</h1>
        <Link href="/admin/models/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Model
          </Button>
        </Link>
      </div>
      <ModelsTable data={data} />
    </div>
  );
}
