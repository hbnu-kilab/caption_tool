import { Dispatch, SetStateAction } from 'react';

// 박스 인덱스를 클릭했을때 캡션을 추가하거나, 박스를 삭제할 때 사용하는 함수

// 드래그 박스 객체를 만들기 위한 인터페이스
interface Box {
  x: number; // 좌측 상단 꼭지점 x 좌표
  y: number; // 좌측 상단 꼭지점 y 좌표
  height: number; // 박스 높이
  width: number; // 박스 너비
  captions: string[]; // correct caption
  errorCaptions: string[][]; // error caption
}

export const handleBoxClick = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  const caption = prompt(`Enter caption for this box: ${index}`); // caption 생성 prompt
  if (!caption) return; // caption이 입력되지 않으면 return
  if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

  // json 파일에 있는 bounding 박스 재로딩
  setBoxes((prevBoxes) => {
    const newBoxes = [...prevBoxes];
    let errorCaptionIndex:number = newBoxes[index].captions.length
    newBoxes[index].captions.push(caption); // caption 추가
    newBoxes[index].errorCaptions[newBoxes[index].captions.length-1].push(caption); // error caption 추가
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

  // display none
export  const handleBoxDisplay = (index:number) => {
    let box = document.getElementById(`box${index}`);
    let displayBtn = document.getElementById(`displayBtn${index}`);
    if (box !== null &&displayBtn !== null){
      console.log(box.style.display)
      if (box.style.display === 'none'){
        box.style.display = 'inline'
        displayBtn.style.backgroundColor = 'rgb(29, 31, 37)'
        displayBtn.innerHTML = "ON"
      }
      else {
        box.style.display = 'none'
        displayBtn.style.backgroundColor = 'rgb(172, 176, 185)'
        displayBtn.innerHTML = "OFF"

      }
    }
  }