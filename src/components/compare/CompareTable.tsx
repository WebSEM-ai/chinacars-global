import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface CompareModel {
  slug: string;
  name: string;
  brandSlug: string;
  brandName: string;
  imageUrl: string | null;
  propulsion: string | null;
  segment: string | null;
  year: number | null;
  priceEurFrom: number | null;
  priceEurTo: number | null;
  batteryKwh: string | null;
  rangeWltpKm: number | null;
  powerKw: number | null;
  powerHp: number | null;
  torqueNm: number | null;
  topSpeedKmh: number | null;
  acceleration0100: string | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  trunkLiters: number | null;
  seats: number | null;
  driveType: string | null;
  chargeTimeDcMin: number | null;
  chargePowerDcKw: string | null;
  chargePowerAcKw: string | null;
  ncapStars: number | null;
  euHomologated: boolean | null;
  warrantyYears: number | null;
  warrantyKm: number | null;
}

interface CompareTableProps {
  models: CompareModel[];
}

type SpecRow = {
  label: string;
  key: string;
  getValue: (m: CompareModel) => string | number | boolean | null;
  unit?: string;
  highlight?: 'higher' | 'lower';
};

export function CompareTable({ models }: CompareTableProps) {
  const t = useTranslations('model');

  const specRows: SpecRow[] = [
    { label: t('propulsion'), key: 'propulsion', getValue: (m) => m.propulsion },
    { label: t('segment'), key: 'segment', getValue: (m) => m.segment },
    { label: t('pricing'), key: 'price', getValue: (m) => m.priceEurFrom ? `€${m.priceEurFrom.toLocaleString()}${m.priceEurTo ? ` - €${m.priceEurTo.toLocaleString()}` : ''}` : null },
    { label: t('batteryCapacity'), key: 'battery', getValue: (m) => m.batteryKwh ? `${m.batteryKwh} kWh` : null },
    { label: t('wltpRange'), key: 'range', getValue: (m) => m.rangeWltpKm, unit: 'km', highlight: 'higher' },
    { label: t('powerOutput'), key: 'power', getValue: (m) => m.powerHp, unit: 'hp', highlight: 'higher' },
    { label: t('torque'), key: 'torque', getValue: (m) => m.torqueNm, unit: 'Nm', highlight: 'higher' },
    { label: t('topSpeed'), key: 'topSpeed', getValue: (m) => m.topSpeedKmh, unit: 'km/h', highlight: 'higher' },
    { label: t('acceleration'), key: 'accel', getValue: (m) => m.acceleration0100 ? `${m.acceleration0100}s` : null, highlight: 'lower' },
    { label: t('driveType'), key: 'drive', getValue: (m) => m.driveType },
    { label: t('dcChargeTime'), key: 'dcTime', getValue: (m) => m.chargeTimeDcMin, unit: 'min', highlight: 'lower' },
    { label: t('dcChargePower'), key: 'dcPower', getValue: (m) => m.chargePowerDcKw ? `${m.chargePowerDcKw} kW` : null },
    { label: t('length'), key: 'length', getValue: (m) => m.lengthMm, unit: 'mm' },
    { label: t('width'), key: 'width', getValue: (m) => m.widthMm, unit: 'mm' },
    { label: t('height'), key: 'height', getValue: (m) => m.heightMm, unit: 'mm' },
    { label: t('wheelbase'), key: 'wheelbase', getValue: (m) => m.wheelbaseMm, unit: 'mm' },
    { label: t('trunkVolume'), key: 'trunk', getValue: (m) => m.trunkLiters, unit: 'L', highlight: 'higher' },
    { label: t('seats') + ' (' + t('seats') + ')', key: 'seats', getValue: (m) => m.seats },
    { label: t('ncapRating'), key: 'ncap', getValue: (m) => m.ncapStars ? `${m.ncapStars} ★` : null, highlight: 'higher' },
    { label: t('euHomologated'), key: 'euHomologated', getValue: (m) => m.euHomologated },
    { label: t('warranty'), key: 'warranty', getValue: (m) => m.warrantyYears ? `${m.warrantyYears}y / ${m.warrantyKm?.toLocaleString()} km` : null },
  ];

  function getBestIndex(row: SpecRow): number | null {
    if (!row.highlight) return null;
    const values = models.map((m) => {
      const v = row.getValue(m);
      return typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : null;
    });
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length < 2) return null;
    const best = row.highlight === 'higher' ? Math.max(...validValues) : Math.min(...validValues);
    return values.indexOf(best);
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 sticky left-0 bg-background z-10">Spec</TableHead>
            {models.map((m) => (
              <TableHead key={m.slug} className="min-w-[200px] text-center">
                <Link href={`/brands/${m.brandSlug}/${m.slug}`} className="hover:text-primary">
                  <div className="font-semibold">{m.brandName}</div>
                  <div className="text-base">{m.name}</div>
                </Link>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {specRows.map((row) => {
            const bestIdx = getBestIndex(row);
            const hasAnyValue = models.some((m) => row.getValue(m) !== null && row.getValue(m) !== undefined);
            if (!hasAnyValue) return null;

            return (
              <TableRow key={row.key}>
                <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">
                  {row.label}
                </TableCell>
                {models.map((m, i) => {
                  const value = row.getValue(m);
                  const isBest = bestIdx === i;
                  return (
                    <TableCell
                      key={m.slug}
                      className={`text-center ${isBest ? 'text-primary font-bold' : ''}`}
                    >
                      {value === null || value === undefined ? (
                        <span className="text-muted-foreground">—</span>
                      ) : typeof value === 'boolean' ? (
                        value ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                      ) : (
                        <>
                          {value}
                          {row.unit && typeof row.getValue(models[0]) === 'number' && (
                            <span className="text-muted-foreground font-normal ml-1 text-xs">{row.unit}</span>
                          )}
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
