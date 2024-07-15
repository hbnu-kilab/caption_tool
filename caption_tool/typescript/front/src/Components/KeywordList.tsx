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
    const [movingKeyword, setMovingKeyword] = useState<{ instance: string; uniqueBeginner: string; nearestAncestor: string } | null>(null);
    const [history, setHistory] = useState<Keyword[][]>([]);

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
            addSynonymClick(keywordIndex, setKeywords, setHistory);
        }
    };

    // 키워드 삭제 클릭 시 처리하는 함수
    const handleDeleteKeywordClick = (uniqueBeginner: string, nearestAncestor: string, instance: string) => {
        const keywordIndex = keywords.findIndex(
            (kw) => kw.unique_beginner === uniqueBeginner && kw.nearest_ancestor === nearestAncestor && kw.instance === instance
        );
        if (keywordIndex !== -1) {
            console.log(`Deleting keyword: ${instance} at index: ${keywordIndex}`);
            delKeywordClick(instance, keywordIndex, setKeywords, setHistory);
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
                delSynonymClick(synonym, keywordIndex, synonymIndex, setKeywords, setHistory);
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
                SynonymClick(synonym, keywordIndex, synonymIndex, setKeywords, setHistory);
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
            KeywordClick(instance, keywordIndex, setKeywords, setHistory);
        }
    };

    // 키워드 이동 클릭 시 처리하는 함수
    const handleMoveKeywordClick = (uniqueBeginner: string, nearestAncestor: string, instance: string) => {
        console.log(`Moving keyword: ${instance} from ${uniqueBeginner} - ${nearestAncestor}`);
        if (movingKeyword && movingKeyword.instance === instance) {
            setMovingKeyword(null); // 이동 모드 취소
        } else {
            setMovingKeyword({ instance, uniqueBeginner, nearestAncestor });
        }
    };

    // 키워드를 새로운 nearest_ancestor로 이동하는 함수
    const handleMoveKeyword = (newUniqueBeginner: string, newNearestAncestor: string) => {
        if (movingKeyword) {
            console.log(`Moving keyword to ${newUniqueBeginner} - ${newNearestAncestor}`);
            setHistory((prevHistory) => [...prevHistory, JSON.parse(JSON.stringify(keywords))]); // 현재 상태를 깊은 복사로 히스토리에 저장
            setKeywords((prevKeywords) => {
                const keywordIndex = prevKeywords.findIndex(
                    (kw) => kw.unique_beginner === movingKeyword.uniqueBeginner && kw.nearest_ancestor === movingKeyword.nearestAncestor && kw.instance === movingKeyword.instance
                );

                if (keywordIndex !== -1) {
                    const newKeywords = [...prevKeywords];
                    newKeywords[keywordIndex] = {
                        ...newKeywords[keywordIndex],
                        unique_beginner: newUniqueBeginner,
                        nearest_ancestor: newNearestAncestor,
                    };
                    return newKeywords;
                }
                return prevKeywords;
            });
            setMovingKeyword(null); // 이동 후 상태 초기화
            document.body.style.cursor = 'default'; // 마우스 커서 초기화
        }
    };

    // 이전 상태로 되돌리는 함수
    const handleUndo = () => {
        setHistory((prevHistory) => {
            if (prevHistory.length === 0) return prevHistory;
            const newHistory = [...prevHistory];
            const lastState = newHistory.pop();
            if (lastState) setKeywords(lastState);
            return newHistory;
        });
    };

    return (
        <>
            <h1>Keyword of instance</h1>
            <button onClick={() => addKeywordsClick(setKeywords, setHistory)} className={styles.addKeyword}>+ Keyword</button>
            <button onClick={handleUndo} className={styles.undoButton}>Undo</button>
            <br />
            <br />
            <div className={`${styles.keywordSet} ${styles.radius}`}>
                <table style={{ width: '100%', tableLayout: 'fixed' }}>
                    {Object.keys(groupedByUniqueBeginner).sort().map((uniqueBeginner, uniqueBeginnerIndex) => (
                        <React.Fragment key={`${uniqueBeginner}${uniqueBeginnerIndex}`}>
                            <tr>
                                <td colSpan={5}><strong>{uniqueBeginner === "" ? "none" : uniqueBeginner}</strong></td>
                            </tr>
                            {Object.entries(groupBy(Object.values(groupedByUniqueBeginner[uniqueBeginner]), 'nearest_ancestor')).map(([nearestAncestor, nestedKeywords], nearestAncestorIndex) => (
                                <React.Fragment key={`${nearestAncestor}${uniqueBeginnerIndex}${nearestAncestorIndex}`}>
                                    <tr
                                        onMouseEnter={() => {
                                            if (movingKeyword) {
                                                document.body.style.cursor = 'pointer';
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (movingKeyword) {
                                                document.body.style.cursor = 'default';
                                            }
                                        }}
                                        onClick={() => {
                                            if (movingKeyword) {
                                                handleMoveKeyword(uniqueBeginner, nearestAncestor);
                                            }
                                        }}
                                        className={movingKeyword ? styles.hoveringNearestAncestor : ''}
                                    >
                                        <td colSpan={5} style={{ paddingLeft: '20px' }}><strong className={`${styles.hovering}`}>{nearestAncestor === "" ? "none" : nearestAncestor}</strong></td>
                                    </tr>
                                    {nestedKeywords.map((keyword, keywordIndex) => {
                                        const key = `${uniqueBeginner}-${nearestAncestor}-${keyword.instance}`;
                                        return (
                                            <React.Fragment key={`${nearestAncestor}${uniqueBeginnerIndex}${keywordIndex}`}>
                                                <tr>
                                                    <td colSpan={3} style={{ paddingLeft: '40px' }}>
                                                        <span
                                                            className={`${styles.hovering} ${movingKeyword && movingKeyword.instance === keyword.instance && movingKeyword.nearestAncestor === nearestAncestor ? styles.movingKeyword : ''}`}
                                                            onClick={() => handleKeywordDisplay(uniqueBeginner, nearestAncestor, keyword.instance)}
                                                            style={{ color: movingKeyword && movingKeyword.instance === keyword.instance && movingKeyword.nearestAncestor === nearestAncestor ? 'darkblue' : 'inherit' }}
                                                        >
                                                            {keyword.instance}
                                                        </span>
                                                    </td>
                                                    <td style={{ width: '150px', display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                                                        <button style={movingKeyword && movingKeyword.instance === keyword.instance?{backgroundColor: "rgb(53, 76, 194)", color: "white", border: "0", marginLeft: "10px", padding: "5px 7px", borderRadius: "5px"}:{backgroundColor: "rgb(29, 31, 37)", color: "white", border: "0", marginLeft: "10px", padding: "5px 7px", borderRadius: "5px"}} className={styles.displayBtn} onClick={(e) => { e.stopPropagation(); handleMoveKeywordClick(uniqueBeginner, nearestAncestor, keyword.instance); }}>{movingKeyword && movingKeyword.instance === keyword.instance ? 'cancel' : 'move'}</button>
                                                        <button style={{margin:"0 0"}} className={styles.displayBtn} onClick={(e) => { e.stopPropagation(); handleModifyKeywordClick(uniqueBeginner, nearestAncestor, keyword.instance); }}>modify</button>
                                                        <button style={{margin:"0 0"}} className={styles.delBtn} onClick={(e) => { e.stopPropagation(); handleDeleteKeywordClick(uniqueBeginner, nearestAncestor, keyword.instance); }}>delete</button>
                                                    </td>
                                                </tr>
                                                {expandedKeywords[key] && (
                                                    <tr>
                                                        <td colSpan={5} style={{ paddingTop: '5px', paddingBottom: '5px' }}>
                                                            <div className={styles.keywordList}>
                                                                {keyword.synset.map((synonym, synonymIndex) => (
                                                                    <div key={synonymIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', paddingLeft: '60px' }}>
                                                                        <span className={styles.hovering} >{synonym}</span>
                                                                        <div style={{ display: 'flex', gap: '10px', marginRight: '90px' }}>
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
