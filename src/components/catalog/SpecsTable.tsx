import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Spec {
  label: string;
  value: string | number | boolean | null | undefined;
  unit?: string;
}

export function SpecsTable({ specs, title }: { specs: Spec[]; title: string }) {
  const filteredSpecs = specs.filter((s) => s.value !== null && s.value !== undefined);

  if (filteredSpecs.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <Table>
        <TableBody>
          {filteredSpecs.map((spec, i) => (
            <TableRow key={i}>
              <TableCell className="text-muted-foreground font-medium w-1/2">
                {spec.label}
              </TableCell>
              <TableCell className="font-semibold">
                {typeof spec.value === 'boolean' ? (
                  spec.value ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )
                ) : (
                  <>
                    {spec.value}
                    {spec.unit && <span className="text-muted-foreground font-normal ml-1">{spec.unit}</span>}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
