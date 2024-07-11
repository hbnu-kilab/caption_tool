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

  const handleKeywordDisplay = (index:number, keywordInstance:string, synonym:string[]) => {
    let keyword = document.getElementById(`keyword${index}`);
    let keywordsyn = document.getElementById(`keywordsyn${index}`);
    console.log(`keywordsyn${index}`)

    if (keyword !== null && keywordsyn!== null){
      if (keywordsyn.style.display === 'none'){
        keywordsyn.style.display = 'table-row';
        if (keyword.innerHTML !== 'none   ▼') keyword.innerHTML =  `${keywordInstance}   ▲`
        else keyword.innerHTML =  `none   ▲`
      }
      else {
        keywordsyn.style.display = 'none'
        if (keyword.innerHTML !== 'none   ▲') keyword.innerHTML = `${keywordInstance}   ▼`
        else keyword.innerHTML =  `none   ▼`

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
              onClick={()=>handleKeywordDisplay(keywordIndex, keyword.instance, keyword.synset)}
            >
              <td colSpan={3}>
                    <span
                      id={`keyword${keywordIndex}`}
                      className={`${styles.hovering}`}
                    >{`${keyword.instance}   ▼`}</span>
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
                          >{synonym}</span> <button
                      onClick={()=>delSynonymClick(synonym, keywordIndex,synonymIndex,setKeywords)}
                      className={`${styles.delBtn}`}
                    >delete</button></li>
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