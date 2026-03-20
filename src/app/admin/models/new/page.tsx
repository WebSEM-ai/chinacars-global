import { db } from '@/db';
import { brands } from '@/db/schema';
import { ModelForm } from '@/components/admin/ModelForm';

export const dynamic = 'force-dynamic';

async function getBrands() {
  return db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .orderBy(brands.name);
}

export default async function NewModelPage() {
  const brandList = await getBrands();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Model</h1>
      <ModelForm brands={brandList} mode="create" />
    </div>
  );
}
