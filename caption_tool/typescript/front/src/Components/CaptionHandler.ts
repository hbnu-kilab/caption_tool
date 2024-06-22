import { Dispatch, SetStateAction } from 'react';

// 드래그 박스 객체를 만들기 위한 인터페이스
interface Box {
    x: number; // 좌측 상단 꼭지점 x 좌표
    y: number; // 좌측 상단 꼭지점 y 좌표
    height: number; // 박스 높이
    width: number; // 박스 너비
    entity: string[]; // 감지된 물체들의 이름
    captions: string[]; // correct caption
    errorCaptions: string[][]; // error caption
  }

// correct caption의 add 버튼을 누르는 경우 실행됨, 추가용
export const handleAddCaption = (BoxIndex: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`);
    if (!caption) return;
    if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].captions.push(caption);
        newBoxes[BoxIndex].errorCaptions.push([caption]); // error caption에도 함꼐 반영되도록 함
        return newBoxes;
    });
}

// error caption의 add 버튼을 누르는 경우 실행됨, 추가용
export const handleAddErrorCaption = (BoxIndex: number, CaptionIndex:number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`);
    if (!caption) return;
    if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].errorCaptions[CaptionIndex].push(caption); // error caption에도 함꼐 반영되도록 함
        return newBoxes;
    });
}

export const handleCaptionClick = (BoxIndex: number, CaptionIndex: number, originCaption:string, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`, originCaption);
    if (!caption) return;

    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].captions[CaptionIndex] = caption;
        newBoxes[BoxIndex].errorCaptions[CaptionIndex][0] = caption; // error caption에도 함꼐 반영되도록 함
        return newBoxes;
    });

}

// error caption을 누르는 경우 실행됨, 수정용
export const handleErrorCaptionClick = (BoxIndex: number, CaptionIndex: number, ErrorCaptionIndex:number, originCaption:string, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`, originCaption);
    if (!caption) return;

    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].errorCaptions[CaptionIndex][ErrorCaptionIndex] = caption;
        return newBoxes;
    });

}