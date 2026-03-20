'use client';

import { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

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
    <div className="space-y-2">
      {categories.map((cat) => {
        const validSpecs = cat.specs.filter(s => s.value !== null && s.value !== undefined);
        if (validSpecs.length === 0) return null;
        const isOpen = openIds.has(cat.id);

        return (
          <div
            key={cat.id}
            className={`rounded-xl border transition-colors duration-200 ${
              isOpen
                ? 'border-slate-700 bg-slate-800'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <button
              onClick={() => toggle(cat.id)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isOpen ? 'text-white' : 'text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isOpen
                    ? 'bg-[#E63946] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-sm tracking-tight">{cat.title}</span>
                <span className={`text-[10px] font-light px-1.5 py-0.5 rounded ${
                  isOpen
                    ? 'bg-white/10 text-white/50'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {validSpecs.length}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-white/60' : 'text-slate-400'
              }`} />
            </button>

            <div
              className="accordion-content"
              data-open={isOpen}
            >
              <div>
                <div className="px-4 pb-3">
                  <div className="rounded-lg bg-white/5 divide-y divide-white/5">
                    {validSpecs.map((spec, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 ${
                        isOpen ? '' : ''
                      }`}>
                        <span className={`text-xs font-light ${isOpen ? 'text-slate-400' : 'text-slate-400'}`}>
                          {spec.label}
                        </span>
                        <span className={`text-xs font-bold text-right ${
                          spec.highlight
                            ? 'text-[#E63946]'
                            : isOpen ? 'text-white' : 'text-slate-900'
                        }`}>
                          {typeof spec.value === 'boolean' ? (
                            spec.value ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-slate-500" />
                            )
                          ) : (
                            <>
                              {spec.value}
                              {spec.unit && (
                                <span className={`font-light ml-1 ${isOpen ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {spec.unit}
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
