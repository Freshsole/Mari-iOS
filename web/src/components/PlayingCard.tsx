import { getCardBackUrl, getCardSpriteStyle } from '../assets/cardSprites';
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
  const classNames = [
    'playing-card',
    faceDown ? 'playing-card--back' : 'playing-card--face',
    selected ? 'playing-card--selected' : '',
    disabled ? 'playing-card--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (faceDown) {
    return (
      <img
        src={getCardBackUrl()}
        alt="Rub karty"
        width={width}
        height={height}
        draggable={false}
        className={classNames}
      />
    );
  }

  const sprite = getCardSpriteStyle(card.suit, card.rank);

  return (
    <span
      role="img"
      aria-label={`${card.rank} ${card.suit}`}
      className={classNames}
      style={{
        width,
        height,
        backgroundImage: sprite.backgroundImage,
        backgroundSize: sprite.backgroundSize,
        backgroundPosition: sprite.backgroundPosition,
      }}
    />
  );
}
