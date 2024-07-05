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


// segment를 클릭했을 때 실행
export const SegmentClick = (segment: string, segmentIndex:number, setBoxes: Dispatch<SetStateAction<Box[]>>, setSelectedSegment:Dispatch<SetStateAction<boolean[]>>) => {
    const ans = prompt(`Enter box index for this segment: \n ${segment}`);
    if (!ans) return; // 아무값도 없으면 return
    if (/^\s*$/.test(ans)) return; // caption에 space바만 입력되어있으면 return    
    
    const captionIndex = Number(ans) // Number 타입으로 변환
    if (Number.isNaN(captionIndex)) return; // 숫자로 변환이 안되면 return
    
    setBoxes((prevBoxes) => { // segment값으로 caption 생성
      const newBoxes = [...prevBoxes];
      if (captionIndex < newBoxes.length){
        newBoxes[captionIndex].captions.push(segment);
        newBoxes[captionIndex].errorCaptions.push([segment]);

        setSelectedSegment((prevNumbers) => { // 이미 선택된 segment의 값은 true로 변환
          const newSelectedSegment = [...prevNumbers];
          newSelectedSegment[segmentIndex] = true;
          console.log(segmentIndex, newSelectedSegment )
          return newSelectedSegment;
        })
      }
      return newBoxes; // 인덱스 값에 해당하는 객체에 caption 추가된 boxes arr 반환
    });

    
  };
  