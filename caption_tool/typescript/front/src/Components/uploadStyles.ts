import { CSSProperties } from 'react';
import { Box } from './Upload';


const uploadStyles = {
  newBoundBox: (box: Box): CSSProperties =>  ({
    border: '2px solid red',
      left: box?.x,
      top: box?.y,
      width: box?.width,
      height: box?.height,
      position: 'absolute',
  }),
  boundBox: (box: Box): CSSProperties => ({
    position: 'absolute',
    border: '2px solid blue',
    left: `${box.x}px`,
    top: `${box.y}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    cursor: 'pointer',
  }),
  caption: (): CSSProperties => ({
    position: 'absolute',
    backgroundColor: 'white',
    padding: '2px',
    border: '1px solid black',
    top: '-20px',
    left: '0',
  }),
  captionResize: (): CSSProperties => ({
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'blue',
    right: 0,
    bottom: 0,
    cursor: 'se-resize',
  }),
  navElement: (): CSSProperties => ({
    position: 'relative',
    display:'none',
    width: '100%'
  })
};


export default uploadStyles;
