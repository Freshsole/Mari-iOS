import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { Card, Rank, Suit } from '../../../shared/src';

const cardImages: Record<string, ImageSourcePropType> = {
  'hearts-7': require('../../assets/cards/hearts-7.png'),
  'hearts-8': require('../../assets/cards/hearts-8.png'),
  'hearts-9': require('../../assets/cards/hearts-9.png'),
  'hearts-10': require('../../assets/cards/hearts-10.png'),
  'hearts-J': require('../../assets/cards/hearts-J.png'),
  'hearts-Q': require('../../assets/cards/hearts-Q.png'),
  'hearts-K': require('../../assets/cards/hearts-K.png'),
  'hearts-A': require('../../assets/cards/hearts-A.png'),
  'leaves-7': require('../../assets/cards/leaves-7.png'),
  'leaves-8': require('../../assets/cards/leaves-8.png'),
  'leaves-9': require('../../assets/cards/leaves-9.png'),
  'leaves-10': require('../../assets/cards/leaves-10.png'),
  'leaves-J': require('../../assets/cards/leaves-J.png'),
  'leaves-Q': require('../../assets/cards/leaves-Q.png'),
  'leaves-K': require('../../assets/cards/leaves-K.png'),
  'leaves-A': require('../../assets/cards/leaves-A.png'),
  'acorns-7': require('../../assets/cards/acorns-7.png'),
  'acorns-8': require('../../assets/cards/acorns-8.png'),
  'acorns-9': require('../../assets/cards/acorns-9.png'),
  'acorns-10': require('../../assets/cards/acorns-10.png'),
  'acorns-J': require('../../assets/cards/acorns-J.png'),
  'acorns-Q': require('../../assets/cards/acorns-Q.png'),
  'acorns-K': require('../../assets/cards/acorns-K.png'),
  'acorns-A': require('../../assets/cards/acorns-A.png'),
  'bells-7': require('../../assets/cards/bells-7.png'),
  'bells-8': require('../../assets/cards/bells-8.png'),
  'bells-9': require('../../assets/cards/bells-9.png'),
  'bells-10': require('../../assets/cards/bells-10.png'),
  'bells-J': require('../../assets/cards/bells-J.png'),
  'bells-Q': require('../../assets/cards/bells-Q.png'),
  'bells-K': require('../../assets/cards/bells-K.png'),
  'bells-A': require('../../assets/cards/bells-A.png'),
  back: require('../../assets/cards/back.png'),
};

function getCardKey(suit: Suit, rank: Rank): string {
  return `${suit}-${rank}`;
}

interface PlayingCardProps {
  card: Card;
  width?: number;
  height?: number;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export function PlayingCard({
  card,
  width = 64,
  height = 96,
  faceDown = false,
  selected = false,
  disabled = false,
}: PlayingCardProps) {
  const source = faceDown ? cardImages.back : cardImages[getCardKey(card.suit, card.rank)];

  return (
    <View
      style={[
        styles.wrapper,
        selected && styles.selected,
        disabled && styles.disabled,
        { width, height },
      ]}
    >
      <Image source={source} style={{ width, height, borderRadius: 8 }} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#FFD54F',
    transform: [{ translateY: -8 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

export function CardBack({ width = 64, height = 96 }: { width?: number; height?: number }) {
  return (
    <PlayingCard card={{ id: 'back', suit: 'hearts', rank: '7' }} width={width} height={height} faceDown />
  );
}
