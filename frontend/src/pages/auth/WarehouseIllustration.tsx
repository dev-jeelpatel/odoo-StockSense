// Isometric warehouse-crate scene. Coordinates are computed via a true isometric
// projection (not hand-eyeballed), see scratchpad/gen-iso2.js for the generator.

function Box({
  top,
  right,
  left,
  seamDiag,
  seamFront,
}: {
  top: string;
  right: string;
  left: string;
  seamDiag: string;
  seamFront: string;
}) {
  return (
    <g>
      <path d={left} fill="url(#faceLeft)" />
      <path d={right} fill="url(#faceRight)" />
      <path d={top} fill="url(#faceTop)" />
      <path d={seamDiag} stroke="#7c4a24" strokeOpacity={0.35} strokeWidth={1.5} />
      <path d={seamFront} stroke="#7c4a24" strokeOpacity={0.35} strokeWidth={1.5} />
    </g>
  );
}

function ShippingLabel({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-13} y={-9} width={26} height={18} rx={2} fill="#fdf8f0" fillOpacity={0.95} />
      <rect x={-9} y={-4.5} width={18} height={2} rx={1} fill="#c98a4b" />
      <rect x={-9} y={0} width={12} height={2} rx={1} fill="#d9a86b" />
      <rect x={-9} y={4.5} width={15} height={2} rx={1} fill="#d9a86b" />
    </g>
  );
}

export function WarehouseIllustration() {
  return (
    <svg viewBox="0 0 420 330" className="w-full max-w-md" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="faceTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf1e2" />
          <stop offset="1" stopColor="#f0dcc0" />
        </linearGradient>
        <linearGradient id="faceRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3bd8d" />
          <stop offset="1" stopColor="#d3a874" />
        </linearGradient>
        <linearGradient id="faceLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c39764" />
          <stop offset="1" stopColor="#a97e50" />
        </linearGradient>

        <linearGradient id="woodTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b98a56" />
          <stop offset="1" stopColor="#a2703d" />
        </linearGradient>
        <linearGradient id="woodRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c6239" />
          <stop offset="1" stopColor="#7a5230" />
        </linearGradient>
        <linearGradient id="woodLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4a2b" />
          <stop offset="1" stopColor="#5c3e24" />
        </linearGradient>

        <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>

        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
        <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7c2d12" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ambient glow behind the stack */}
      <ellipse cx="210" cy="165" rx="200" ry="170" fill="url(#glow)" />

      {/* ground shadow */}
      <ellipse cx="210" cy="292" rx="150" ry="18" fill="#5c2e0e" opacity="0.3" filter="url(#softShadow)" />

      {/* wooden pallet */}
      <g>
        <path
          d="M210,134.6 L337.5,208.2 L210,281.8 L82.5,208.2 Z"
          fill="url(#woodTop)"
        />
        <path d="M337.5,208.2 L210,281.8 L210,288.2 L337.5,214.6 Z" fill="url(#woodRight)" />
        <path d="M210,134.6 L82.5,208.2 L82.5,214.6 L210,141 Z" fill="url(#woodLeft)" />
        {/* plank lines */}
        <path d="M124,164 L296,164" stroke="#5c3e24" strokeOpacity={0.3} strokeWidth={1.2} />
        <path d="M124,252 L296,252" stroke="#5c3e24" strokeOpacity={0.3} strokeWidth={1.2} />
      </g>

      {/* back box */}
      <g filter="url(#cardShadow)">
        <Box
          top="M141.1,168.4 L174.9,187.9 L141.1,207.5 L107.2,187.9 Z"
          right="M174.9,187.9 L141.1,207.5 L141.1,238.8 L174.9,219.2 Z"
          left="M141.1,168.4 L107.2,187.9 L107.2,219.2 L141.1,199.7 Z"
          seamDiag="M141.1,168.4 L141.1,207.5"
          seamFront="M141.1,207.5 L141.1,238.8"
        />
      </g>

      {/* side box + stacked small box */}
      <g filter="url(#cardShadow)">
        <Box
          top="M277.7,159.9 L315.6,181.7 L277.7,203.6 L239.9,181.7 Z"
          right="M315.6,181.7 L277.7,203.6 L277.7,242.7 L315.6,220.8 Z"
          left="M277.7,159.9 L239.9,181.7 L239.9,220.8 L277.7,199 Z"
          seamDiag="M277.7,159.9 L277.7,203.6"
          seamFront="M277.7,203.6 L277.7,242.7"
        />
        <ShippingLabel x={296.7} y={212.3} rotate={30} />
      </g>
      <g filter="url(#cardShadow)">
        <Box
          top="M276.1,139.6 L303.2,155.3 L276.1,170.9 L249,155.3 Z"
          right="M303.2,155.3 L276.1,170.9 L276.1,197.6 L303.2,181.9 Z"
          left="M276.1,139.6 L249,155.3 L249,181.9 L276.1,166.3 Z"
          seamDiag="M276.1,139.6 L276.1,170.9"
          seamFront="M276.1,170.9 L276.1,197.6"
        />
      </g>

      {/* main hero box */}
      <g filter="url(#cardShadow)">
        <Box
          top="M210,95.5 L271.7,131.1 L210,166.8 L148.3,131.1 Z"
          right="M271.7,131.1 L210,166.8 L210,228.9 L271.7,193.2 Z"
          left="M210,95.5 L148.3,131.1 L148.3,193.2 L210,157.6 Z"
          seamDiag="M210,95.5 L210,166.8"
          seamFront="M210,166.8 L210,228.9"
        />
        <ShippingLabel x={240.9} y={180} rotate={30} />
      </g>

      {/* floating "in stock" badge */}
      <g transform="translate(276 88)" filter="url(#cardShadow)">
        <rect x={-46} y={-16} width={92} height={32} rx={16} fill="white" />
        <circle cx={-22} cy={0} r={9} fill="#16a34a" />
        <path d="M-26,0.5 L-23,4 L-17,-4" stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={0} y={4.5} fontSize="11" fontWeight="600" fill="#292524" textAnchor="middle" fontFamily="system-ui, sans-serif">
          In Stock
        </text>
      </g>

      {/* floating barcode chip */}
      <g transform="translate(112 140) rotate(-8)" filter="url(#cardShadow)">
        <rect x={-22} y={-14} width={44} height={28} rx={5} fill="white" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={-16 + i * 5}
            y={-7}
            width={i % 2 === 0 ? 2.2 : 1.2}
            height={14}
            fill="#57534e"
          />
        ))}
      </g>
    </svg>
  );
}
