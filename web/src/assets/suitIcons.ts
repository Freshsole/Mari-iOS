import { Suit } from '@shared/types';
import acornsIcon from './suits/acorns.png';
import bellsIcon from './suits/bells.png';
import heartsIcon from './suits/hearts.png';
import leavesIcon from './suits/leaves.png';

const SUIT_ICONS: Record<Suit, string> = {
  acorns: acornsIcon,
  hearts: heartsIcon,
  leaves: leavesIcon,
  bells: bellsIcon,
};

export function getSuitIconUrl(suit: Suit): string {
  return SUIT_ICONS[suit];
}
