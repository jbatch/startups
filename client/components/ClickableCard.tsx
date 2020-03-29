import React from 'react';
import { PLAY_MOVE, Move, Card } from '../game-engine';
import PlayingCard from '../components/PlayingCard';
import ContextMenu from '../components/ContextMenu';

type ClickableCardProps = {
  card: Card;
  moves: Array<PLAY_MOVE>;
  onMoveSelected: (move: Move) => void | null;
};

export function ClickableCard(props: ClickableCardProps) {
  const { card, moves, onMoveSelected } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!!onMoveSelected) {
      setAnchorEl(event.currentTarget);
    }
  };
  return (
    <div>
      <PlayingCard
        name={card.company.name}
        color={card.company.color}
        number={card.company.number}
        coins={0}
        height={150}
        onClick={handleClick}
      />
      <ContextMenu
        anchorEl={anchorEl}
        moves={moves}
        onClose={() => setAnchorEl(null)}
        onMoveSelected={onMoveSelected}
      />
    </div>
  );
}
