/**
 * Small dependency-free SVG charts (server components, zero client JS).
 * Single brand hue, light gridlines, direct labels — readable on a phone.
 */

function fmt(v, unit) {
    if (v == null) return "—";
    if (unit === "৳") return v >= 100000 ? `৳${(v / 100000).toFixed(1)}L` : v >= 1000 ? `৳${Math.round(v / 1000)}k` : `৳${v}`;
    if (unit === "%") return `${v}%`;
    return String(v);
}

/** Vertical bars. @param {{ data: {label: string, value: number}[], unit?: string, height?: number, highlightLast?: boolean, ariaLabel: string }} props */
export function BarChart({ data, unit, height = 260, width = 420, highlightLast = true, ariaLabel }) {
    const W = width,
        H = height,
        padB = 28,
        padT = 22;
    const max = Math.max(...data.map((d) => d.value), 1);
    const step = W / data.length;
    const bw = Math.min(46, step * 0.62);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
            {[0.25, 0.5, 0.75, 1].map((t) => (
                <line key={t} x1="0" x2={W} y1={padT + (H - padB - padT) * (1 - t)} y2={padT + (H - padB - padT) * (1 - t)} stroke="currentColor" className="text-ink/[0.07]" />
            ))}
            {data.map((d, i) => {
                const h = ((H - padB - padT) * d.value) / max;
                const x = i * step + (step - bw) / 2;
                const y = H - padB - h;
                const last = highlightLast && i === data.length - 1;
                return (
                    <g key={d.label}>
                        <rect x={x} y={y} width={bw} height={Math.max(h, 1)} rx="6" className={last ? "fill-brand" : "fill-brand/30"} />
                        <text x={x + bw / 2} y={y - 6} textAnchor="middle" className={`text-[11px] ${last ? "fill-ink font-semibold" : "fill-ink/60"}`}>
                            {fmt(d.value, unit)}
                        </text>
                        <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fill-ink/60 text-[11.5px]">
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/** Line with soft area. @param {{ data: {label: string, value: number|null}[], unit?: string, min?: number, max?: number, height?: number, ariaLabel: string }} props */
export function LineChart({ data, unit, min = 0, max = 100, height = 240, width = 640, ariaLabel }) {
    const W = width,
        H = height,
        padB = 26,
        padT = 16,
        padX = 14;
    const pts = data
        .map((d, i) => (d.value == null ? null : [padX + (i * (W - padX * 2)) / Math.max(1, data.length - 1), padT + (H - padB - padT) * (1 - (d.value - min) / (max - min))]))
        .filter(Boolean);
    const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const area = pts.length ? `${path} L${pts.at(-1)[0]},${H - padB} L${pts[0][0]},${H - padB} Z` : "";
    const lastPt = pts.at(-1);
    const lastVal = [...data].reverse().find((d) => d.value != null)?.value;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
            {[min, (min + max) / 2, max].map((v) => {
                const y = padT + (H - padB - padT) * (1 - (v - min) / (max - min));
                return (
                    <g key={v}>
                        <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="currentColor" className="text-ink/[0.07]" />
                        <text x={W - padX} y={y - 4} textAnchor="end" className="fill-ink/45 text-[10.5px]">
                            {fmt(v, unit)}
                        </text>
                    </g>
                );
            })}
            <path d={area} className="fill-brand/10" />
            <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="text-brand" />
            {lastPt && (
                <>
                    <circle cx={lastPt[0]} cy={lastPt[1]} r="5" className="fill-white stroke-brand" strokeWidth="2.5" />
                    <text x={lastPt[0] - 8} y={lastPt[1] - 10} textAnchor="end" className="fill-ink text-[12px] font-semibold">
                        {fmt(lastVal, unit)}
                    </text>
                </>
            )}
            {data.map((d, i) =>
                i % Math.ceil(data.length / 7) === 0 || i === data.length - 1 ? (
                    <text key={d.label + i} x={padX + (i * (W - padX * 2)) / Math.max(1, data.length - 1)} y={H - 6} textAnchor="middle" className="fill-ink/55 text-[11px]">
                        {d.label}
                    </text>
                ) : null,
            )}
        </svg>
    );
}

/** Horizontal share bars (e.g. payment methods). */
export function ShareBars({ data, unit }) {
    const total = data.reduce((a, d) => a + d.value, 0) || 1;
    const colors = ["bg-brand", "bg-coral", "bg-sky", "bg-sun"];
    return (
        <div>
            <div className="flex h-3 overflow-hidden rounded-full bg-ink/[0.06]">
                {data.map((d, i) => (
                    <div key={d.label} className={colors[i % colors.length]} style={{ width: `${(d.value / total) * 100}%` }} />
                ))}
            </div>
            <ul className="mt-4 space-y-2.5">
                {data.map((d, i) => (
                    <li key={d.label} className="flex items-center gap-2.5 text-[14px]">
                        <span className={`size-2.5 rounded-full ${colors[i % colors.length]}`} aria-hidden="true" />
                        <span className="text-ink">{d.label}</span>
                        <span className="ml-auto font-medium text-ink tabular-nums">{fmt(d.value, unit)}</span>
                        <span className="w-10 text-right text-ink-soft tabular-nums">{Math.round((d.value / total) * 100)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
