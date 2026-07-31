import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Knowledge Graph — a static, server-rendered SVG that suggests an "AI ecosystem
 * map". Deterministic coordinates; no JS, no canvas, no third-party libs.
 *
 * Visual rules:
 *  - three fuzzy clusters (writing / code / image)
 *  - nodes cross-link within a cluster more than between clusters
 *  - color + size capped via `currentColor` so the parent container decides
 *    the accent tone (default `text-accent/40`)
 *
 * Accessibility:
 *  - `aria-hidden` on the wrapper
 *  - decorative only; hero copy is in a parallel DOM that screen readers see
 */

type Node = { id: number; x: number; y: number; r: number; cluster: number };
type Edge = { from: number; to: number };

// Cluster centers (in viewBox 1400x640)
const CLUSTERS = [
  { cx: 320, cy: 240, spread: 130 }, // writing / content
  { cx: 700, cy: 320, spread: 180 }, // code / dev (central)
  { cx: 1080, cy: 240, spread: 130 }, // image / design
];

// Deterministic pseudo-random helper (small mulberry32)
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(): { nodes: Node[]; edges: Edge[] } {
  const r = rng(1729);
  const nodes: Node[] = [];
  let id = 0;
  // 3 clusters × ~12 nodes each
  CLUSTERS.forEach((cluster, ci) => {
    for (let i = 0; i < 12; i++) {
      const angle = r() * Math.PI * 2;
      const radius = cluster.spread * (0.3 + r() * 0.7);
      const x = cluster.cx + Math.cos(angle) * radius;
      const y = cluster.cy + Math.sin(angle) * radius * 0.7; // squash vertical a bit
      const radius2 = 1.8 + r() * 4.2;
      nodes.push({ id: id++, x, y, r: radius2, cluster: ci });
    }
  });

  // Edges: each node connects to k nearest neighbours (within radius) — but only
  // within its own cluster. Long-haul "bridge" edges are intentionally omitted so
  // the graph reads as 3 clean subnetworks instead of one noisy cross-connected mesh.
  const edges: Edge[] = [];
  const K = 2;
  const maxDist = 220;
  nodes.forEach((a, i) => {
    const dists = nodes
      .map((b, j) => ({
        j,
        d: i === j ? Infinity : Math.hypot(a.x - b.x, a.y - b.y),
      }))
      .filter((d) => d.d <= maxDist && nodes[d.j]!.cluster === a.cluster)
      .sort((u, v) => u.d - v.d)
      .slice(0, K);
    dists.forEach(({ j }) => {
      const exists = edges.some(
        (e) => (e.from === i && e.to === j) || (e.from === j && e.to === i),
      );
      if (!exists) edges.push({ from: i, to: j });
    });
  });

  return { nodes, edges };
}

const { nodes, edges } = generate();

export function KnowledgeGraph({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden text-accent",
        "[mask-image:radial-gradient(ellipse_120%_60%_at_50%_0%,black_0%,black_55%,transparent_92%)]",
        className,
      )}
    >
      <style>{`
        @keyframes kg-node-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.55); }
        }
        @keyframes kg-heartbeat {
          0%, 18%, 100% { transform: scale(1); }
          4%            { transform: scale(2.2); }
          10%           { transform: scale(1.15); }
        }
        @keyframes kg-edge-dash {
          to { stroke-dashoffset: -32; }
        }
        @keyframes kg-spark-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.55; }
          50%      { transform: scale(1.9); opacity: 1;    }
        }
        .kg-node {
          transform-box: fill-box;
          transform-origin: center;
          animation: kg-node-pulse 4.8s ease-in-out infinite;
          animation-fill-mode: backwards;
          will-change: transform;
        }
        .kg-node-central {
          transform-box: fill-box;
          transform-origin: center;
          animation: kg-heartbeat 5.2s ease-out infinite;
          animation-fill-mode: backwards;
          will-change: transform;
        }
        .kg-edge-base {
          stroke-opacity: 0.15;
        }
        .kg-edge-flow {
          stroke-dasharray: 2 30;
          stroke-opacity: 0.9;
          animation: kg-edge-dash 3.5s linear infinite;
          animation-fill-mode: backwards;
        }
        .kg-spark {
          transform-box: fill-box;
          transform-origin: center;
          animation: kg-spark-pulse 3.2s ease-in-out infinite;
          animation-fill-mode: backwards;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .kg-node, .kg-node-central, .kg-edge-base, .kg-edge-flow, .kg-spark {
            animation: none;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 1400 640"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {/* Edges first so nodes overlap them */}
        <g
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        >
          {edges.map((e, i) => {
            const a = nodes[e.from]!;
            const b = nodes[e.to]!;
            return (
              <Fragment key={i}>
                <line
                  className="kg-edge-base"
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                />
                <line
                  className="kg-edge-flow"
                  style={{ animationDelay: `${(i * 0.13) % 5}s` }}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                />
              </Fragment>
            );
          })}
        </g>

        {/* Nodes */}
        <g fill="currentColor">
          {nodes.map((n) => {
            const isCentral = n.cluster === 1;
            const center = CLUSTERS[1]!;
            const dist = Math.hypot(n.x - center.cx, n.y - center.cy);
            const style = isCentral
              ? { animationDelay: `${(dist / center.spread) * 1.6}s` }
              : { animationDelay: `${(n.id * 0.21) % 4.8}s` };
            return (
              <circle
                key={n.id}
                className={isCentral ? "kg-node-central" : "kg-node"}
                style={style}
                cx={n.x}
                cy={n.y}
                r={n.r}
                opacity={0.5 + (n.r - 1.8) / 12}
              />
            );
          })}
        </g>

        {/* A handful of bright accent sparks — only ~6, on top */}
        <g fill="currentColor">
          {[6, 17, 28, 35].map((id, i) => {
            const n = nodes[id];
            if (!n) return null;
            return (
              <circle
                key={`hot-${n.id}`}
                className="kg-spark"
                style={{ animationDelay: `${i * 0.8}s` }}
                cx={n.x}
                cy={n.y}
                r={Math.max(n.r, 2.4)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
