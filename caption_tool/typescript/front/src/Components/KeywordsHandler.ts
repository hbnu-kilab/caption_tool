import { Dispatch, SetStateAction } from 'react';

// 드래그 박스 객체를 만들기 위한 인터페이스
interface Box {
  x: number; // 좌측 상단 꼭지점 x 좌표
  y: number; // 좌측 상단 꼭지점 y 좌표
  height: number; // 박스 높이
  width: number; // 박스 너비
  captions: string[]; // correct caption
  errorCaptions: string[][]; // error caption
}

export interface Keyword {
  instance: string; // 키워드
  synset: string[]; // 동의어
  nearest_ancestor: string; // 부모 노드 키워드
  unique_beginner: string; // unique beginner
}

// keyword 클릭했을 때 실행, keyword 수정할 수 있도록 하는 코드
export const KeywordClick = (
    keyword: string,
    keywordsIndex: number,
    setKeywords: Dispatch<SetStateAction<Keyword[]>>,
    setHistory: Dispatch<SetStateAction<Keyword[][]>>
) => {
  const ans = prompt(`Enter keyword for this image: \n ${keyword}`, keyword);
  if (!ans) return; // 아무값도 없으면 return
  if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return

  setKeywords((prevKeywords) => {
    const newKeywords = [...prevKeywords];
    setHistory((prevHistory) => [
      ...prevHistory,
      JSON.parse(JSON.stringify(prevKeywords)), // 이전 상태를 깊은 복사로 저장
    ]);
    newKeywords[keywordsIndex].instance = ans;
    return newKeywords;
  });
};

export const SynonymClick = (
    synonym: string,
    keywordsIndex: number,
    synonymIndex: number,
    setKeywords: Dispatch<SetStateAction<Keyword[]>>,
    setHistory: Dispatch<SetStateAction<Keyword[][]>>
) => {
  const ans = prompt(`Enter synonym for this keyword: \n ${synonym}`, synonym);
  if (!ans) return; // 아무값도 없으면 return
  if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return
  setKeywords((prevKeywords) => {
    const newKeywords = [...prevKeywords];
    setHistory((prevHistory) => [
      ...prevHistory,
      JSON.parse(JSON.stringify(prevKeywords)), // 이전 상태를 깊은 복사로 저장
    ]);
    newKeywords[keywordsIndex].synset[synonymIndex] = ans;
    return newKeywords;
  });
};

export const addSynonymClick = (
    keywordsIndex: number,
    setKeywords: Dispatch<SetStateAction<Keyword[]>>,
    setHistory: Dispatch<SetStateAction<Keyword[][]>>
) => {
  const ans = prompt(`Enter synonym for this keyword:`);
  if (!ans) return; // 아무값도 없으면 return
  if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return
  setKeywords((prevKeywords) => {
    const newKeywords = [...prevKeywords];
    setHistory((prevHistory) => [
      ...prevHistory,
      JSON.parse(JSON.stringify(prevKeywords)), // 이전 상태를 깊은 복사로 저장
    ]);
    newKeywords[keywordsIndex].synset.push(ans);
    return newKeywords;
  });
};

// + entity 클릭했을 때 실행, entity 추가할 수 있도록 하는 코드
export const addKeywordsClick = (
    setKeywords: Dispatch<SetStateAction<Keyword[]>>,
    setHistory: Dispatch<SetStateAction<Keyword[][]>>
) => {
  const ans = prompt(`Enter keyword for this image:`);
  if (!ans) return; // 아무값도 없으면 return
  if (/^\s*$/.test(ans)) return; // space바만 입력되어있으면 return

  setKeywords((prevKeywords) => {
    const newKeywords = [...prevKeywords];
    setHistory((prevHistory) => [
      ...prevHistory,
      JSON.parse(JSON.stringify(prevKeywords)), // 이전 상태를 깊은 복사로 저장
    ]);
    newKeywords.push({
      instance: ans, // 키워드
      synset: [], // 동의어
      nearest_ancestor: "", // 부모 노드 키워드
      unique_beginner: "", // unique beginner
    });
    return newKeywords;
  });
};

// keyword 클릭했을 때 실행, keyword 수정할 수 있도록 하는 코드
export const delKeywordClick = (
    keyword: string,
    keywordsIndex: number,
    setKeywords: Dispatch<SetStateAction<Keyword[]>>,
    setHistory: Dispatch<SetStateAction<Keyword[][]>>
) => {
  const ans = window.confirm(`Are you sure to delete ${keyword}?`);
  if (!ans) return; // 아무값도 없으면 return

  setKeywords((prevKeywords) => {
    const newKeywords = [...prevKeywords];
    setHistory((prevHistory) => [
      ...prevHistory,
      JSON.parse(JSON.stringify(prevKeywords)), // 이전 상태를 깊은 복사로 저장
    ]);
    newKeywords.splice(keywordsIndex, 1);
    return newKeywords;
  });
};

// keyword 클릭했을 때 실행, keyword 수정할 수 있도록 하는 코드
export const delSynonymClick = (
    synonym: string,
    keywordsIndex: number,
    synonymIndex: number,
    setKeywords: Dispatch<SetStateAction<Keyword[]>>,
    setHistory: Dispatch<SetStateAction<Keyword[][]>>
) => {
  const ans = window.confirm(`Are you sure to delete ${synonym}?`);
  if (!ans) return; // 아무값도 없으면 return

  setKeywords((prevKeywords) => {
    const newKeywords = [...prevKeywords];
    setHistory((prevHistory) => [
      ...prevHistory,
      JSON.parse(JSON.stringify(prevKeywords)), // 이전 상태를 깊은 복사로 저장
    ]);
    newKeywords[keywordsIndex].synset.splice(synonymIndex, 1);
    return newKeywords;
  });
};
