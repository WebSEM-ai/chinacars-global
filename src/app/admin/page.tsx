import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { count, eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tags, Car, Eye, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [
    [totalBrands],
    [totalModels],
    [publishedModels],
    [featuredModels],
  ] = await Promise.all([
    db.select({ value: count() }).from(brands),
    db.select({ value: count() }).from(models),
    db.select({ value: count() }).from(models).where(eq(models.isPublished, true)),
    db.select({ value: count() }).from(models).where(eq(models.isFeatured, true)),
  ]);

  return {
    totalBrands: totalBrands.value,
    totalModels: totalModels.value,
    publishedModels: publishedModels.value,
    featuredModels: featuredModels.value,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: 'Total Brands',
      value: stats.totalBrands,
      icon: Tags,
      description: 'Registered car brands',
    },
    {
      title: 'Total Models',
      value: stats.totalModels,
      icon: Car,
      description: 'All car models in catalog',
    },
    {
      title: 'Published Models',
      value: stats.publishedModels,
      icon: Eye,
      description: 'Visible on the public site',
    },
    {
      title: 'Featured Models',
      value: stats.featuredModels,
      icon: Star,
      description: 'Highlighted on homepage',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
