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
    const handleAddSynonymClick = (uniqueBeginner: string, nearestAncestor: string, instance: string) => {
        const keywordIndex = keywords.findIndex(
            (kw) => kw.unique_beginner === uniqueBeginner && kw.nearest_ancestor === nearestAncestor && kw.instance === instance
        );
        if (keywordIndex !== -1) {
            console.log(`Adding synonym for keywordIndex: ${keywordIndex}`);
            addSynonymClick(keywordIndex, setKeywords);
        }
    };

    // 키워드 삭제 클릭 시 처리하는 함수
    const handleDeleteKeywordClick = (uniqueBeginner: string, nearestAncestor: string, instance: string) => {
        const keywordIndex = keywords.findIndex(
            (kw) => kw.unique_beginner === uniqueBeginner && kw.nearest_ancestor === nearestAncestor && kw.instance === instance
        );
        if (keywordIndex !== -1) {
            console.log(`Deleting keyword: ${instance} at index: ${keywordIndex}`);
            delKeywordClick(instance, keywordIndex, setKeywords);
        }
    };

    // 동의어 삭제 클릭 시 처리하는 함수
    const handleDeleteSynonymClick = (uniqueBeginner: string, nearestAncestor: string, instance: string, synonym: string) => {
        const keywordIndex = keywords.findIndex(
            (kw) => kw.unique_beginner === uniqueBeginner && kw.nearest_ancestor === nearestAncestor && kw.instance === instance
        );
        if (keywordIndex !== -1) {
            const synonymIndex = keywords[keywordIndex].synset.indexOf(synonym);
            if (synonymIndex !== -1) {
                console.log(`Deleting synonym: ${synonym} for keywordIndex: ${keywordIndex} at synonymIndex: ${synonymIndex}`);
                delSynonymClick(synonym, keywordIndex, synonymIndex, setKeywords);
            }
        }
    };

    // 동의어 수정 클릭 시 처리하는 함수
    const handleModifySynonymClick = (uniqueBeginner: string, nearestAncestor: string, instance: string, synonym: string) => {
        const keywordIndex = keywords.findIndex(
            (kw) => kw.unique_beginner === uniqueBeginner && kw.nearest_ancestor === nearestAncestor && kw.instance === instance
        );
        if (keywordIndex !== -1) {
            const synonymIndex = keywords[keywordIndex].synset.indexOf(synonym);
            if (synonymIndex !== -1) {
                console.log(`Modifying synonym: ${synonym} for keywordIndex: ${keywordIndex} at synonymIndex: ${synonymIndex}`);
                SynonymClick(synonym, keywordIndex, synonymIndex, setKeywords);
            }
        }
    };

    // 키워드 수정 클릭 시 처리하는 함수
    const handleModifyKeywordClick = (uniqueBeginner: string, nearestAncestor: string, instance: string) => {
        const keywordIndex = keywords.findIndex(
            (kw) => kw.unique_beginner === uniqueBeginner && kw.nearest_ancestor === nearestAncestor && kw.instance === instance
        );
        if (keywordIndex !== -1) {
            console.log(`Modifying keyword: ${instance} at index: ${keywordIndex}`);
            KeywordClick(instance, keywordIndex, setKeywords);
        }
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
                            {Object.entries(groupBy(Object.values(groupedByUniqueBeginner[uniqueBeginner]), 'nearest_ancestor')).map(([nearestAncestor, nestedKeywords], nearestAncestorIndex) => (
                                <React.Fragment key={`${nearestAncestor}${uniqueBeginnerIndex}${nearestAncestorIndex}`}>
                                    <tr>
                                        <td colSpan={5} style={{ paddingLeft: '20px' }}><strong className={`${styles.hovering}`}>{nearestAncestor === "" ? "none" : nearestAncestor}</strong></td>
                                    </tr>
                                    {nestedKeywords.map((keyword, keywordIndex) => {
                                        const key = `${uniqueBeginner}-${nearestAncestor}-${keyword.instance}`;
                                        return (
                                            <React.Fragment key={`${nearestAncestor}${uniqueBeginnerIndex}${keywordIndex}`}>
                                                <tr>
                                                    <td colSpan={3} style={{ paddingLeft: '40px' }}>
                                                        <span className={`${styles.hovering}`} onClick={() => handleKeywordDisplay(uniqueBeginner, nearestAncestor, keyword.instance)}>
                                                            {keyword.instance}
                                                        </span>
                                                    </td>
                                                    <td style={{ width: '80px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                                        <button className={styles.displayBtn} onClick={(e) => { e.stopPropagation(); handleModifyKeywordClick(uniqueBeginner, nearestAncestor, keyword.instance); }}>modify</button>
                                                        <button className={styles.delBtn} onClick={(e) => { e.stopPropagation(); handleDeleteKeywordClick(uniqueBeginner, nearestAncestor, keyword.instance); }}>delete</button>
                                                    </td>
                                                </tr>
                                                {expandedKeywords[key] && (
                                                    <tr>
                                                        <td colSpan={5} style={{ paddingTop: '5px', paddingBottom: '5px' }}>
                                                            <div className={styles.keywordList}>
                                                                {keyword.synset.map((synonym, synonymIndex) => (
                                                                    <div key={synonymIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', paddingLeft: '40px' }}>
                                                                        <span className={styles.hovering} onClick={() => handleModifySynonymClick(uniqueBeginner, nearestAncestor, keyword.instance, synonym)}>{synonym}</span>
                                                                        <div style={{ display: 'flex', gap: '10px', marginRight: '35px' }}>
                                                                            <button className={styles.displayBtn} onClick={(e) => { e.stopPropagation(); handleModifySynonymClick(uniqueBeginner, nearestAncestor, keyword.instance, synonym); }}>modify</button>
                                                                            <button className={styles.delBtn} onClick={(e) => { e.stopPropagation(); handleDeleteSynonymClick(uniqueBeginner, nearestAncestor, keyword.instance, synonym); }}>delete</button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <button onClick={(e) => { e.stopPropagation(); handleAddSynonymClick(uniqueBeginner, nearestAncestor, keyword.instance); }} className={`${styles.addEntity} ${styles.synonymBtn}`} style={{ marginLeft: '60px' }}>+ Synonym</button>
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
