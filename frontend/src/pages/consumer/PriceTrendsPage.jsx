import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listingApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function PriceTrendsPage() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    listingApi
      .getPriceTrends()
      .then(({ data }) => {
        const list = data.data.trends || [];
        setTrends(list);
        if (list.length > 0) {
          // Default to the first item name
          const items = Array.from(new Set(list.map((t) => t.item)));
          setSelectedItem(items[0] || '');
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Filter trends for selected item
  const itemTrends = trends.filter(
    (t) => t.item.toLowerCase() === selectedItem.toLowerCase()
  );

  // Get distinct cities and dates for the selected item
  const cities = Array.from(new Set(itemTrends.map((t) => t.city)));
  const dates = Array.from(new Set(itemTrends.map((t) => t.date))).sort();
  const allItems = Array.from(new Set(trends.map((t) => t.item)));

  // Group data by city
  const cityData = {};
  cities.forEach((city) => {
    cityData[city] = dates.map((date) => {
      const match = itemTrends.find((t) => t.city === city && t.date === date);
      return match ? match.avgPrice : null;
    });
  });

  // Calculate chart boundaries
  const prices = itemTrends.map((t) => t.avgPrice);
  const minPrice = prices.length > 0 ? Math.max(0, Math.min(...prices) - 10) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) + 10 : 100;
  const priceRange = maxPrice - minPrice || 1;

  // Chart layout config
  const paddingX = 60;
  const paddingY = 40;
  const chartWidth = 700;
  const chartHeight = 300;

  // Map coordinates to SVG pixels
  const getCoords = (dateIdx, price) => {
    if (price === null) return null;
    const x = paddingX + (dateIdx / (dates.length - 1 || 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - ((price - minPrice) / priceRange) * (chartHeight - 2 * paddingY);
    return { x, y };
  };

  // SVG color palette for cities
  const cityColors = {
    Amritsar: { stroke: '#0ea5e9', fill: '#e0f2fe', bg: 'bg-sky-500' }, // sky blue
    Bathinda: { stroke: '#10b981', fill: '#d1fae5', bg: 'bg-emerald-500' }, // emerald green
    Ludhiana: { stroke: '#8b5cf6', fill: '#ede9fe', bg: 'bg-violet-500' }, // violet
  };

  const getColorsForCity = (city) => {
    return cityColors[city] || { stroke: '#64748b', fill: '#f1f5f9', bg: 'bg-slate-500' };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Market Price Trends 📈
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Compare historical crop and dairy product prices across Punjab cities.
          </p>
        </div>
      </div>

      {trends.length === 0 ? (
        <div className="mt-12 card text-center py-16">
          <span className="text-5xl">📊</span>
          <p className="mt-4 text-base font-bold text-slate-800 dark:text-white">No order history available</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trends will populate once orders are placed.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 card p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                Price Chart: <span className="text-primary-600 dark:text-primary-400 font-extrabold">{selectedItem}</span>
              </h2>

              {/* Crop Selector */}
              <div>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="input-field py-1.5 px-3 text-sm capitalize font-semibold cursor-pointer w-auto h-auto"
                >
                  {allItems.map((item) => (
                    <option key={item} value={item} className="capitalize">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City Legends */}
            <div className="flex flex-wrap gap-4 mb-4 text-xs font-bold text-slate-600 dark:text-slate-300">
              {cities.map((city) => {
                const colors = getColorsForCity(city);
                return (
                  <div key={city} className="flex items-center gap-1.5">
                    <span className={`h-3 w-3 rounded-full ${colors.bg}`} />
                    <span>{city}</span>
                  </div>
                );
              })}
            </div>

            {/* SVG Interactive Line Chart */}
            <div className="relative w-full aspect-[7/3] bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-inner p-2">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = minPrice + ratio * priceRange;
                  const coords = getCoords(0, yVal);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={coords.y}
                        x2={chartWidth - paddingX}
                        y2={coords.y}
                        stroke="currentColor"
                        className="stroke-slate-200 dark:stroke-slate-800/80"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 10}
                        y={coords.y + 4}
                        textAnchor="end"
                        className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500"
                      >
                        ₹{Math.round(yVal)}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {dates.map((date, idx) => {
                  const coords = getCoords(idx, minPrice);
                  const formattedDate = new Date(date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <text
                      key={date}
                      x={coords.x}
                      y={chartHeight - paddingY + 20}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500"
                    >
                      {formattedDate}
                    </text>
                  );
                })}

                {/* Draw Trend Lines */}
                {cities.map((city) => {
                  const colors = getColorsForCity(city);
                  const points = dates
                    .map((_, idx) => getCoords(idx, cityData[city][idx]))
                    .filter((p) => p !== null);

                  if (points.length === 0) return null;

                  // Build SVG path
                  const pathD = points.reduce(
                    (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
                    ''
                  );

                  return (
                    <g key={city}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />

                      {/* Data Dots & Hover Detection */}
                      {points.map((pt, idx) => {
                        const price = cityData[city][idx];
                        const date = dates[idx];
                        const isHovered =
                          hoveredPoint &&
                          hoveredPoint.city === city &&
                          hoveredPoint.date === date;

                        return (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 7.5 : 4.5}
                              fill={colors.stroke}
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all duration-150 cursor-pointer shadow-sm"
                              onMouseEnter={() => setHoveredPoint({ city, date, price, x: pt.x, y: pt.y })}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-slate-900/90 text-white rounded-lg p-2.5 text-xs shadow-xl backdrop-blur-xs border border-slate-700 transition-all duration-150"
                  style={{
                    left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                    top: `${(hoveredPoint.y / chartHeight) * 100 - 32}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                    {hoveredPoint.city}
                  </div>
                  <div className="flex justify-between gap-4 font-semibold text-slate-300">
                    <span>Date:</span>
                    <span className="text-white">
                      {new Date(hoveredPoint.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 font-bold text-slate-300 mt-0.5">
                    <span>Average Price:</span>
                    <span className="text-emerald-400">₹{hoveredPoint.price}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Metrics Comparative Table */}
          <div className="card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
              Market Summary
            </h3>
            <div className="space-y-4">
              {cities.map((city) => {
                const values = itemTrends
                  .filter((t) => t.city === city)
                  .map((t) => t.avgPrice);
                const currentPrice = values[values.length - 1] || 0;
                const previousPrice = values[values.length - 2] || currentPrice;
                const change =
                  previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

                const minVal = values.length > 0 ? Math.min(...values) : 0;
                const maxVal = values.length > 0 ? Math.max(...values) : 0;
                const colors = getColorsForCity(city);

                return (
                  <div
                    key={city}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${colors.bg}`} />
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{city}</span>
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">
                        ₹{currentPrice.toFixed(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <div>
                        Low: <span className="text-slate-800 dark:text-slate-200 font-medium">₹{minVal}</span>
                      </div>
                      <div className="text-right">
                        High: <span className="text-slate-800 dark:text-slate-200 font-medium">₹{maxVal}</span>
                      </div>
                      <div className="col-span-2 mt-1">
                        Trend:{' '}
                        {change > 0 ? (
                          <span className="text-rose-600">
                            ▲ +{change.toFixed(1)}% (increasing)
                          </span>
                        ) : change < 0 ? (
                          <span className="text-emerald-600">
                            ▼ {change.toFixed(1)}% (decreasing)
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            ▬ stable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
