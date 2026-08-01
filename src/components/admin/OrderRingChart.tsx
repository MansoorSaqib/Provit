"use client";
import { useEffect, useState } from "react";

type Segment = { label: string; count: number; color: string; sub: string };

const R = 78;
const CIRC = 2 * Math.PI * R;
const GAP = 4; // px gap between segments

function buildSegments(segs: Segment[], circ: number) {
  const total = segs.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  return segs.map((seg) => {
    const raw = total > 0 ? (seg.count / total) * circ : 0;
    const dash = Math.max(0, raw - GAP);
    const result = { ...seg, dash, offset: cumulative, total };
    cumulative += raw;
    return result;
  });
}

export default function OrderRingChart({
  total,
  completed,
  pending,
  cancelled,
}: {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const segments: Segment[] = [
    { label: "Completed", count: completed, color: "#22c55e", sub: "Delivered" },
    { label: "Pending", count: pending, color: "#EAB308", sub: "In progress" },
    { label: "Cancelled", count: cancelled, color: "#E8522A", sub: "Cancelled / Refunded" },
  ];

  const drawn = buildSegments(segments, CIRC);
  const isEmpty = total === 0;

  return (
    <div className="bg-brand-surface border border-brand-border p-6 mb-8">
      <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-6">
        Order Overview
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-14">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg
            width="200" height="200"
            viewBox="0 0 200 200"
            className={`transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            {/* Track */}
            <circle cx="100" cy="100" r={R} fill="none" stroke="#2A2A2A" strokeWidth="22" />

            {isEmpty ? (
              <circle cx="100" cy="100" r={R} fill="none" stroke="#2A2A2A" strokeWidth="22" />
            ) : (
              drawn.map((seg, i) =>
                seg.dash > 0 ? (
                  <circle
                    key={i}
                    cx="100" cy="100" r={R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="22"
                    strokeDasharray={`${seg.dash} ${CIRC}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="butt"
                    transform="rotate(-90 100 100)"
                    style={{
                      transition: mounted ? "stroke-dasharray 0.6s ease" : "none",
                    }}
                  />
                ) : null,
              )
            )}

            {/* Center text */}
            <text
              x="100" y="94"
              textAnchor="middle"
              fontFamily="'Bebas Neue', Impact, sans-serif"
              fontSize="42"
              fill="#FAFAFA"
            >
              {total}
            </text>
            <text
              x="100" y="114"
              textAnchor="middle"
              fontFamily="'Montserrat', Arial, sans-serif"
              fontSize="9"
              fill="#6B6B6B"
              letterSpacing="3"
            >
              TOTAL
            </text>
          </svg>
        </div>

        {/* Legend + stats */}
        <div className="flex flex-col sm:flex-row gap-6 flex-1 w-full">
          {/* Total Orders */}
          <div className="flex-1 border-l-2 border-brand-border pl-5">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-2">
              Total Orders
            </p>
            <p className="font-heading text-5xl text-brand-white leading-none mb-1">{total}</p>
            <p className="font-body text-[10px] text-brand-muted">All time</p>
          </div>

          {drawn.map((seg) => (
            <div key={seg.label} className="flex-1 border-l-2 pl-5" style={{ borderColor: seg.color + "55" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">
                  {seg.label}
                </p>
              </div>
              <p className="font-heading text-5xl leading-none mb-1" style={{ color: seg.color }}>
                {seg.count}
              </p>
              <p className="font-body text-[10px] text-brand-muted">{seg.sub}</p>
              {total > 0 && (
                <p className="font-body text-[10px] mt-1" style={{ color: seg.color + "99" }}>
                  {Math.round((seg.count / total) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
