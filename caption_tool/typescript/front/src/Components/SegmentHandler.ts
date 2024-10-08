import { Dispatch, SetStateAction } from 'react';
import { Box } from './Upload';


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
          console.log(segmentIndex, newSelectedSegment )
          return newSelectedSegment;
        })
      }
      return newBoxes; // 인덱스 값에 해당하는 객체에 caption 추가된 boxes arr 반환
    });

    
  };
  