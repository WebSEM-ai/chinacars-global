import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface BrandCardProps {
  slug: string;
  name: string;
  logoUrl: string | null;
  modelCount: number;
  foundedYear: number | null;
}

export function BrandCard({ slug, name, logoUrl, modelCount, foundedYear }: BrandCardProps) {
  return (
    <Link href={`/brands/${slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[180px]">
          {logoUrl ? (
            <div className="relative w-24 h-16 mb-3">
              <Image src={logoUrl} alt={name} fill className="object-contain" sizes="96px" />
            </div>
          ) : (
            <div className="w-24 h-16 mb-3 bg-muted rounded flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {name.charAt(0)}
            </div>
          )}
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {modelCount} model{modelCount !== 1 ? 's' : ''}
            {foundedYear && ` · Est. ${foundedYear}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
