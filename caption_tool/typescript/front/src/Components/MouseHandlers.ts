import { MouseEvent, RefObject } from 'react';

interface Box {
  x: number; // 좌측 상단 꼭지점 x 좌표
  y: number; // 좌측 상단 꼭지점 y 좌표
  height: number; // 박스 높이
  width: number; // 박스 너비
  entity: string[]; // 감지된 물체들의 이름
  captions: string[]; // correct caption
  errorCaptions: string[]; // error caption
}

export const handleMouseDown = (
  e: MouseEvent<HTMLDivElement>,
  imageRef: RefObject<HTMLImageElement>,
  setStartX: React.Dispatch<React.SetStateAction<number>>,
  setStartY: React.Dispatch<React.SetStateAction<number>>,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!imageRef.current) return;
  const { left, top } = imageRef.current.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  setStartX(x);
  setStartY(y);
  setIsDragging(true);
};

export const handleMouseMove = (
  e: MouseEvent<HTMLDivElement>,
  imageRef: RefObject<HTMLImageElement>,
  isResizing: boolean,
  resizeIndex: number | null,
  boxes: Box[],
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>,
  isDragging: boolean,
  startX: number,
  startY: number,
  setNewBox: React.Dispatch<React.SetStateAction<Box | null>>,
  movingBoxIndex: number | null,
  setStartX: React.Dispatch<React.SetStateAction<number>>,
  setStartY: React.Dispatch<React.SetStateAction<number>>
) => {
  if (isResizing && resizeIndex !== null) {
    const { left, top } = imageRef.current!.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const updatedBoxes = [...boxes];
    updatedBoxes[resizeIndex] = {
      ...updatedBoxes[resizeIndex],
      width: Math.abs(updatedBoxes[resizeIndex].x - x),
      height: Math.abs(updatedBoxes[resizeIndex].y - y),
    };
    setBoxes(updatedBoxes);
  } else if (isDragging && imageRef.current) {
    const { left, top } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setNewBox({
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      height: Math.abs(startY - y),
      width: Math.abs(startX - x),
      entity: [],
      captions: [],
      errorCaptions: [],
    });
  } else if (movingBoxIndex !== null) {
    const { left, top } = imageRef.current!.getBoundingClientRect();
    const width = imageRef.current!.getBoundingClientRect().width;
    const height = imageRef.current!.getBoundingClientRect().height;
    const x = e.clientX - left;
    const y = e.clientY - top;

    let dx = x - boxes[movingBoxIndex].x;
    let dy = y - boxes[movingBoxIndex].y;

    const maxDx = width - (boxes[movingBoxIndex].width + boxes[movingBoxIndex].x);
    const maxDy = height - (boxes[movingBoxIndex].height + boxes[movingBoxIndex].y);

    if (dx > maxDx) dx = maxDx;
    if (dy > maxDy) dy = maxDy;

    const updatedBoxes = [...boxes];
    const box = updatedBoxes[movingBoxIndex];
    updatedBoxes[movingBoxIndex] = {
      ...box,
      x: box.x + dx,
      y: box.y + dy,
    };
    setBoxes(updatedBoxes);
    setStartX(x);
    setStartY(y);
  }
};

export const handleMouseUp = (
  isResizing: boolean,
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>,
  setResizeIndex: React.Dispatch<React.SetStateAction<number | null>>,
  isDragging: boolean,
  newBox: Box | null,
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>,
  setNewBox: React.Dispatch<React.SetStateAction<Box | null>>,
  movingBoxIndex: number | null,
  setMovingBoxIndex: React.Dispatch<React.SetStateAction<number | null>>,
  handleBoxCreate: (index: number, setBoxes: React.Dispatch<React.SetStateAction<Box[]>>) => void
) => {
  if (isResizing) {
    setIsResizing(false);
    setResizeIndex(null);
  } else if (isDragging && newBox) {
    if (newBox.width > 2 && newBox.height > 2) {
      setBoxes(prevBoxes => {
        let updatedBoxes = [...prevBoxes, newBox];
        setTimeout(() => handleBoxCreate(updatedBoxes.length - 1, setBoxes), 0);
        // console.log(updatedBoxes[updatedBoxes.length-1].entity.length)
        // if (updatedBoxes[updatedBoxes.length-1].entity.length === 0) updatedBoxes.pop()
        return updatedBoxes;
      });
    }
    setIsDragging(false);
    setNewBox(null);
  } else if (movingBoxIndex !== null) {
    setMovingBoxIndex(null);
  }
};

export const handleResizeMouseDown = (
  index: number,
  e: MouseEvent<HTMLDivElement>,
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>,
  setResizeIndex: React.Dispatch<React.SetStateAction<number | null>>
) => {
  e.stopPropagation();
  setIsResizing(true);
  setResizeIndex(index);
};

export const handleBoxMouseDown = (
  index: number,
  e: MouseEvent<HTMLDivElement>,
  imageRef: RefObject<HTMLImageElement>,
  setStartX: React.Dispatch<React.SetStateAction<number>>,
  setStartY: React.Dispatch<React.SetStateAction<number>>,
  setMovingBoxIndex: React.Dispatch<React.SetStateAction<number | null>>
) => {
  e.stopPropagation();
  const { left, top } = imageRef.current!.getBoundingClientRect();
  setStartX(e.clientX - left);
  setStartY(e.clientY - top);
  setMovingBoxIndex(index);
};
