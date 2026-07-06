import { Suit, SUIT_LABELS_CS } from '@shared/index';
import { getSuitIconUrl } from '../assets/suitIcons';

interface TrumpIndicatorProps {
  suit: Suit;
}

export function TrumpIndicator({ suit }: TrumpIndicatorProps) {
  return (
    <div className="trump-indicator" title={`Trumf: ${SUIT_LABELS_CS[suit]}`}>
      <img
        src={getSuitIconUrl(suit)}
        alt={`Trumf ${SUIT_LABELS_CS[suit]}`}
        className="trump-indicator__icon"
        width={36}
        height={36}
        draggable={false}
      />
    </div>
  );
}
