'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Pencil, Trash2 } from 'lucide-react';

interface BrandRow {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  isPublished: boolean | null;
  sortOrder: number | null;
  createdAt: Date | null;
  modelCount: number;
}

const columns: Column<BrandRow>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'slug', header: 'Slug', sortable: true },
  {
    key: 'isPublished',
    header: 'Status',
    render: (row) =>
      row.isPublished ? (
        <Badge variant="default">Published</Badge>
      ) : (
        <Badge variant="secondary">Draft</Badge>
      ),
  },
  {
    key: 'modelCount',
    header: 'Models',
    sortable: true,
    render: (row) => <span>{row.modelCount}</span>,
  },
  {
    key: '_actions',
    header: 'Actions',
    render: (row) => <BrandActions id={row.id} />,
  },
];

function BrandActions({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this brand? This cannot be undone.')) return;

    const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error || 'Failed to delete brand');
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/admin/brands/${id}/edit`}>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleDelete}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function BrandsTable({ data }: { data: BrandRow[] }) {
  return <DataTable columns={columns} data={data} searchKey="name" />;
}
