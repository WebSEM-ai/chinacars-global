import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ModelForm } from '@/components/admin/ModelForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditModelPage({ params }: Props) {
  const { id } = await params;
  const modelId = parseInt(id, 10);
  if (isNaN(modelId)) notFound();

  const [model, brandList] = await Promise.all([
    db.query.models.findFirst({ where: eq(models.id, modelId) }),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(brands.name),
  ]);

  if (!model) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Model: {model.name}</h1>
      <ModelForm brands={brandList} mode="edit" initialData={model} />
    </div>
  );
}
