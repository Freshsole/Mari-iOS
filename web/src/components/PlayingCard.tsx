import {
  Card,
  RANK_LABELS_CS,
  SUIT_COLORS,
  SUIT_LABELS_CS,
  SUIT_SYMBOLS,
} from '@shared/types';

interface PlayingCardProps {
  card: Card;
  width?: number;
  height?: number;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

function GermanSuitIcon({ suit, size }: { suit: Card['suit']; size: number }) {
  const color = SUIT_COLORS[suit];
  const cx = size / 2;
  const cy = size / 2;

  if (suit === 'hearts') {
    return (
      <path
        d={`M ${cx} ${cy + size * 0.25} C ${cx - size * 0.3} ${cy - size * 0.05}, ${cx - size * 0.15} ${cy - size * 0.35}, ${cx} ${cy - size * 0.15} C ${cx + size * 0.15} ${cy - size * 0.35}, ${cx + size * 0.3} ${cy - size * 0.05}, ${cx} ${cy + size * 0.25} Z`}
        fill={color}
      />
    );
  }

  if (suit === 'bells') {
    return (
      <>
        <path
          d={`M ${cx} ${cy - size * 0.2} L ${cx + size * 0.22} ${cy + size * 0.15} L ${cx - size * 0.22} ${cy + size * 0.15} Z`}
          fill={color}
        />
        <circle cx={cx} cy={cy + size * 0.28} r={size * 0.06} fill={color} />
      </>
    );
  }

  if (suit === 'acorns') {
    return (
      <>
        <ellipse cx={cx} cy={cy} rx={size * 0.16} ry={size * 0.2} fill={color} />
        <path
          d={`M ${cx} ${cy - size * 0.2} Q ${cx + size * 0.08} ${cy - size * 0.35} ${cx} ${cy - size * 0.42}`}
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
      </>
    );
  }

  return (
    <>
      <ellipse cx={cx - size * 0.08} cy={cy} rx={size * 0.12} ry={size * 0.18} fill={color} />
      <ellipse cx={cx + size * 0.08} cy={cy} rx={size * 0.12} ry={size * 0.18} fill={color} />
      <path d={`M ${cx} ${cy - size * 0.18} L ${cx} ${cy + size * 0.22}`} stroke={color} strokeWidth={2} />
    </>
  );
}

export function PlayingCard({
  card,
  width = 64,
  height = 96,
  faceDown = false,
  selected = false,
  disabled = false,
}: PlayingCardProps) {
  const border = selected ? '#FFD54F' : '#455A64';
  const opacity = disabled ? 0.45 : 1;

  if (faceDown) {
    return (
      <svg width={width} height={height} viewBox="0 0 64 96" style={{ opacity }}>
        <rect x={2} y={2} width={60} height={92} rx={6} fill="#1565C0" stroke={border} strokeWidth={3} />
        <rect x={8} y={8} width={48} height={80} rx={4} fill="#0D47A1" />
        <path d="M16 24 L48 72 M48 24 L16 72" stroke="#42A5F5" strokeWidth={2} />
      </svg>
    );
  }

  const color = SUIT_COLORS[card.suit];

  return (
    <svg width={width} height={height} viewBox="0 0 64 96" style={{ opacity }}>
      <rect x={2} y={2} width={60} height={92} rx={6} fill="#FFFDE7" stroke={border} strokeWidth={selected ? 4 : 2} />
      <text x={8} y={18} fontSize={14} fontWeight="bold" fill={color}>
        {card.rank}
      </text>
      <text x={8} y={32} fontSize={9} fill="#616161">
        {SUIT_LABELS_CS[card.suit]}
      </text>
      <text x={46} y={88} fontSize={14} fontWeight="bold" fill={color} transform="rotate(180 50 82)">
        {card.rank}
      </text>
      <g transform="translate(14, 28)">
        <GermanSuitIcon suit={card.suit} size={36} />
      </g>
      <text x={32} y={58} fontSize={18} textAnchor="middle" fill={color}>
        {SUIT_SYMBOLS[card.suit]}
      </text>
      <text x={32} y={78} fontSize={8} textAnchor="middle" fill="#757575">
        {RANK_LABELS_CS[card.rank]}
      </text>
    </svg>
  );
}
