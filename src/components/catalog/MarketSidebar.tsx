import { TrendingUp, TrendingDown, Globe, Factory, BarChart3, DollarSign, Target, Users, MapPin, Award } from 'lucide-react';

interface MarketSidebarProps {
  brandName: string;
  modelName: string;
  priceEurFrom: number | null;
  ncapStars: number | null;
  markets: string[] | null;
  year: number | null;
}

export function MarketSidebar({ brandName, modelName, priceEurFrom, ncapStars, markets, year }: MarketSidebarProps) {
  const marketData = {
    globalRank: brandName === 'BYD' ? '#1' : brandName === 'Geely' ? '#3' : '#8',
    marketShare: brandName === 'BYD' ? '18.4%' : brandName === 'NIO' ? '2.1%' : '4.7%',
    marketShareTrend: 'up' as const,
    ytdSales: brandName === 'BYD' ? '2,410,000' : brandName === 'NIO' ? '180,500' : '560,000',
    ytdGrowth: brandName === 'BYD' ? '+23%' : brandName === 'NIO' ? '+38%' : '+15%',
    euSales: brandName === 'BYD' ? '142,000' : brandName === 'NIO' ? '18,200' : '45,000',
    topMarkets: ['China', 'Germany', 'UK', 'Norway', 'Australia'],
    stockTicker: brandName === 'BYD' ? 'SZ:002594' : brandName === 'NIO' ? 'NYSE:NIO' : null,
    stockPrice: brandName === 'BYD' ? '¥302.50' : brandName === 'NIO' ? '$7.82' : null,
    stockChange: brandName === 'BYD' ? '+2.4%' : brandName === 'NIO' ? '-1.2%' : null,
    factories: brandName === 'BYD' ? 12 : brandName === 'NIO' ? 3 : 5,
    countries: brandName === 'BYD' ? 78 : brandName === 'NIO' ? 12 : 35,
    competitorPrice: priceEurFrom ? Math.round(priceEurFrom * 1.15) : null,
  };

  const isUp = marketData.marketShareTrend === 'up';

  return (
    <div className="space-y-3">
      {/* Market Intelligence — Dark card */}
      <div className="bg-slate-900 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-3.5 w-3.5 text-[#E63946]" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Market Intelligence</h3>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">EV Rank</span>
              <p className="text-lg font-bold leading-tight">{marketData.globalRank}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Share</span>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold leading-tight">{marketData.marketShare}</p>
                {isUp ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">YTD Sales ({year || 2025})</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold">{marketData.ytdSales}</span>
              <span className={`text-xs font-bold ${marketData.ytdGrowth.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {marketData.ytdGrowth}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">EU Sales</span>
            <p className="text-base font-bold mt-0.5">{marketData.euSales}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats — Compact 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
          <Factory className="h-4 w-4 text-slate-400 mx-auto mb-1" />
          <p className="text-base font-bold text-slate-900 leading-tight">{marketData.factories}</p>
          <p className="text-[10px] text-slate-500">Factories</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
          <Globe className="h-4 w-4 text-slate-400 mx-auto mb-1" />
          <p className="text-base font-bold text-slate-900 leading-tight">{marketData.countries}</p>
          <p className="text-[10px] text-slate-500">Countries</p>
        </div>
        {ncapStars && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
            <Award className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base font-bold text-slate-900 leading-tight">{ncapStars}/5</p>
            <p className="text-[10px] text-slate-500">Euro NCAP</p>
          </div>
        )}
        {markets && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-center">
            <MapPin className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base font-bold text-slate-900 leading-tight">{markets.length}</p>
            <p className="text-[10px] text-slate-500">Markets</p>
          </div>
        )}
      </div>

      {/* Stock */}
      {marketData.stockTicker && (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <DollarSign className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">{marketData.stockTicker}</p>
              <p className="text-base font-bold text-slate-900">{marketData.stockPrice}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              marketData.stockChange?.startsWith('+')
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}>
              {marketData.stockChange}
            </span>
          </div>
        </div>
      )}

      {/* Price Context */}
      {priceEurFrom && marketData.competitorPrice && (
        <div className="bg-[#E63946]/5 border border-[#E63946]/15 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target className="h-3 w-3 text-[#E63946]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E63946]">Price Context</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">{'\u20AC'}{priceEurFrom.toLocaleString()}</span> is{' '}
            <span className="font-bold text-emerald-600">
              {Math.round(((marketData.competitorPrice - priceEurFrom) / marketData.competitorPrice) * 100)}% less
            </span>{' '}
            than avg. EU competitor.
          </p>
        </div>
      )}

      {/* Top Markets */}
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Markets</span>
        </div>
        <div className="space-y-1.5">
          {marketData.topMarkets.map((market, i) => (
            <div key={market} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-700">{market}</span>
              </div>
              <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E63946] rounded-full" style={{ width: `${100 - i * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-slate-400 px-1">
        Demo data. Real-time MCP integration coming soon.
      </p>
    </div>
  );
}
