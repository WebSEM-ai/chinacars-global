'use client';

import { useState } from 'react';
import { ChevronDown, Check, X, Zap, Battery, Ruler, Shield, Cpu, Sofa, Gauge } from 'lucide-react';

interface SpecItem {
  label: string;
  value: string | number | boolean | null | undefined;
  unit?: string;
  highlight?: boolean;
}

interface SpecCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  specs: SpecItem[];
}

export function SpecsAccordion({ categories }: { categories: SpecCategory[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([categories[0]?.id]));

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
      {categories.map((cat) => {
        const validSpecs = cat.specs.filter(s => s.value !== null && s.value !== undefined);
        if (validSpecs.length === 0) return null;
        const isOpen = openIds.has(cat.id);

        return (
          <div key={cat.id}>
            <button
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  {cat.icon}
                </div>
                <span className="font-semibold text-sm text-slate-900">{cat.title}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {validSpecs.length}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-5 pb-4">
                <div className="space-y-0 divide-y divide-slate-50">
                  {validSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-slate-500">{spec.label}</span>
                      <span className={`text-sm font-medium text-right ${spec.highlight ? 'text-[#E63946]' : 'text-slate-900'}`}>
                        {typeof spec.value === 'boolean' ? (
                          spec.value ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <X className="h-4 w-4 text-slate-300" />
                          )
                        ) : (
                          <>
                            {spec.value}
                            {spec.unit && <span className="text-slate-400 font-normal ml-1">{spec.unit}</span>}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
