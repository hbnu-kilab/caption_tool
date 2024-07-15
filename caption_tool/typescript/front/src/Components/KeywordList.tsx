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
                    {Object.entries(groupedByUniqueBeginner).map(([uniqueBeginner, groupedKeywords]) => (
                        <React.Fragment key={uniqueBeginner}>
                            <tr>
                                <td colSpan={5}><strong>{uniqueBeginner}</strong></td>
                            </tr>
                            {Object.entries(groupBy(groupedKeywords as Keyword[], 'nearest_ancestor')).map(([nearestAncestor, nestedKeywords]) => (
                                <React.Fragment key={nearestAncestor}>
                                    <tr>
                                        <td colSpan={5} style={{ paddingLeft: '20px' }}><strong>{nearestAncestor}</strong></td>
                                    </tr>
                                    {(nestedKeywords as Keyword[]).map((keyword, keywordIndex) => {
                                        const key = `${uniqueBeginner}-${nearestAncestor}-${keyword.instance}`;
                                        return (
                                            <React.Fragment key={key}>
                                                <tr>
                                                    <td colSpan={3} className={styles.hovering} onClick={() => handleKeywordDisplay(uniqueBeginner, nearestAncestor, keyword.instance)}>
                            <span id={`keyword${keywordIndex}`}>
                              {(keyword.instance === "") ? "none" : keyword.instance}
                            </span>
                                                    </td>
                                                    <td><button className={styles.displayBtn} onClick={(e) => { e.stopPropagation(); KeywordClick(keyword.instance, keywordIndex, setKeywords); }}>modify</button></td>
                                                    <td><button className={styles.delBtn} onClick={(e) => { e.stopPropagation(); handleDeleteKeywordClick(keyword.instance, keywordIndex); }}>delete</button></td>
                                                </tr>
                                                {expandedKeywords[key] && (
                                                    <tr id={`keywordsyn${keywordIndex}`}>
                                                        <td colSpan={5}>
                                                            <div className={styles.keywordList}>
                                                                {keyword.synset.map((synonym, synonymIndex) => (
                                                                    <li key={synonymIndex}>
                                                                        <span className={styles.hovering} onClick={() => SynonymClick(synonym, keywordIndex, synonymIndex, setKeywords)}>{synonym}</span>
                                                                        <button className={styles.delBtn} onClick={(e) => { e.stopPropagation(); handleDeleteSynonymClick(synonym, keywordIndex, synonymIndex); }}>delete</button>
                                                                    </li>
                                                                ))}
                                                                <button onClick={(e) => { e.stopPropagation(); handleAddSynonymClick(keywordIndex); }} className={styles.addEntity}>+ Synonym</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
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
