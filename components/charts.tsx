'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ---- Shared tooltip styles ----
const tooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '10px 14px',
    fontSize: '12px',
  },
  labelStyle: { fontWeight: 600, color: '#1e293b', marginBottom: 4 },
  itemStyle: { color: '#475569', padding: '2px 0' },
}

// ============================================================
// CHART CARD – consistent wrapper for all charts
// ============================================================
export function ChartCard({ title, subtitle, children, className = '' }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ============================================================
// AREA CHART – for trends over time
// ============================================================
export function TrendAreaChart({ data, xKey, areas, height = 240 }: {
  data: Record<string, unknown>[]; xKey: string
  areas: { key: string; color: string; name?: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          {areas.map(a => (
            <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={a.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={a.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        {areas.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
        {areas.map(a => (
          <Area key={a.key} type="monotone" dataKey={a.key} name={a.name || a.key}
            stroke={a.color} strokeWidth={2} fill={`url(#grad-${a.key})`}
            dot={{ r: 3, fill: a.color, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// BAR CHART – for comparisons
// ============================================================
export function ComparisonBarChart({ data, xKey, bars, height = 240, layout = 'vertical' as 'vertical' | 'horizontal' }: {
  data: Record<string, unknown>[]; xKey: string
  bars: { key: string; color: string; name?: string; radius?: number }[]
  height?: number; layout?: 'vertical' | 'horizontal'
}) {
  const isHorizontal = layout === 'horizontal'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: isHorizontal ? 10 : -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip {...tooltipStyle} />
        {bars.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name || b.key}
            fill={b.color} radius={b.radius ?? 4} barSize={bars.length > 1 ? 14 : 24} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// LINE CHART – for target vs actual
// ============================================================
export function MultiLineChart({ data, xKey, lines, height = 240 }: {
  data: Record<string, unknown>[]; xKey: string
  lines: { key: string; color: string; name?: string; dashed?: boolean }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {lines.map(l => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name || l.key}
            stroke={l.color} strokeWidth={2}
            strokeDasharray={l.dashed ? '6 3' : undefined}
            dot={{ r: 3, fill: l.color, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// DONUT / PIE CHART
// ============================================================
export function DonutChart({ data, height = 260, innerRadius = 50, outerRadius = 70, showLabel = true }: {
  data: { name: string; value: number; color: string }[]
  height?: number; innerRadius?: number; outerRadius?: number; showLabel?: boolean
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const RADIAN = Math.PI / 180
  const renderLabel = showLabel
    ? ({ cx, cy, midAngle, outerRadius: or, name, percent, fill }: {
        cx: number; cy: number; midAngle: number; outerRadius: number
        name: string; percent: number; fill: string
      }) => {
        const radius = or + 18
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)
        const pct = (percent * 100).toFixed(0)
        return (
          <text x={x} y={y} fill={fill} fontSize={12} fontWeight={600}
            textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${name} ${pct}%`}
          </text>
        )
      }
    : false
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
        <Pie data={data} cx="50%" cy="50%"
          innerRadius={innerRadius} outerRadius={outerRadius}
          paddingAngle={3} dataKey="value"
          label={renderLabel}
          labelLine={showLabel ? { stroke: '#94a3b8', strokeWidth: 1 } : false}>
          {data.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, '']} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// RADAR CHART
// ============================================================
export function RadarChartComponent({ data, dataKey, nameKey, height = 240, color = '#3b82f6' }: {
  data: Record<string, unknown>[]; dataKey: string; nameKey: string
  height?: number; color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey={nameKey} tick={{ fontSize: 11, fill: '#64748b' }} />
        <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
        <Radar dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// STACKED BAR CHART
// ============================================================
export function StackedBarChart({ data, xKey, bars, height = 240 }: {
  data: Record<string, unknown>[]; xKey: string
  bars: { key: string; color: string; name?: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name || b.key}
            stackId="stack" fill={b.color} radius={0} barSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// COMPOSED CHART – mix of bar + line
// ============================================================
export function ComposedBarLineChart({ data, xKey, bars, lines, height = 240 }: {
  data: Record<string, unknown>[]; xKey: string
  bars: { key: string; color: string; name?: string }[]
  lines: { key: string; color: string; name?: string; dashed?: boolean }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name || b.key}
            fill={b.color} radius={4} barSize={24} />
        ))}
        {lines.map(l => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name || l.key}
            stroke={l.color} strokeWidth={2}
            strokeDasharray={l.dashed ? '6 3' : undefined}
            dot={{ r: 3, fill: l.color, strokeWidth: 0 }} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// SCATTER CHART – for performance plotting
// ============================================================
export function PerformanceScatter({ data, xKey, yKey, height = 240, color = '#6366f1' }: {
  data: Record<string, unknown>[]; xKey: string; yKey: string
  height?: number; color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} name={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis dataKey={yKey} name={yKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '3 3' }}
          formatter={(value: number, name: string) => [value, name]}
          labelFormatter={() => ''} />
        <Scatter data={data} fill={color} fillOpacity={0.7} r={7}>
          {data.map((_d, i) => <Cell key={i} fill={color} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// INSIGHT CARD – for KPI insights
// ============================================================
export function InsightCard({ icon: Icon, label, value, description, color }: {
  icon: React.ElementType; label: string; value: string | number
  description: string; color: string
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50/80 border border-slate-100">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900 leading-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ============================================================
// MINI SPARKLINE
// ============================================================
export function Sparkline({ data, dataKey, color = '#3b82f6', height = 40 }: {
  data: Record<string, unknown>[]; dataKey: string; color?: string; height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
          fill={`url(#spark-${dataKey})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
