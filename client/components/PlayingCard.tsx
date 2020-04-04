import React, { useState, useRef } from 'react';
import { Card, Box, Typography, Grid, Popover } from '@material-ui/core';

type PlayingCardProps = {
  name: string;
  color: string;
  number: number;
  coins: number;
  height?: number;
  onNoOnClickMessage?: string;
  onClick?: (event?: React.MouseEvent) => void;
};

export default function PlayingCard(props: PlayingCardProps) {
  const { name, color, number, coins = 0, height = 200, onClick, onNoOnClickMessage } = props;
  const heightStr = `${height}px`;
  const widthStr = `${height * 0.75}px`;
  const topBarHeight = `${height * 0.2}px`;
  const boxPadding = `${height * 0.05}px`;
  const coinSize = `${height * 0.15}px`;
  const logoSize = `${height * 0.5}px`;
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const cardEl = useRef(null);

  const handleClick = (e: any) => {
    if (onClick) {
      onClick(e);
    } else if (onNoOnClickMessage) {
      setPopoverOpen(true);
      setTimeout(() => {
        setPopoverOpen(false);
      }, 2000);
    }
  };

  const cardUrlMap: Record<string, string> = {
    'Dog and Pwn': 'dog_and_pwn.png',
    'Bright Cats': 'bright_cats.png',
    'Happy Otter': 'happy_otter.png',
    'Penta Eagle': 'penta_eagle.png',
    'Sly Fox': 'sly_fox.png',
    Turtledove: 'turtledove.png',
  };

  const disabledStyles = color === 'grey' ? { filter: 'grayscale(1)' } : {};
  const middleSectionStyles = cardUrlMap[name] ? {} : { background: 'white' };
  return (
    <>
      <Card
        style={{
          height: heightStr,
          width: widthStr,
          display: 'flex',
          marginTop: '10px',
          userSelect: 'none',
          backgroundColor: color,
          ...disabledStyles,
        }}
        onClick={handleClick}
        ref={cardEl}
      >
        <Grid container direction="column">
          <Box
            display="flex"
            alignItems="center"
            flex="0 0 auto"
            justifyContent="flex-end"
            paddingRight={boxPadding}
            style={{ backgroundColor: color, minHeight: topBarHeight }}
          >
            {number > 0 && <div style={{ fontSize: '1rem', color: 'white', fontWeight: 500 }}>{number}</div>}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            flex="1 0 auto"
            justifyContent="center"
            maxWidth={widthStr}
            textAlign="center"
            padding={boxPadding}
            style={middleSectionStyles}
          >
            {cardUrlMap[name] ? (
              <img src={process.env.BASE_URL + '/' + cardUrlMap[name]} style={{ height: logoSize, width: logoSize }} />
            ) : (
              <Typography>{name}</Typography>
            )}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            flex="0 0 auto"
            style={{ backgroundColor: color, minHeight: topBarHeight }}
          >
            {new Array(coins).fill(1).map((_, i) => (
              <img
                src={process.env.BASE_URL + '/coin.png'}
                style={{ height: coinSize, width: coinSize }}
                key={'coin-img' + i}
              ></img>
            ))}
          </Box>
        </Grid>
      </Card>
      <Popover
        id={'popover'}
        open={popoverOpen}
        anchorEl={cardEl.current}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography variant="h6" style={{ padding: '20px' }}>
          {onNoOnClickMessage}
        </Typography>
      </Popover>
    </>
  );
}
