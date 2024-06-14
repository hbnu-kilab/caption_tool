// 이미지 src와 매칭되는 Caption
import React, { useRef, useState, useEffect } from 'react';
import styles from './Upload.module.css';

import { handleBoxClick, handleDeleteClick } from './BoxHandlers'; // Box 클릭 및 제거 관련
import { handleCaptionClick, handleErrorCaptionClick } from './CaptionHandler'; // 캡션 클릭시 수정 및 삭제 관련
import { SegmentClick } from './SegmentHandler'; // 세그먼트 클릭 처리 관련

import ReactDOM from 'react-dom';
import { useParams } from 'react-router-dom'; //src

// 드래그 박스 객체를 만들기 위한 인터페이스
interface Box {
  x: number;
  y: number;
  height: number;
  width: number;
  captions: string[];
  errorCaptions: string[];
}

const Upload: React.FC = () => {
  // react 상태 변수: react는 상태가 변할때 rerendering 되도록 선택할 수 있음
  const [boxes, setBoxes] = useState<Box[]>([]); // box 배열
  const [newBox, setNewBox] = useState<Box | null>(null); // 새로운 박스
  const [startX, setStartX] = useState(0); // 새로운 박스 시작 x 좌표
  const [startY, setStartY] = useState(0); // 새로운 박스 시작 y 좌표

  const [isDragging, setIsDragging] = useState(false); // 현재 박스를 드래그 중인지 여부
  const [isResizing, setIsResizing] = useState(false); // 리사이징 중인지 여부
  const [movingBoxIndex, setMovingBoxIndex] = useState<number | null>(null); // 이동 중인 박스 인덱스
  const [resizeIndex, setResizeIndex] = useState<number | null>(null); // 리사이징 중인 박스 인덱스

  const [selectedSegment, setSelectedSegment] = useState<boolean[]>([]); // 세그먼트 클릭 여부를 저장하는 배열

  const imageRef = useRef<HTMLImageElement>(null); // 이미지 엘리먼트에 접근하기 위한 useRef
  const { src } = useParams(); // URL 파라미터로부터 src 값 가져오기
  const [imageSrc, setImageSrc] = useState<number>(Number(src)); // 이미지 src 값

  // JSON 데이터 가져오기
  useEffect(() => {
    fetch('/json/coco_dev_etri_1sample.json')
      .then(response => response.json())
      .then(data => {
        const cocoCaptions: string[] = data['2415093'].origin_data.coco.coco_captions; // 장문 캡션 세그먼트 목록
        let longCaptionString: string = cocoCaptions.join('\n'); // 장문 캡션 문자열
        const boundingBoxes = data['2415093'].etri_version.groups // 바운딩 박스 그룹 arr

        // selectedSegment 배열 false로 초기화
        if (selectedSegment.length < cocoCaptions.length) {
          const newSelectedSegment = Array(cocoCaptions.length).fill(false);
          setSelectedSegment(newSelectedSegment);
        }

        // 장문 캡션 텍스트 영역 업데이트
        const textarea = document.getElementById('longcaption') as HTMLInputElement;
        if (textarea) {
          textarea.value = longCaptionString;
        }

        // 세그먼트 캡션 목록 업데이트
        const captionList = cocoCaptions.map((caption, index) => (
          <li
            key={index}
            onClick={() => {if (!selectedSegment[index]) {
              SegmentClick(caption, index, setBoxes, setSelectedSegment);
            }}}
            className={`${selectedSegment[index] ? styles.select : ''}`}
          >
            {caption}
          </li>
        ));
        ReactDOM.render(<ul>{captionList}</ul>, document.getElementById('captionList'));
      })
      .catch(error => console.error('데이터 가져오기 중 문제가 발생했습니다:', error));
  }, [selectedSegment]); // (의존성 배열, 배열이 재설정 되면 rerendering)selectedSegment가 변경될 때마다 useEffect 실행

  // 이미지 클릭시 바운딩 박스 생성
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setStartX(x);
    setStartY(y);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isResizing && resizeIndex !== null) {
      const { left, top } = imageRef.current!.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const updatedBoxes = [...boxes];
      updatedBoxes[resizeIndex] = {
        ...updatedBoxes[resizeIndex],
        width: Math.abs(updatedBoxes[resizeIndex].x - x),
        height: Math.abs(updatedBoxes[resizeIndex].y - y),
      };
      setBoxes(updatedBoxes);
    } else if (isDragging && imageRef.current) {
      const { left, top } = imageRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      setNewBox({
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        height: Math.abs(startY - y),
        width: Math.abs(startX - x),
        captions: [],
        errorCaptions: [],
      });
    } else if (movingBoxIndex !== null) {
      const { left, top } = imageRef.current!.getBoundingClientRect();
      const width = imageRef.current!.getBoundingClientRect().width;
      const height = imageRef.current!.getBoundingClientRect().height;
      const x = e.clientX - left;
      const y = e.clientY - top;

      let dx = x - boxes[movingBoxIndex].x;
      let dy = y - boxes[movingBoxIndex].y;

      const maxDx = width - (boxes[movingBoxIndex].width + boxes[movingBoxIndex].x);
      const maxDy = height - (boxes[movingBoxIndex].height + boxes[movingBoxIndex].y);

      if (dx > maxDx) dx = maxDx;
      if (dy > maxDy) dy = maxDy;

      const updatedBoxes = [...boxes];
      const box = updatedBoxes[movingBoxIndex];
      updatedBoxes[movingBoxIndex] = {
        ...box,
        x: box.x + dx,
        y: box.y + dy,
      };
      setBoxes(updatedBoxes);
      setStartX(x);
      setStartY(y);
    }
  };

  // 드래그 종료시 박스 추가 및 리사이징 완료 처리
  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizeIndex(null);
    } else if (isDragging && newBox) {
      if (newBox.width > 2 && newBox.height > 2) {
        setBoxes(prevBoxes => {
          const updatedBoxes = [...prevBoxes, newBox];
          setTimeout(() => handleBoxClick(updatedBoxes.length - 1, setBoxes), 0);
          return updatedBoxes;
        });
      }
      setIsDragging(false);
      setNewBox(null);
    } else if (movingBoxIndex !== null) {
      setMovingBoxIndex(null);
    }
  };

  const handleResizeMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeIndex(index);
  };

  // 박스 클릭시 이동 처리
  const handleBoxMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const { left, top } = imageRef.current!.getBoundingClientRect();
    setStartX(e.clientX - left);
    setStartY(e.clientY - top);
    setMovingBoxIndex(index);
  };

  // 이미지 변경 함수
  const clickSubmit = () => {
    setImageSrc(imageSrc + 1);
    
  };

  return (
    <div className={`${styles.flexContainer}`}>
      <div className={`${styles.innerDiv}`}>
        <h1>이미지 캡션 데이터 구축</h1>
        <div
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img ref={imageRef} src={`https://cs.stanford.edu/people/rak248/VG_100K_2/${String(imageSrc)}.jpg`} alt="Upload" />
          {newBox && (
            <div
              className="caption-box"
              style={{
                border: '2px solid red',
                left: newBox.x,
                top: newBox.y,
                width: newBox.width,
                height: newBox.height,
                position: 'absolute',
              }}
            ></div>
          )}
          {boxes.map((box, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                border: '2px solid blue',
                left: `${box.x}px`,
                top: `${box.y}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
                cursor: 'pointer',
              }}
              onMouseDown={e => handleBoxMouseDown(index, e)}
            >
              {box.captions && (
                <div
                  style={{
                    position: 'absolute',
                    backgroundColor: 'white',
                    padding: '2px',
                    border: '1px solid black',
                    top: '-20px',
                    left: '0',
                  }}
                >
                  {index}
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'blue',
                  right: 0,
                  bottom: 0,
                  cursor: 'se-resize',
                }}
                onMouseDown={e => handleResizeMouseDown(index, e)}
              />
            </div>
          ))}
        </div>
        {boxes.length > 0 && (
          <div>
            <h2>Boxes:</h2>
            <table>
              <tbody>
                {boxes.map((box, index) => (
                  <tr key={index}>
                    <td>
                      <span onClick={() => handleBoxClick(index, setBoxes)}>{index}</span>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteClick(index, setBoxes)} className={`${styles.delBtn}`}>
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className={`${styles.innerDiv}`}>
        <div>
          <h2>Long caption</h2>
          <h3>전반적인 이미지에 대한 설명</h3>
          <textarea id="longcaption" className={`${styles.fixedTextarea} ${styles.longCaption}`} readOnly></textarea>
        </div>
        <div>
          <h3>Long caption의 segments</h3>
          <ul id="captionList"></ul>
        </div>
        <div className={`${styles.flexContainer}`}>
          {/* correct set */}
          <div className={`${styles.captionContainer}`}>
            <h2>correct caption set</h2>
            {boxes.length > 0 && (
              <div className={`${styles.captionSet}`}>
                <table>
                  <tbody>
                    {boxes.map((box, boxIndex) => (
                      <React.Fragment key={boxIndex}>
                        {box.captions.length > 0 &&
                          box.captions.map((caption, captionIndex) => (
                            <tr key={captionIndex}>
                              <td>
                                <span onClick={() => handleCaptionClick(boxIndex, captionIndex, caption, setBoxes)}>
                                  {boxIndex}-{captionIndex} {caption}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* error set */}
          <div className={`${styles.captionContainer}`}>
            <h2>error caption set</h2>
            {boxes.length > 0 && (
              <div className={`${styles.captionSet}`}>
                <table>
                  <tbody>
                    {boxes.map((box, boxIndex) => (
                      <React.Fragment key={boxIndex}>
                        {box.errorCaptions.length > 0 &&
                          box.errorCaptions.map((caption, captionIndex) => (
                            <tr key={captionIndex}>
                              <td>
                                <span
                                  onClick={() =>
                                    handleErrorCaptionClick(boxIndex, captionIndex, caption, setBoxes)
                                  }
                                >
                                  {boxIndex}-{captionIndex} {caption}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
