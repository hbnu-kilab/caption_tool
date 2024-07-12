import React from 'react';
import {
  addKeywordsClick, addSynonymClick,
  delKeywordClick,
  delSynonymClick,
  KeywordClick,
  SynonymClick
} from './KeywordsHandler';
import styles from './Upload.module.css';
import { Keyword } from './Upload';

interface KeywordListProps {
  keywords: Keyword[];
  setKeywords: React.Dispatch<React.SetStateAction<Keyword[]>>;
}

const KeywordList: React.FC<KeywordListProps> = ({ keywords, setKeywords }) => {

  // 키워드 클러스터 만들기 위함(웹에서 보여주는 데에만 쓸 거임)
  // 특정 키 값을 기준으로 객체들을 그룹화하는 함수
  function groupBy(array:any, key:string) {
    return array.reduce((result:any, currentValue:any) => {
        // 현재 객체의 키 값을 가져옴
        const keyValue = currentValue[key];
        
        // 결과 객체에 키 값에 해당하는 배열이 없으면 생성
        if (!result[keyValue]) {
            result[keyValue] = [];
        }
        
        // 현재 객체를 해당 키 값의 배열에 추가
        result[keyValue].push(currentValue);
        
        return result;
    }, {});
  }

// 'unique_beginner' 키 값을 기준으로 객체들을 그룹화
const groupedkeywords = groupBy(keywords, 'unique_beginner');
  console.log(groupedkeywords)

  const handleKeywordDisplay = (index:number, keywordInstance:string, synonym:string[]) => {
    let keyword = document.getElementById(`keyword${index}`);
    let keywordsyn = document.getElementById(`keywordsyn${index}`);
    console.log(`keywordsyn${index}`)

    if (keyword !== null && keywordsyn!== null){
      if (keywordsyn.style.display === 'none'){
        keywordsyn.style.display = 'table-row';
        if (keyword.innerHTML !== 'none') keyword.innerHTML =  `${keywordInstance}`
        else keyword.innerHTML =  `none`
      }
      else {
        keywordsyn.style.display = 'none'
        if (keyword.innerHTML !== 'none') keyword.innerHTML = `${keywordInstance}`
        else keyword.innerHTML =  `none`

      }
    }
  };

  return (
    <>
      <h1>Keyword of instance</h1>
      <button onClick = {()=>addKeywordsClick(setKeywords)}
              className={`${styles.addKeyword}`}>+ Keyword</button>
      <br/>
      <br/>

      <div className={`${styles.keywordSet} ${styles.radius}`}>

        <table style={{width:'100%', tableLayout: 'fixed'}}>

          {keywords.map((keyword, keywordIndex) => (
            <tbody>
            <tr
              key={`keyword${keywordIndex}`}
              onClick={()=>handleKeywordDisplay(keywordIndex, keyword.unique_beginner, keyword.synset)}
            >
              <td colSpan={3} className={`${styles.hovering}`}>
                <span
                  id={`keyword${keywordIndex}`}
                >{(keyword.unique_beginner === "")? "none":  (keyword.unique_beginner)}</span>
                <br />
                <span>{(keyword.nearest_ancestor === "")? "--- none": `--- ${keyword.nearest_ancestor}`}</span>
                <br /><span>{`------ ${keyword.instance}`}</span>
              </td>
              <td><button
                className={`${styles.displayBtn}`}
                onClick={()=>KeywordClick(keyword.instance, keywordIndex, setKeywords)}>modify</button></td>
              <td><button
                onClick={()=>delKeywordClick(keyword.instance, keywordIndex,setKeywords)}
                className={`${styles.delBtn}`}>delete</button></td>
            </tr>
            {/* synonym */}
            <tr
              key={`keywordsyn${keywordIndex}`}
              id={`keywordsyn${keywordIndex}`}
              style={{
                position: 'relative',
                display:'none',
                width: '100%'
              }}>
              <td colSpan={5}>
                <div className={`${styles.keywordList}`}>
                  {keyword.synset.map((synonym, synonymIndex) => (
                    <li>
                      <span
                            key={ `keywordsyn${keywordIndex}${synonymIndex}`}
                            className={`${styles.hovering}`}
                            onClick={()=> SynonymClick(synonym,keywordIndex,synonymIndex,setKeywords)}
                          >{synonym}</span> 
                          <button
                            onClick={()=>delSynonymClick(synonym, keywordIndex,synonymIndex,setKeywords)}
                            className={`${styles.delBtn}`}
                          >delete</button>                    
                    </li>
                  ))}
                  <button onClick = {()=>addSynonymClick(keywordIndex, setKeywords)}
                          className={`${styles.addEntity}`}>+ Synonym</button>
                </div>
              </td>
            </tr>
            </tbody>
          ))}

        </table>
      </div>

    </>
  );
};

export default KeywordList;