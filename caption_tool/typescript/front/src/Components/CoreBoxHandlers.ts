import { Dispatch, SetStateAction } from 'react';
import { Box } from './CoreJsonInterface';

export const handleBoxClick = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  const caption = prompt(`Enter caption for this box: ${index}`); // caption 생성 prompt
  if (!caption) return; // caption이 입력되지 않으면 return
  if (/^\s*$/.test(caption)) return; // caption에 space바만 입력되어있으면 return

  // json 파일에 있는 bounding 박스 재로딩
  setBoxes((prevBoxes) => {
    const newBoxes = [...prevBoxes];
    let errorCaptionIndex:number = newBoxes[index].captions.length
    newBoxes[index].captions.push({"caption":caption, "counterfactual_caption": caption}); // caption 추가
    return newBoxes; // box array return
  });
};
// delete 버튼을 클릭했을 떄
export const handleDeleteClick = (index: number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
  if (confirm("정말 진행하시겠습니까??") == true){    //확인
    setBoxes((prevBoxes) => {
      const newBoxes = [...prevBoxes];
      newBoxes.splice(index, 1); // 배열에서 해당 인덱스의 요소를 제거
      return newBoxes;
    });
}else{   //취소
    return false;
}
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
        displayBtn.innerHTML = "on"
      }
      else {
        box.style.display = 'none'
        displayBtn.style.backgroundColor = 'rgb(172, 176, 185)'
        displayBtn.innerHTML = "off"

      }
    }
  }