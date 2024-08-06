import { Dispatch, SetStateAction } from 'react';
import { Box } from './Upload';

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
export const handleAddErrorCaption = (BoxIndex: number, CaptionIndex:number, correctCaption:string, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const caption = prompt(`Enter caption for this box: ${BoxIndex}`, correctCaption);
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

// error caption을 누르는 경우 실행됨, 삭제용
export const delCaptionClick = (BoxIndex: number, CaptionIndex: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].captions.splice(CaptionIndex, 1);
        newBoxes[BoxIndex].errorCaptions.splice(CaptionIndex, 1);
        return newBoxes;
    });

}

// error caption을 누르는 경우 실행됨, 삭제용
export const delErrorCaptionClick = (BoxIndex: number, CaptionIndex: number, ErrorCaptionIndex:number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    setBoxes((prevBoxes) => {
        const newBoxes = [...prevBoxes];
        newBoxes[BoxIndex].errorCaptions[CaptionIndex].splice(ErrorCaptionIndex, 1);
        return newBoxes;
    });

}