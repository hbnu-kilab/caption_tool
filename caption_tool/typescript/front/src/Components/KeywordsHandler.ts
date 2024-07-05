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

interface Keyword {
  instance: string; // 키워드
  synonym: string[]; // 동의어
  antonym: string[]; // 반의어 <- etri에선 몰라야함ㅋㅋ
}


// keyword 클릭했을 때 실행, keyword 수정할 수 있도록 하는 코드
export const KeywordClick = (keyword: string, keywordsIndex:number, setKeywords: Dispatch<SetStateAction<Keyword[]>>) => {
  const ans = prompt(`Enter keyword for this image: \n ${keyword}`,keyword);
  if (!ans) return; // 아무값도 없으면 return
  if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return    

  setKeywords((prevKeywords) => { // ans값으로 keyword 수정
    const newKeywords = [...prevKeywords];
    newKeywords[keywordsIndex].instance = ans;
    return newKeywords; // keyword 수정된 keyword arr 반환
  });
};

export const SynonymClick = (synonym: string, keywordsIndex:number, synonymIndex:number, setKeywords: Dispatch<SetStateAction<Keyword[]>>) => {
    const ans = prompt(`Enter synonym for this keyword: \n ${synonym}`,synonym);
    if (!ans) return; // 아무값도 없으면 return
    if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return    
    setKeywords((prevKeywords) => { // ans값으로 entity 수정
      const newKeywords = [...prevKeywords];
      newKeywords[keywordsIndex].synonym[synonymIndex] = ans;
      return newKeywords; // entity 수정된 boxes arr 반환
    });
  };

export const addSynonymClick = (keywordsIndex:number, setKeywords: Dispatch<SetStateAction<Keyword[]>>) => {
    const ans = prompt(`Enter synonym for this keyword:`);
    if (!ans) return; // 아무값도 없으면 return
    if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return    
    setKeywords((prevKeywords) => { // ans값으로 entity 수정
      const newKeywords = [...prevKeywords];
      newKeywords[keywordsIndex].synonym.push(ans);
      return newKeywords; // entity 수정된 boxes arr 반환
    });
  };

  // + entity 클릭했을 때 실행, entity 추가할 수 있도록 하는 코드
  export const addKeywordsClick = (setKeywords: Dispatch<SetStateAction<Keyword[]>>) => {
    const ans = prompt(`Enter synonym for this keyword:`);
    if (!ans) return; // 아무값도 없으면 return
    if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return    

    setKeywords((prevKeywords) => { // ans값으로 entity 수정
      const newKeywords = [...prevKeywords];
      newKeywords.push({
        instance: ans, // 키워드
        synonym: [], // 동의어
        antonym: [] // 반의어 <- etri에선 몰라야함ㅋㅋ
      });
      return newKeywords; // entity 수정된 boxes arr 반환
    });
  };

  // keyword 클릭했을 때 실행, keyword 수정할 수 있도록 하는 코드
export const delKeywordClick = (keyword:string, keywordsIndex:number, setKeywords: Dispatch<SetStateAction<Keyword[]>>) => {
  const ans = window.confirm(`Are you sure to delete ${keyword}?`);
  if (!ans) return; // 아무값도 없으면 return

  setKeywords((prevKeywords) => { // ans값으로 keyword 수정
    const newKeywords = [...prevKeywords];
    newKeywords.splice(keywordsIndex,1)
    return newKeywords; // keyword 수정된 keyword arr 반환
  });
};

  // keyword 클릭했을 때 실행, keyword 수정할 수 있도록 하는 코드
  export const delSynonymClick = (synonym:string ,keywordsIndex:number, synonymIndex:number, setKeywords: Dispatch<SetStateAction<Keyword[]>>) => {
    const ans = window.confirm(`Are you sure to delete ${synonym}?`);
    if (!ans) return; // 아무값도 없으면 return
  
    setKeywords((prevKeywords) => { // ans값으로 keyword 수정
      const newKeywords = [...prevKeywords];
      newKeywords[keywordsIndex].synonym.splice(synonymIndex,1)
      return newKeywords; // keyword 수정된 keyword arr 반환
    });
  };