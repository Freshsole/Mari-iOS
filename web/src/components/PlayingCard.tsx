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
    <img
      src={src}
      alt={faceDown ? 'Rub karty' : `${card.rank}`}
      width={width}
      height={height}
      draggable={false}
      className={[
        'playing-card',
        selected ? 'playing-card--selected' : '',
        disabled ? 'playing-card--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
