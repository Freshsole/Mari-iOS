import { Suit, SUIT_LABELS_CS } from '@shared/index';
import { getSuitIconUrl } from '../assets/suitIcons';

interface TrumpIndicatorProps {
  suit: Suit;
  size?: 'sm' | 'lg';
}

export function TrumpIndicator({ suit, size = 'sm' }: TrumpIndicatorProps) {
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
        draggable={false}
      />
    </div>
  );
}
