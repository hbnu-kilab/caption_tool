import { Dispatch, SetStateAction } from 'react';

// 드래그 박스 객체를 만들기 위한 인터페이스
interface Box {
    x: number; // 좌측 상단 꼭지점 x 좌표
    y: number; // 좌측 상단 꼭지점 y 좌표
    height: number; // 박스 높이
    width: number; // 박스 너비
    entity: string[]; // 감지된 물체들의 이름
    captions: string[]; // correct caption
    errorCaptions: string[]; // error caption
  }

// correct caption을 누르는 경우 실행됨, 수정용
export const handleCaptionClick = (BoxIndex: number, CaptionIndex: number, originCaption:string, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`, originCaption);
    if (!caption) return;

    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].captions[CaptionIndex] = caption;
        newBoxes[BoxIndex].errorCaptions[CaptionIndex] = caption; // error caption에도 함꼐 반영되도록 함
        return newBoxes;
    });

}

// error caption을 누르는 경우 실행됨, 수정용
export const handleErrorCaptionClick = (BoxIndex: number, CaptionIndex: number, originCaption:string, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`, originCaption);
    if (!caption) return;

    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].errorCaptions[CaptionIndex] = caption;
        return newBoxes;
    });

}