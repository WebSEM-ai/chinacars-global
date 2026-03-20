'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Pencil, Trash2, Star } from 'lucide-react';

interface ModelRow {
  id: number;
  name: string;
  slug: string;
  brandName: string | null;
  propulsion: string | null;
  priceEurFrom: number | null;
  year: number | null;
  isPublished: boolean | null;
  isFeatured: boolean | null;
  sortOrder: number | null;
}

function formatPrice(v: number | null) {
  if (v == null) return '-';
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
}

const columns: Column<ModelRow>[] = [
  { key: 'id', header: 'ID', sortable: true },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (row) => (
      <span className="font-medium">
        {row.name}
        {row.isFeatured && <Star className="inline ml-1 h-3 w-3 text-yellow-500 fill-yellow-500" />}
      </span>
    ),
  },
  { key: 'brandName', header: 'Brand', sortable: true },
  {
    key: 'propulsion',
    header: 'Type',
    render: (row) => row.propulsion ? <Badge variant="outline">{row.propulsion}</Badge> : '-',
  },
  {
    key: 'priceEurFrom',
    header: 'Price From',
    sortable: true,
    render: (row) => formatPrice(row.priceEurFrom),
  },
  { key: 'year', header: 'Year', sortable: true },
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
    key: '_actions',
    header: 'Actions',
    render: (row) => <ModelActions id={row.id} />,
  },
];

function ModelActions({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this model? This cannot be undone.')) return;

    const res = await fetch(`/api/admin/models/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error || 'Failed to delete model');
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/admin/models/${id}/edit`}>
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

export function ModelsTable({ data }: { data: ModelRow[] }) {
  return <DataTable columns={columns} data={data} searchKey="name" />;
}
