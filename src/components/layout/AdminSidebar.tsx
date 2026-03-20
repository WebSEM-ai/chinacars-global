'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, Tags, FileSpreadsheet, FileJson, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/brands', label: 'Brands', icon: Tags },
  { href: '/admin/models', label: 'Models', icon: Car },
  { href: '/admin/import', label: 'Import', icon: FileSpreadsheet },
  { href: '/admin/import-json', label: 'JSON Import', icon: FileJson },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen p-4 flex flex-col">
      <Link href="/admin" className="flex items-center gap-2 font-bold text-lg mb-8 px-2">
        <Car className="h-5 w-5 text-primary" />
        <span>ChinaCars <span className="text-xs text-muted-foreground">Admin</span></span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action="/api/auth/signout" method="POST">
        <Button variant="ghost" type="submit" className="w-full justify-start gap-3 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </aside>
  );
}
