'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Trophy, Wallet, Battery, Gauge, Shield, Box, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface RankedModel {
  slug: string;
  brandSlug: string;
  brandName: string;
  name: string;
  imageUrl: string | null;
  propulsion: string | null;
  priceEurFrom: number | null;
  year: number | null;
  score: {
    overall: number;
    value: number;
    range: number;
    performance: number;
    safety: number;
    practicality: number;
    charging: number;
  };
}

interface ScoreLeaderboardProps {
  models: RankedModel[];
  locale: string;
}

const filters = [
  { key: 'all', label: 'All' },
  { key: 'BEV', label: 'Electric' },
  { key: 'PHEV', label: 'Plug-in Hybrid' },
  { key: 'HEV', label: 'Hybrid' },
  { key: 'ICE', label: 'Combustion' },
];

const categories = [
  { key: 'value' as const, label: 'Value', icon: Wallet, color: 'text-emerald-500' },
  { key: 'range' as const, label: 'Range', icon: Battery, color: 'text-blue-500' },
  { key: 'performance' as const, label: 'Performance', icon: Gauge, color: 'text-orange-500' },
  { key: 'safety' as const, label: 'Safety', icon: Shield, color: 'text-violet-500' },
  { key: 'practicality' as const, label: 'Practicality', icon: Box, color: 'text-amber-500' },
  { key: 'charging' as const, label: 'Charging', icon: Zap, color: 'text-cyan-500' },
];

function ScoreBadge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const color =
    value >= 80 ? 'from-emerald-500 to-emerald-600' :
    value >= 65 ? 'from-[#E63946] to-[#c72d39]' :
    value >= 50 ? 'from-amber-500 to-amber-600' :
    'from-slate-400 to-slate-500';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-sm`}>
      {value}
    </div>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  const bgColor =
    value >= 80 ? 'bg-emerald-500' :
    value >= 60 ? 'bg-[#E63946]' :
    value >= 40 ? 'bg-amber-500' :
    'bg-slate-400';

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bgColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500 w-5 text-right">{value}</span>
    </div>
  );
}

export function ScoreLeaderboard({ models, locale }: ScoreLeaderboardProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [showAlgoInfo, setShowAlgoInfo] = useState(false);

  const filtered = activeFilter === 'all'
    ? models
    : models.filter((m) => m.propulsion === activeFilter);

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  return (
    <div>
      {/* Header + Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => {
            const count = f.key === 'all'
              ? models.length
              : models.filter((m) => m.propulsion === f.key).length;
            if (count === 0 && f.key !== 'all') return null;
            return (
              <button
                key={f.key}
                onClick={() => { setActiveFilter(f.key); setShowAll(false); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${activeFilter === f.key ? 'text-white/60' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAlgoInfo(!showAlgoInfo)}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Info className="h-3.5 w-3.5" />
          How we score
          {showAlgoInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Algorithm description */}
      {showAlgoInfo && (
        <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
          <h4 className="font-bold text-sm text-slate-900 mb-2">ChinaCars Score Algorithm</h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Each model receives a composite score from 0 to 100 based on how it compares to every other model on the platform. Scores are <strong>relative</strong> — a car's rating reflects its position among peers, not an absolute judgment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { icon: Wallet, label: 'Value for Money', weight: '25%', desc: 'Price per HP, price per km range, absolute affordability' },
              { icon: Battery, label: 'Range & Efficiency', weight: '20%', desc: 'WLTP range for EVs, adjusted for PHEVs and hybrids' },
              { icon: Gauge, label: 'Performance', weight: '15%', desc: 'Horsepower, 0-100 km/h time, top speed' },
              { icon: Shield, label: 'Safety & Warranty', weight: '15%', desc: 'Euro NCAP stars, EU homologation, warranty length' },
              { icon: Box, label: 'Practicality', weight: '15%', desc: 'Trunk volume, seating capacity, wheelbase' },
              { icon: Zap, label: 'Charging', weight: '10%', desc: 'DC charge power, 10-80% charge time' },
            ].map((cat) => (
              <div key={cat.label} className="bg-white rounded-lg border border-slate-100 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <cat.icon className="h-3 w-3 text-[#E63946]" />
                  <span className="text-[10px] font-bold text-slate-700">{cat.label}</span>
                  <span className="text-[10px] font-bold text-[#E63946] ml-auto">{cat.weight}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[3rem_1fr_repeat(6,4.5rem)_3.5rem] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="text-center">#</div>
          <div>Model</div>
          {categories.map((c) => (
            <div key={c.key} className="text-center">{c.label}</div>
          ))}
          <div className="text-center">Score</div>
        </div>

        {/* Rows */}
        {displayed.map((model, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;

          return (
            <Link
              key={model.slug}
              href={`/brands/${model.brandSlug}/${model.slug}`}
              className={`group grid grid-cols-[2.5rem_1fr_auto] lg:grid-cols-[3rem_1fr_repeat(6,4.5rem)_3.5rem] gap-2 sm:gap-3 items-center px-3 sm:px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors ${
                isTop3 ? 'bg-gradient-to-r from-amber-50/40 to-transparent' : ''
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {rank === 1 ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
                    <Trophy className="h-3.5 w-3.5 text-white" />
                  </div>
                ) : rank === 2 ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                ) : rank === 3 ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">3</span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-slate-300">{rank}</span>
                )}
              </div>

              {/* Model info — car image + name + brand + price */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {model.imageUrl ? (
                    <Image
                      src={model.imageUrl}
                      alt={`${model.brandName} ${model.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold">
                      {model.brandName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#E63946] transition-colors truncate">
                      {model.name}
                    </span>
                    {model.propulsion && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        model.propulsion === 'BEV' ? 'bg-emerald-100 text-emerald-700' :
                        model.propulsion === 'PHEV' ? 'bg-blue-100 text-blue-700' :
                        model.propulsion === 'HEV' ? 'bg-violet-100 text-violet-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {model.propulsion}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-normal text-slate-400">{model.brandName}</span>
                    {model.priceEurFrom && (
                      <>
                        <span className="text-slate-200">·</span>
                        <span className="text-[11px] font-bold text-[#E63946]">
                          €{model.priceEurFrom.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category mini-bars — desktop only */}
              {categories.map((c) => (
                <div key={c.key} className="hidden lg:flex justify-center">
                  <MiniBar value={model.score[c.key]} color={c.color} />
                </div>
              ))}

              {/* Overall Score */}
              <div className="flex justify-end lg:justify-center">
                <ScoreBadge value={model.score.overall} />
              </div>

              {/* Mobile: category scores row */}
              <div className="col-span-full lg:hidden grid grid-cols-6 gap-1 mt-1 -mb-1">
                {categories.map((c) => (
                  <div key={c.key} className="text-center">
                    <c.icon className={`h-2.5 w-2.5 mx-auto mb-0.5 ${c.color}`} />
                    <span className="text-[9px] font-bold text-slate-500">{model.score[c.key]}</span>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show more / less */}
      {filtered.length > 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {showAll ? (
              <>Show Top 10 <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show All {filtered.length} Models <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
