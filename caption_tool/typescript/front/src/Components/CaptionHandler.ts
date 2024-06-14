import { Dispatch, SetStateAction } from 'react';

// 드래그 박스 객체를 만들기 위한 인터페이스
interface Box {
    x: number;
    y: number;
    height: number;
    width: number;
    captions: string[];
    errorCaptions: string[];
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