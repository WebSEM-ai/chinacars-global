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
  // Demo hardcoded data — will be replaced by MCP real-time data
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
    <div className="space-y-4">
      {/* Market Intelligence Header */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-[#E63946]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Intelligence</h3>
        </div>

        <div className="space-y-4">
          {/* Brand rank */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Global EV Rank</span>
            <span className="text-lg font-bold text-white">{marketData.globalRank}</span>
          </div>

          {/* Market share */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Market Share</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold">{marketData.marketShare}</span>
              {isUp ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-slate-700/50" />

          {/* YTD Sales */}
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wide">YTD Global Sales ({year || 2025})</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{marketData.ytdSales}</span>
              <span className={`text-sm font-semibold ${marketData.ytdGrowth.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {marketData.ytdGrowth}
              </span>
            </div>
          </div>

          {/* EU Sales */}
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wide">EU Sales</span>
            <p className="text-lg font-bold mt-0.5">{marketData.euSales}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
          <Factory className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-900">{marketData.factories}</p>
          <p className="text-xs text-slate-500">Factories</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
          <Globe className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-900">{marketData.countries}</p>
          <p className="text-xs text-slate-500">Countries</p>
        </div>
        {ncapStars && (
          <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <Award className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-slate-900">{ncapStars}/5</p>
            <p className="text-xs text-slate-500">Euro NCAP</p>
          </div>
        )}
        {markets && (
          <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <MapPin className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-slate-900">{markets.length}</p>
            <p className="text-xs text-slate-500">Markets</p>
          </div>
        )}
      </div>

      {/* Stock ticker (if available) */}
      {marketData.stockTicker && (
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stock</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">{marketData.stockTicker}</p>
              <p className="text-lg font-bold text-slate-900">{marketData.stockPrice}</p>
            </div>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${
              marketData.stockChange?.startsWith('+')
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}>
              {marketData.stockChange}
            </span>
          </div>
        </div>
      )}

      {/* Price context */}
      {priceEurFrom && marketData.competitorPrice && (
        <div className="bg-gradient-to-br from-[#E63946]/5 to-[#E63946]/10 border border-[#E63946]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-[#E63946]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E63946]">Price Context</span>
          </div>
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{'\u20AC'}{priceEurFrom.toLocaleString()}</span> starting price is{' '}
            <span className="font-bold text-emerald-600">
              {Math.round(((marketData.competitorPrice - priceEurFrom) / marketData.competitorPrice) * 100)}% less
            </span>{' '}
            than the avg. European competitor in this segment.
          </p>
        </div>
      )}

      {/* Top markets list */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Markets</span>
        </div>
        <div className="space-y-2">
          {marketData.topMarkets.map((market, i) => (
            <div key={market} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{market}</span>
              </div>
              <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E63946] rounded-full" style={{ width: `${100 - i * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-400 px-1">
        Market data is for demonstration purposes. Real-time data integration via MCP coming soon.
      </p>
    </div>
  );
}
