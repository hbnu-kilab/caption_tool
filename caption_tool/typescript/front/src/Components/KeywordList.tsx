import React, { useState, useEffect } from 'react';
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

// 특정 키 값을 기준으로 객체들을 그룹화하는 함수
const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((result: Record<string, T[]>, currentValue: T) => {
        const keyValue = String(currentValue[key]);
        if (!result[keyValue]) {
            result[keyValue] = [];
        }
        result[keyValue].push(currentValue);
        return result;
    }, {});
};

const KeywordList: React.FC<KeywordListProps> = ({ keywords, setKeywords }) => {
    const [expandedKeywords, setExpandedKeywords] = useState<{ [key: string]: boolean }>({});

    // keywords 데이터 구조 확인
    useEffect(() => {
        console.log("Loaded keywords:", keywords);
    }, [keywords]);

    // 'unique_beginner' 키 값을 기준으로 객체들을 그룹화
    const groupedByUniqueBeginner = groupBy(keywords, 'unique_beginner');
    console.log("Grouped by unique_beginner:", groupedByUniqueBeginner);

    // 키워드 클릭 시 동의어 목록을 표시하는 함수
    const handleKeywordDisplay = (uniqueBeginner: string, nearestAncestor: string, instance: string) => {
        const key = `${uniqueBeginner}-${nearestAncestor}-${instance}`;
        setExpandedKeywords((prevState) => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    // 동의어 추가 클릭 시 처리하는 함수
    const handleAddSynonymClick = (keywordIndex: number) => {
        console.log(`Adding synonym for keywordIndex: ${keywordIndex}`);
        addSynonymClick(keywordIndex, setKeywords);
    };

    // 키워드 삭제 클릭 시 처리하는 함수
    const handleDeleteKeywordClick = (instance: string, keywordIndex: number) => {
        console.log(`Deleting keyword: ${instance} at index: ${keywordIndex}`);
        delKeywordClick(instance, keywordIndex, setKeywords);
    };

    // 동의어 삭제 클릭 시 처리하는 함수
    const handleDeleteSynonymClick = (synonym: string, keywordIndex: number, synonymIndex: number) => {
        console.log(`Deleting synonym: ${synonym} for keywordIndex: ${keywordIndex} at synonymIndex: ${synonymIndex}`);
        delSynonymClick(synonym, keywordIndex, synonymIndex, setKeywords);
    };

    return (
        <>
            <h1>Keyword of instance</h1>
            <button onClick={() => addKeywordsClick(setKeywords)} className={styles.addKeyword}>+ Keyword</button>
            <br />
            <br />
            <div className={`${styles.keywordSet} ${styles.radius}`}>
                <table style={{ width: '100%', tableLayout: 'fixed' }}>
                    {Object.keys(groupedByUniqueBeginner).map((uniqueBeginner, uniqueBeginnerIndex) => (
                        <React.Fragment key={`${uniqueBeginner}${uniqueBeginnerIndex}`}>
                            <tr>
                                <td colSpan={5}><strong>{uniqueBeginner === "" ? "none" : uniqueBeginner}</strong></td>
                            </tr>
                            {Object.entries(groupBy(Object.values(groupedByUniqueBeginner[uniqueBeginner]),'nearest_ancestor')).map(([nearest_ancestor, Keywords], KeywordsIndex) => (
                                <React.Fragment key={`${nearest_ancestor}${uniqueBeginnerIndex}${KeywordsIndex}`}>
                                    <tr>
                                        <td colSpan={5} style={{ paddingLeft: '20px' }}><strong className={`${styles.hovering}`}>{nearest_ancestor === ""? "none" : nearest_ancestor}</strong></td>
                                    </tr>
                                    {Keywords.map((Keyword, KeywordIndex) => (
                                        <React.Fragment key={`${nearest_ancestor}${uniqueBeginnerIndex}${KeywordIndex}`}>
                                            <tr>
                                                <td colSpan={5} style={{ paddingLeft: '40px' }}><span 
                                                                                                className={`${styles.hovering}`}
                                                                                                onClick={()=>handleKeywordDisplay(uniqueBeginner,nearest_ancestor,Keyword.instance)}>{Keyword.instance}</span></td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    ))}
                </table>
            </div>
        </>
    );
};

export default KeywordList;
