import React, { MouseEvent, MutableRefObject } from 'react';
import { Box } from './Upload';
import styles from './Upload.module.css';
import uploadStyles from './uploadStyles';



// 바운딩 박스 사용자 정의 컴포넌트
interface BoundBoxesProps {
  newBox?: Box;
  boxes: Box[];
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
  onBoxMouseDown: (e: MouseEvent<HTMLDivElement>) => (index: number) => void;
  onResizeMouseDown: (e: MouseEvent<HTMLDivElement>) => (index: number) => void;
  imageRef: MutableRefObject<HTMLImageElement | null>;
  imageUrl: string;
  selectedBoxIndex: number;
}

const BoundBoxes: React.FC<BoundBoxesProps> = ({
    newBox,
    boxes,
    onMouseUp,
    onMouseMove,
    onMouseDown,
    onResizeMouseDown,
    onBoxMouseDown,
    imageRef,
    imageUrl,
    selectedBoxIndex,
}) => {
  return (
    <>
      <div
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <img ref={imageRef} src={`${String(imageUrl)}`} className={`${styles.noSelect}`} alt="Upload" />
        {newBox && (
          <div
            className="caption-box"
            style={{
              position: 'absolute',
              border: '2px solid red',
              left: `${newBox.x}px`,
              top: `${newBox.y}px`,
              width: `${newBox.width}px`,
              height: `${newBox.height}px`,
              pointerEvents: 'none',
            }}
          />
        )}
        {boxes.map((box, index) => (
          <div
            id={`box${index}`}
            key={index}
            style={{
              ...uploadStyles.boundBox(box),
              border: `2px solid ${index === selectedBoxIndex ? 'red' : 'blue'}`,
            }}
            onMouseDown={e => onBoxMouseDown(e)(index)}
          >
            {box.captions && (
              <div style={uploadStyles.caption()}>{index}</div>
            )}
            <div
              style={uploadStyles.captionResize()}
              onMouseDown={e => onResizeMouseDown(e)(index)}
            />
          </div>
        ))}
      </div>
    </>
  )
};

export default BoundBoxes;