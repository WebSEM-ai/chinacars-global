import { BrandForm } from '@/components/admin/BrandForm';

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Brand</h1>
      <BrandForm mode="create" />
    </div>
  );
}
