import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Battery, Gauge, Zap } from 'lucide-react';

interface ModelCardProps {
  slug: string;
  brandSlug: string;
  brandName: string;
  name: string;
  imageUrl: string | null;
  propulsion: string | null;
  priceEurFrom: number | null;
  rangeWltpKm: number | null;
  powerHp: number | null;
  year: number | null;
  isFeatured: boolean | null;
}

export function ModelCard({
  slug,
  brandSlug,
  brandName,
  name,
  imageUrl,
  propulsion,
  priceEurFrom,
  rangeWltpKm,
  powerHp,
  year,
  isFeatured,
}: ModelCardProps) {
  return (
    <Link href={`/brands/${brandSlug}/${slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="relative aspect-[16/10] bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${brandName} ${name}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
              {brandName.charAt(0)}{name.charAt(0)}
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            {isFeatured && <Badge variant="default">Featured</Badge>}
            {propulsion && <Badge variant="secondary">{propulsion}</Badge>}
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{brandName}</p>
          <h3 className="font-semibold text-lg mt-0.5 group-hover:text-primary transition-colors">
            {name} {year && <span className="text-muted-foreground font-normal text-base">{year}</span>}
          </h3>

          {priceEurFrom && (
            <p className="text-primary font-semibold mt-1">
              From &euro;{priceEurFrom.toLocaleString()}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {rangeWltpKm && (
              <span className="flex items-center gap-1">
                <Battery className="h-3.5 w-3.5" />
                {rangeWltpKm} km
              </span>
            )}
            {powerHp && (
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                {powerHp} hp
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
