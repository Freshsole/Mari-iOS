import { Card, Rank, SUIT_COLORS, SUIT_SYMBOLS, Suit } from '@shared/types';

interface PlayingCardProps {
  card: Card;
  width?: number;
  height?: number;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

const RANK_DISPLAY: Record<Rank, string> = {
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
};

function SuitGlyph({ suit, size = 24 }: { suit: Suit; size?: number }) {
  const c = SUIT_COLORS[suit];
  const s = size;
  if (suit === 'hearts') {
    return (
      <path
        d={`M${s / 2} ${s * 0.78} C${s * 0.12} ${s * 0.42}, ${s * 0.22} ${s * 0.08}, ${s / 2} ${s * 0.28} C${s * 0.78} ${s * 0.08}, ${s * 0.88} ${s * 0.42}, ${s / 2} ${s * 0.78}Z`}
        fill={c}
      />
    );
  }
  if (suit === 'bells') {
    return (
      <g fill={c}>
        <path d={`M${s / 2} ${s * 0.18} L${s * 0.78} ${s * 0.58} H${s * 0.22} Z`} />
        <circle cx={s / 2} cy={s * 0.72} r={s * 0.08} />
      </g>
    );
  }
  if (suit === 'acorns') {
    return (
      <g fill={c}>
        <ellipse cx={s / 2} cy={s * 0.55} rx={s * 0.16} ry={s * 0.22} />
        <path d={`M${s / 2} ${s * 0.18} q${s * 0.08} -${s * 0.12} 0 -${s * 0.16}`} fill="none" stroke={c} strokeWidth={1.8} />
      </g>
    );
  }
  return (
    <g fill={c}>
      <ellipse cx={s * 0.42} cy={s * 0.52} rx={s * 0.12} ry={s * 0.18} />
      <ellipse cx={s * 0.58} cy={s * 0.52} rx={s * 0.12} ry={s * 0.18} />
      <rect x={s * 0.47} y={s * 0.22} width={s * 0.06} height={s * 0.48} rx={2} />
    </g>
  );
}

function PipLayout({ suit, rank }: { suit: Suit; rank: Rank }) {
  const color = SUIT_COLORS[suit];
  const sym = SUIT_SYMBOLS[suit];
  const n = rank === '10' ? 10 : parseInt(rank, 10);
  if (!Number.isNaN(n)) {
    const rows = n <= 3 ? 1 : n <= 6 ? 2 : 3;
    const cols = n <= 3 ? n : n <= 6 ? 3 : 4;
    const pips = Array.from({ length: Math.min(n, 10) }, (_, i) => i);
    return (
      <g>
        {pips.map((i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = 42 + col * 18;
          const y = 78 + row * 22;
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fontSize="15" fill={color}>
              {sym}
            </text>
          );
        })}
      </g>
    );
  }

  const label =
    rank === 'K' ? 'KRÁL' : rank === 'Q' ? 'SVRŠEK' : rank === 'J' ? 'SPODEK' : rank;
  return (
    <g>
      <rect x="28" y="62" width="44" height="58" rx="8" fill={`${color}18`} stroke={`${color}55`} strokeWidth="1.5" />
      <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>
        {label}
      </text>
      <g transform="translate(38, 92)">
        <SuitGlyph suit={suit} size={24} />
      </g>
    </g>
  );
}

function CardFace({ card }: { card: Card }) {
  const color = SUIT_COLORS[card.suit];
  const rank = RANK_DISPLAY[card.rank];
  return (
    <>
      <defs>
        <linearGradient id={`face-${card.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f4f6fb" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="136" rx="10" fill={`url(#face-${card.id})`} stroke="#dfe3ec" strokeWidth="1" />
      <text x="12" y="22" fontSize="16" fontWeight="800" fill={color}>
        {rank}
      </text>
      <g transform="translate(8, 24)">
        <SuitGlyph suit={card.suit} size={14} />
      </g>
      <text x="88" y="128" fontSize="16" fontWeight="800" fill={color} textAnchor="end" transform="rotate(180 50 70)">
        {rank}
      </text>
      <PipLayout suit={card.suit} rank={card.rank} />
    </>
  );
}

function CardBack() {
  return (
    <>
      <defs>
        <linearGradient id="card-back-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2744" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <pattern id="card-back-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1.5" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="96" height="136" rx="10" fill="url(#card-back-grad)" stroke="#334155" strokeWidth="1" />
      <rect x="8" y="8" width="84" height="124" rx="8" fill="url(#card-back-pattern)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <path d="M20 30 L80 110 M80 30 L20 110" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" />
      <circle cx="50" cy="70" r="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    </>
  );
}

export function PlayingCard({
  card,
  width = 64,
  height = 90,
  faceDown = false,
  selected = false,
  disabled = false,
  className = '',
}: PlayingCardProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 140"
      className={[
        'playing-card',
        selected ? 'playing-card--selected' : '',
        disabled ? 'playing-card--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={faceDown}
    >
      {faceDown ? <CardBack /> : <CardFace card={card} />}
    </svg>
  );
}
