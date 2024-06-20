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


// entity 클릭했을 때 실행, entity 수정할 수 있도록 하는 코드
export const EntityClick = (entity: string, entityIndex:number, boxIndex:number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const ans = prompt(`Enter entity for this box: \n ${entity}`,entity);
    if (!ans) return; // 아무값도 없으면 return
    if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return    
    
    setBoxes((prevBoxes) => { // ans값으로 entity 수정
      const newBoxes = [...prevBoxes];
      newBoxes[boxIndex].entity[entityIndex] = ans;
      return newBoxes; // entity 수정된 boxes arr 반환
    });

    
  };

  // + entity 클릭했을 때 실행, entity 추가할 수 있도록 하는 코드
  export const AddEntityClick = (boxIndex:number, setBoxes: Dispatch<SetStateAction<Box[]>>) => {
    const ans = prompt(`Enter entity for this box:`);
    if (!ans) return; // 아무값도 없으면 return
    if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return    
    
    setBoxes((prevBoxes) => { // ans값으로 새 entity 생성
      const newBoxes = [...prevBoxes];
      console.log(newBoxes[boxIndex].entity.length)
      if (newBoxes[boxIndex].entity.length<1) newBoxes[boxIndex].entity = [String(ans)]
      else newBoxes[boxIndex].entity.push(ans);
      return newBoxes; // entity 추가 boxes arr 반환
    });

    
  };