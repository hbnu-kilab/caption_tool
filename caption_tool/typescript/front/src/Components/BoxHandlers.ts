import { Dispatch, SetStateAction } from 'react';

// 박스 인덱스를 클릭했을때 캡션을 추가하거나, 박스를 삭제할 때 사용하는 함수

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

// 박스 인덱스를 클릭했을 때
export const handleBoxCreate = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  const caption = prompt(`Enter one object name that can be recognized in this box: ${index}`); // caption 생성 prompt
  if (!caption) return; // caption이 입력되지 않으면 return
  if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

  setBoxes((prevBoxes) => {
    let newBoxes = [...prevBoxes];
    console.log(caption.length)
    if(caption !== null && caption.length > 0) newBoxes[index].entity.push(caption); // caption 추가
    else newBoxes.pop()
    return newBoxes; // box array return
  });
};
export const handleBoxClick = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  const caption = prompt(`Enter caption for this box: ${index}`); // caption 생성 prompt
  if (!caption) return; // caption이 입력되지 않으면 return
  if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

  // json 파일에 있는 bounding 박스 재로딩
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
