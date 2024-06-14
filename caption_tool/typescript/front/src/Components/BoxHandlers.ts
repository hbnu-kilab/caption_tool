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

// 박스 인덱스를 클릭했을 때
export const handleBoxClick = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  const caption = prompt(`Enter caption for this box: ${index}`); // caption 생성 prompt
  if (!caption) return; // caption이 입력되지 않으면 return
  if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

  setBoxes((prevBoxes) => {
    const newBoxes = [...prevBoxes];
    newBoxes[index].captions.push(caption); // caption 추가
    newBoxes[index].errorCaptions.push(caption); // error caption 추가
    return newBoxes; // box array return
  });
};
// delete 버튼을 클릭했을 떄
export const handleDeleteClick = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  setBoxes((prevBoxes) => {
    const newBoxes = [...prevBoxes];
    newBoxes.splice(index, 1); // 배열에서 해당 인덱스의 요소를 제거
    return newBoxes;
  });
};
