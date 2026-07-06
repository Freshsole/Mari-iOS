import { getCardBackUrl, getCardImageForCard } from '../assets/cardImages';
import { Card } from '@shared/types';

interface PlayingCardProps {
  card: Card;
  width?: number;
  height?: number;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
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
  const src = faceDown ? getCardBackUrl() : getCardImageForCard(card);

  return (
    <div
      className={[
        'playing-card-frame',
        faceDown ? 'playing-card-frame--back' : 'playing-card-frame--face',
        selected ? 'playing-card-frame--selected' : '',
        disabled ? 'playing-card-frame--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height }}
    >
      <img
        src={src}
        alt={faceDown ? 'Rub karty' : `${card.rank}`}
        className="playing-card"
        draggable={false}
      />
    </div>
  );
}
