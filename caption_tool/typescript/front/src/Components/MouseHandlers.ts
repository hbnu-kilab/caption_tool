import { MouseEvent, RefObject } from 'react';
import { Box } from './Upload';

// 이미지의 바운딩 박스가 없는 공간을 마우스로 클릭했을때 발생하는 이벤트
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

// 바운딩 박스를 클릭 > 마우스를 움직일 때 발생하는 이벤트, 3가지 경우에 발생 (박스 생성, 리사이징, 박스 위치 이동)
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
  // 리사이징 상태가 true라면(리사이징)
  if (isResizing && resizeIndex !== null) {
    const { left, top } = imageRef.current!.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const updatedBoxes = [...boxes]; // 기존 boxes 에 있던 값 가져오기
    updatedBoxes[resizeIndex] = {
      ...updatedBoxes[resizeIndex],
      // 크기 변경이 가능하도록 width, height 업데이트
      width: Math.abs(updatedBoxes[resizeIndex].x - x),
      height: Math.abs(updatedBoxes[resizeIndex].y - y),
    };
    setBoxes(updatedBoxes); // updateBoxes로 boxes 상태 업데이트
  }
  // 처음 생성하는 경우라면(처음 생성)
  else if (isDragging && imageRef.current) {
    const { left, top } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setNewBox({
      // 전체 업데이트
      ids: [-1],
      object_ids: [-1],
      x: Math.min(startX, x), 
      y: Math.min(startY, y), 
      height: Math.abs(startY - y),
      width: Math.abs(startX - x),
      relationship: {},
      captions: [],
      errorCaptions: [],
    });
  }
   
  // 만일 그냥 박스를 움직이는 거라면(박스 이동)
  else if (movingBoxIndex !== null) {
    const { left, top } = imageRef.current!.getBoundingClientRect();
    const width = imageRef.current!.getBoundingClientRect().width;
    const height = imageRef.current!.getBoundingClientRect().height;
    const x = e.clientX - left;
    const y = e.clientY - top;

    let dx = x - boxes[movingBoxIndex].x; // 움직인 만큼의 거리 계산
    let dy = y - boxes[movingBoxIndex].y; // 움직인 만큼의 거리 계산

    const maxDx = width - (boxes[movingBoxIndex].width + boxes[movingBoxIndex].x); // 이미지 크기에 맞추어 움직일 수 있는 최대거리 제한
    const maxDy = height - (boxes[movingBoxIndex].height + boxes[movingBoxIndex].y); // 이미지 크기에 맞추어 움직일 수 있는 최대거리 제한
    if (dx > maxDx) dx = maxDx;
    if (dy > maxDy) dy = maxDy;

    const updatedBoxes = [...boxes]; // 기존 boxes의 값 가져오기
    const box = updatedBoxes[movingBoxIndex]; // 움직인 박스 선택
    updatedBoxes[movingBoxIndex] = { 
      ...box,
      x: box.x + dx, // 박스 위치점을 변경해줘야함!
      y: box.y + dy, // 박스 위치점을 변경해줘야함!
    };
    setBoxes(updatedBoxes); // 변경한 내용 업데이트 
    setStartX(x); 
    setStartY(y);
  }
};

// 이미지에서 마우스를 떼는 경우
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
) => {
  if (isResizing) {
    setIsResizing(false);
    setResizeIndex(null);
  } else if (isDragging && newBox) {
    if (newBox.width > 2 && newBox.height > 2) {
      setBoxes(prevBoxes => {
        let updatedBoxes = [...prevBoxes, newBox];
        // setTimeout(() => handleBoxCreate(updatedBoxes.length - 1, setBoxes), 0);
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

// 바운딩 박스의 리사이징 부분을 클릭했을때 
export const handleResizeMouseDown = (
  index: number,
  e: MouseEvent<HTMLDivElement>,
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>,
  setResizeIndex: React.Dispatch<React.SetStateAction<number | null>>
) => {
  e.stopPropagation(); // 현재 이벤트가 캡처링/버블링 단계에서 더 이상 전파 되지 않도록 방지
  setIsResizing(true); // 리사이징 상태 변수를 true로 변경
  setResizeIndex(index); // resizeIndex 상태변수에 리사이징 인덱스 값 넣기 
};

// 바운딩 박스의 나머지 부분을 클릭했을 때
export const handleBoxMouseDown = (
  index: number,
  e: MouseEvent<HTMLDivElement>,
  imageRef: RefObject<HTMLImageElement>,
  setStartX: React.Dispatch<React.SetStateAction<number>>,
  setStartY: React.Dispatch<React.SetStateAction<number>>,
  setMovingBoxIndex: React.Dispatch<React.SetStateAction<number | null>>
) => {
  e.stopPropagation(); // 현재 이벤트가 캡처링/버블링 단계에서 더 이상 전파 되지 않도록 방지
  const { left, top } = imageRef.current!.getBoundingClientRect();
  setStartX(e.clientX - left);
  setStartY(e.clientY - top);
  setMovingBoxIndex(index); // movingBoxIndex 상태변수를 클릭한 박스 인덱스 값으로 변경
};
