import React from 'react';
import { Menu, MenuItem, ListItemText } from '@material-ui/core';
import { PLAY_MOVE, Move } from '../game-engine';

type ContextMenuProps = {
  anchorEl: Element;
  moves: Array<PLAY_MOVE>;
  onClose?: () => void;
  onMoveSelected: (move: Move) => void;
};

export default function ContextMenu(props: ContextMenuProps) {
  const { onClose, moves, anchorEl, onMoveSelected } = props;

  return (
    <Menu id="customized-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={onClose}>
      {moves.map((move, i) => {
        const text = move.dest === 'FIELD' ? 'Play to your field' : 'Play to the market';
        return (
          <MenuItem key={'menu-item-' + i}>
            <ListItemText primary={text} onClick={() => onMoveSelected(move)} />
          </MenuItem>
        );
      })}
    </Menu>
  );
}
