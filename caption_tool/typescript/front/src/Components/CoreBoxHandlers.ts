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

  // display none
export  const handleBoxDisplay = (box_id:string) => {
    let box = document.getElementById(`${box_id}`);
    let displayBtn = document.getElementById(`displayBtn_${box_id}`);
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