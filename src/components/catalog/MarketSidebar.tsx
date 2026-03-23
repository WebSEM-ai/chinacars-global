import { Award, MapPin, Shield, Zap, Battery, Gauge, Wallet, Box, Target } from 'lucide-react';
import type { ScoreBreakdown } from '@/lib/compute-score';

interface MarketSidebarProps {
  brandName: string;
  modelName: string;
  priceEurFrom: number | null;
  ncapStars: number | null;
  markets: string[] | null;
  year: number | null;
  cutoutImageUrl: string | null;
  score: ScoreBreakdown | null;
  rank: number | null;      // position among all models (1-based)
  totalModels: number;
}

function ScoreRing({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Color based on score
  const color =
    value >= 80 ? '#10b981' :  // emerald
    value >= 60 ? '#E63946' :  // brand red
    value >= 40 ? '#f59e0b' :  // amber
    '#ef4444';                  // red

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-white/10"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{value}</span>
        <span className="text-[8px] font-light uppercase tracking-wider text-slate-500 mt-0.5">/100</span>
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  const color =
    value >= 80 ? 'bg-emerald-500' :
    value >= 60 ? 'bg-[#E63946]' :
    value >= 40 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-slate-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-light text-slate-400 truncate">{label}</span>
          <span className="text-[10px] font-bold text-white ml-1">{value}</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${value}%`, transition: 'width 1s ease' }}
          />
        </div>
      </div>
    </div>
  );
}

export function MarketSidebar({
  brandName,
  modelName,
  priceEurFrom,
  ncapStars,
  markets,
  year,
  cutoutImageUrl,
  score,
  rank,
  totalModels,
}: MarketSidebarProps) {
  return (
    <div className="space-y-3">
      {/* Car Cutout + Score Ring */}
      {cutoutImageUrl && (
        <div className="relative bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="relative px-4 pt-4 pb-2">
            <img
              src={cutoutImageUrl}
              alt={`${brandName} ${modelName}`}
              className="w-full h-auto object-contain max-h-[200px]"
              loading="eager"
            />
          </div>
          <div className="px-4 pb-3 text-center">
            <p className="text-[10px] font-light uppercase tracking-widest text-slate-400">{brandName}</p>
            <p className="text-sm font-black text-slate-900">{modelName}</p>
          </div>
        </div>
      )}

      {/* Score Card — Dark */}
      {score && (
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-3.5 w-3.5 text-[#E63946]" />
            <h3 className="text-[10px] font-light uppercase tracking-widest text-slate-500">
              ChinaCars Score
            </h3>
          </div>

          {/* Overall score ring + rank */}
          <div className="flex items-center gap-4 mb-5">
            <ScoreRing value={score.overall} />
            <div className="flex-1">
              <p className="text-xs font-light text-slate-500 mb-1">
                {score.overall >= 80 ? 'Excellent' :
                 score.overall >= 65 ? 'Very Good' :
                 score.overall >= 50 ? 'Good' :
                 'Average'}
              </p>
              {rank != null && totalModels > 0 && (
                <p className="text-xs font-light text-slate-400">
                  Ranked <span className="font-black text-white">#{rank}</span>
                  <span className="text-slate-600"> of {totalModels}</span>
                </p>
              )}
              {priceEurFrom && (
                <p className="text-lg font-black text-[#E63946] mt-1">
                  €{priceEurFrom.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-2.5">
            <CategoryBar label="Value for Money" value={score.value} icon={Wallet} />
            <CategoryBar label="Range & Efficiency" value={score.range} icon={Battery} />
            <CategoryBar label="Performance" value={score.performance} icon={Gauge} />
            <CategoryBar label="Safety & Warranty" value={score.safety} icon={Shield} />
            <CategoryBar label="Practicality" value={score.practicality} icon={Box} />
            <CategoryBar label="Charging" value={score.charging} icon={Zap} />
          </div>
        </div>
      )}

      {/* Quick Stats — Compact 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {ncapStars && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
            <Award className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base font-black text-slate-900 leading-tight">{ncapStars}/5</p>
            <p className="text-[10px] font-light text-slate-400">Euro NCAP</p>
          </div>
        )}
        {markets && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
            <MapPin className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base font-black text-slate-900 leading-tight">{markets.length}</p>
            <p className="text-[10px] font-light text-slate-400">Markets</p>
          </div>
        )}
        {year && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
            <Shield className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base font-black text-slate-900 leading-tight">{year}</p>
            <p className="text-[10px] font-light text-slate-400">Model Year</p>
          </div>
        )}
        {rank != null && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
            <Target className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base font-black text-slate-900 leading-tight">#{rank}</p>
            <p className="text-[10px] font-light text-slate-400">Overall Rank</p>
          </div>
        )}
      </div>

      <p className="text-[9px] text-slate-400 px-1">
        Score based on specs, pricing, safety, and efficiency vs. all models on the platform.
      </p>
    </div>
  );
}
