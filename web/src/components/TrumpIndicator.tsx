import { Suit, SUIT_LABELS_CS } from '@shared/index';
import { getSuitIconUrl } from '../assets/suitIcons';

interface TrumpIndicatorProps {
  suit: Suit;
  size?: 'sm' | 'lg';
}

export function TrumpIndicator({ suit, size = 'sm' }: TrumpIndicatorProps) {
  const iconSize = size === 'lg' ? 44 : 34;

  return (
    <div
      className={`trump-indicator${size === 'lg' ? ' trump-indicator--lg' : ''}`}
      title={`Trumf: ${SUIT_LABELS_CS[suit]}`}
      aria-label={`Trumf: ${SUIT_LABELS_CS[suit]}`}
    >
      <img
        src={getSuitIconUrl(suit)}
        alt=""
        className="trump-indicator__icon"
        width={iconSize}
        height={iconSize}
        draggable={false}
      />
    </div>
  );
}
