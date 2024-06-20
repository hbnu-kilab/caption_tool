import React, { useRef, useState, useEffect } from 'react';
import styles from './Upload.module.css';

// 이벤트 핸들러 불러오기
// 이벤트 핸들러란? 사용자의 움직임에 따라 일어나는 함수
import { handleBoxCreate, handleBoxClick, handleDeleteClick } from './BoxHandlers';
import { handleCaptionClick, handleErrorCaptionClick } from './CaptionHandler';
import { SegmentClick } from './SegmentHandler';
import { EntityClick, AddEntityClick } from './EntityHandler';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleResizeMouseDown,
  handleBoxMouseDown,
} from './MouseHandlers';

// ReactDOM, rendering에 사용
import ReactDOM from 'react-dom';

// url parameter 접근을 위함
import { useParams } from 'react-router-dom';

interface Box {
  x: number; // 좌측 상단 꼭지점 x 좌표
  y: number; // 좌측 상단 꼭지점 y 좌표
  height: number; // 박스 높이
  width: number; // 박스 너비
  entity: string[]; // 감지된 물체들의 이름
  captions: string[]; // correct caption
  errorCaptions: string[]; // error caption
}

// 본격적인 페이지 코드
const Upload: React.FC = () => {
  // 리액트의 상태 변수 정의
  // js는 기본적으로 비동기 방식으로 연결됨. 
  // 따라서 데이터가 변하면 주기적으로 랜더링을 다시 해야하는데, 이 빈도가 잦으면 컴퓨터 자원을 많이 잡아먹음(모든 데이터를 기준으로 랜더링 되게 만들어선 안된다는 소리임)
  // => 리액트에서는 상태변수를 사용, 상태변수가 변할떄 랜더링 하도록 규정해둠

  const [boxes, setBoxes] = useState<Box[]>([]); // 박스 array 상태 변수
  const [newBox, setNewBox] = useState<Box | null>(null); // 새로 만드는 박스를 잠시 저장해두는 상태변수
  const [startX, setStartX] = useState<number>(0); // Box.x 가 될 변수
  const [startY, setStartY] = useState<number>(0); // Box.y 가 될 변수

  // 이벤트 핸들링을 위한 상태 변수
  const [isDragging, setIsDragging] = useState<boolean>(false); // 드래그 중인지 체크(MouseHandler에서 사용)
  const [isResizing, setIsResizing] = useState<boolean>(false); // 리사이즈 중인지 체크(MouseHandler에서 사용)
  const [movingBoxIndex, setMovingBoxIndex] = useState<number | null>(null); // 현재 움직이고 있는 박스의 인덱스(boxes array 기준)
  const [resizeIndex, setResizeIndex] = useState<number | null>(null); // 현재 리사이징 되고 있는 박스의 인덱스(boxes array 기준)

  const [selectedSegment, setSelectedSegment] = useState<boolean[]>([]); // caption으로 추가된 segment에 취소선 css를 부여하게 하기 위한 상태변수, 랜더링의 기준

  // 리액트에선 html 요소에 직접 접근을 막고, useRef나 react dom을 사용하여 접근하도록 함 
  const imageRef = useRef<HTMLImageElement>(null); // 이미지 요소에 접근하도록 하는 
  const { src: imageId } = useParams<{ src: string }>(); // url에서 src 파라미터를 받아옴, 현 페이지에서는 imageId라고 부를거임
  const [imageUrl, setImageUrl] = useState<string>(''); // 이미지 url


  // useEffect: 페이지가 처음 시작될때, 기준이 되는 상태변수가 변할때 재 실행 되는 함수
  // 페이지 시작할 때만 실행되는 useEffect
  useEffect(() => {
    console.log(1)
    // /json/splitJson/split_json_${imageId}.json에서 값을 가져옴
    fetch(`/json/splitJson/split_json_${imageId}.json`) 
      .then(response => response.json()) 
      .then(data => { // 데이터를 받아오면
        const key: string = String(Object.keys(data)[0]); // 데이터의 키 값(image_id)을 가져오기
        setImageUrl(data[key].image_data.url); // 이미지 url 세팅하기

        // json에 있는 바운딩 박스 가져오기
        data[key].new_same_regions.map((object:any, index:number)=>(
          boxes.push({
            x: object.avg_x,
            y: object.avg_y,
            height: object.avg_height,
            width: object.avg_width,
            entity: Object.keys(object.entity),
            captions: Object.keys(object.phrase),
            errorCaptions: Object.keys(object.phrase),
          })
        ))
        console.log(boxes)
      })
      .catch(error => console.error('데이터 가져오기 중 문제가 발생했습니다:', error));
  }, []);

  // selectedSegment가 변할때 재 실행 되는 useEffect
  useEffect(() => {
    console.log(2)
    fetch(`/json/splitJson/split_json_${imageId}.json`)
    .then(response => response.json()) 
    .then(data => { // 데이터를 받아오면
      const key: string = String(Object.keys(data)[0]); // 데이터의 키 값(image_id)을 가져오기
      setImageUrl(data[key].image_data.url); // 이미지 url 세팅하기

      let cocoCaptions:string[] = data[key].image_data.coco_caption
      const longCaptionString = cocoCaptions.join('\n'); // coco_caption을 합쳐 string으로 만들기

      // long 캡션 생성
      const textarea = document.getElementById('longcaption') as HTMLInputElement;
      if (textarea) {
        textarea.value = longCaptionString;
      }
      // cocoCaptions의 길이만큼 selectedSegment에 false 값 넣기(true로 변환될 시 취소선이 생기도록 함)
      if (selectedSegment.length < cocoCaptions.length) {
        const newSelectedSegment = Array(cocoCaptions.length).fill(false);
        setSelectedSegment(newSelectedSegment);
      }
      // segment caption 리스트 생성 
      const captionList = cocoCaptions.map((caption, index) => (
        <tr
          key={`segment${index}`}
          onClick={() => {
            if (!selectedSegment[index]) {
              SegmentClick(caption, index, setBoxes, setSelectedSegment);
            }
          }}
          className={`${selectedSegment[index] ? styles.select : ''} ${styles.hovering}`}
        >
          {caption}
        </tr>
      ));
      ReactDOM.render(<tbody>{captionList}</tbody>, document.getElementById('captionList'));
    })
    .catch(error => console.error('데이터 가져오기 중 문제가 발생했습니다:', error));
    
  }, [selectedSegment]);

  // =============================================================================================
  // 헤더에 있는 버튼, 이전이나 다음 페이지로 이동 시 현재까지 변경된 사항들이 저장되도록 하기
  // prev 버튼 실행시 적용되는 함수
  const prevPage = () =>{
    if (imageId !== "1") window.location.href = `http://localhost:3000/upload/${Number(imageId)-1}`

    
  }
  // next 버튼 실행시 적용되는 함수
  const nextPage = () =>{
    if (imageId !== "2186") window.location.href = `http://localhost:3000/upload/${Number(imageId)+1}`

    // 현재까지 변경된 사항들이 저장되도록 하기
  }
  // ==============================================================================================
  // display none
  const handleBoxDisplay = (index:number) => {
    let box = document.getElementById(`box${index}`);
    let displayBtn = document.getElementById(`displayBtn${index}`);
    if (box !== null &&displayBtn !== null){
      console.log(box.style.display)
      if (box.style.display === 'none'){
        box.style.display = 'inline'
        displayBtn.style.backgroundColor = 'rgb(142, 154, 184)'
        displayBtn.innerHTML = "ON"
      }
      else {
        box.style.display = 'none'
        displayBtn.style.backgroundColor = 'rgb(172, 176, 185)'
        displayBtn.innerHTML = "OFF"

      }
    }
  }

  const handleEntityDisplay = (index:number, entityName:string) => {
    let entity = document.getElementById(`entity${index}`);
    let entityList = document.getElementById(`entityList${index}`);

    if (entity !== null && entityList!== null){
      if (entityList.style.display === 'none'){
        entityList.style.display = 'table-row';
        if (entity.innerHTML !== 'none   ▼') entity.innerHTML =  `${entityName}   ▲`
        else entity.innerHTML =  `none   ▲`

      }
      else {
        entityList.style.display = 'none'
        if (entity.innerHTML !== 'none   ▲') entity.innerHTML = `${entityName}   ▼`
        else entity.innerHTML =  `none   ▼`

      }
    }
  }
  // ==============================================================================================
  // return에서 html 렌더링
  return (
    <div className={`${styles.flexContainer}`}>
      {/* 헤더(< 이전 / 다음 > 페이지로 이동) */}
      {/* 현정이는 여기를 신경써주면 될 것 같아! */}
      <div className={`${styles.nav}`}>
        <button className={`${imageId !== "1"? styles.button : styles.deadButton}`} onClick={prevPage}>◀ prev</button>
        <button className={`${imageId !== "2186"? styles.button : styles.deadButton}`} onClick={nextPage}>next ▶</button>
      </div>
      {/* 바디 박스 */}
      <div className={`${styles.innerDiv}`}>
        <h1>이미지 캡션 데이터 구축</h1>
        {/* 바운딩 박스 */}
        <div
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseDown={e => handleMouseDown(e, imageRef, setStartX, setStartY, setIsDragging)}
          onMouseMove={e =>
            handleMouseMove(
              e,
              imageRef,
              isResizing,
              resizeIndex,
              boxes,
              setBoxes,
              isDragging,
              startX,
              startY,
              setNewBox,
              movingBoxIndex,
              setStartX,
              setStartY
            )
          }
          onMouseUp={() =>
            handleMouseUp(
              isResizing,
              setIsResizing,
              setResizeIndex,
              isDragging,
              newBox,
              setBoxes,
              setIsDragging,
              setNewBox,
              movingBoxIndex,
              setMovingBoxIndex,
              handleBoxCreate
            )
          }
        >
          <img ref={imageRef} src={`${String(imageUrl)}`} alt="Upload" />
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
              id={`box${index}`}
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
              onMouseDown={e => handleBoxMouseDown(index, e, imageRef, setStartX, setStartY, setMovingBoxIndex)}
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
                onMouseDown={e => handleResizeMouseDown(index, e, setIsResizing, setResizeIndex)}
              />
            </div>
          ))}
        </div>
        {boxes.length > 0 && (
          <div>
            <h2>Boxes</h2>
            <h3>박스 entity name을 클릭하면 수정할 수 있습니다.</h3>
            <table>
                {boxes.map((box, boxIndex) => (
                  <tbody>
                  <tr key={`box${boxIndex}`}>
                    <td>
                      <span>{boxIndex}</span>
                    </td>
                    <td className={`${styles.hovering}`}> 
                      <span id={`entity${boxIndex}`}
                      onClick={() => handleEntityDisplay(boxIndex, box.entity[0])}>{box.entity.length>0?`${box.entity[0]}   ▼`:'none   ▼'}</span>
                      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>{/* 단순 띄어쓰기, 의미 없음 */}
                    </td>
                    <td>
                      <button onClick={() => handleBoxClick(boxIndex, setBoxes)} className={`${styles.addBtn}`}>
                        + Caption
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteClick(boxIndex, setBoxes)} className={`${styles.delBtn}`}>
                         Delete
                      </button>
                    </td>
                    <td>
                      <button id={`displayBtn${boxIndex}`} onClick={() => handleBoxDisplay(boxIndex)} className={`${styles.displayBtn}`}>
                        ON
                      </button>
                    </td>
                  </tr>
                  <tr 
                  key={`entityList${boxIndex}`} 
                  id={`entityList${boxIndex}`}
                  style={{
                    position: 'relative',
                    display:'none',
                    width: '100%'
                  }}>
                    <td></td>
                    <td colSpan={4}>
                      <div className={`${styles.entityList}`}>
                        {boxes[boxIndex].entity.map((entity, entityIndex) => (
                          <li
                          key={ `entity${boxIndex}${entityIndex}`}
                          onClick={() => EntityClick(entity, entityIndex, boxIndex, setBoxes)}
                          className={`${styles.hovering}`}
                          >{entity}</li>
                        ))}
                        <button
                        onClick={() => AddEntityClick(boxIndex, setBoxes)}
                        className={`${styles.addEntity}`}>+ Entity</button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                ))}
            </table>
          </div>
        )}
      </div>
      {/* 캡션 div */}
      <div className={`${styles.innerDiv}`}>
        <div>
          <h1>Caption</h1>
          <h2>Long caption</h2>
          <h3>전반적인 이미지에 대한 설명</h3>
          {/* textaread의 readOnly  속성을 제거하면 내용을 고칠 수 있음~ */}
          <textarea id="longcaption" className={`${styles.fixedTextarea} ${styles.longCaption}`} readOnly></textarea>
        </div>
        <div>
          <h2>Segments of Long caption</h2>
          <h3>segment를 클릭하여 알맞은 박스 인덱스를 입력해주세요</h3>
          <table id="captionList"></table>
        </div>

        {/* correct caption */}
        <div className={`${styles.flexContainer}`}>
          <div className={`${styles.captionContainer}`}>
            <h2>correct caption set</h2>
            <h3>박스에 대한 <b>정확한 설명</b>을 입력해주세요.
              <br/>텍스트를 클릭하면 수정할 수 있습니다. </h3>
            {boxes.length > 0 && (
              <div className={`${styles.captionSet}`}>
                <table>
                  <tbody>
                    {boxes.map((box, boxIndex) => (
                      <React.Fragment key={`correctCaption${boxIndex}`}>
                        {box.captions.length > 0 &&
                          box.captions.map((caption, captionIndex) => (
                            <tr key={`correctCaption${boxIndex}${captionIndex}`} className={`${styles.hovering}`}>
                              <td>
                                <span onClick={() => handleCaptionClick(boxIndex, captionIndex, caption, setBoxes)}>
                                  ({boxIndex}-{captionIndex})
                                </span>
                              </td>
                              <td>
                                <span onClick={() => handleCaptionClick(boxIndex, captionIndex, caption, setBoxes)}>
                                  {caption}
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

          {/*  */}
          <div className={`${styles.captionContainer}`}>
            <h2>error caption set</h2>
            <h3>박스에 대해 <b>틀린</b> 설명을 입력해주세요. <br/>텍스트를 클릭하면 수정할 수 있습니다.</h3>
            {boxes.length > 0 && (
              <div className={`${styles.captionSet}`}>
                <table>
                  <tbody>
                    {boxes.map((box, boxIndex) => (
                      <React.Fragment key={`errorCaption${boxIndex}`}>
                        {box.errorCaptions.length > 0 &&
                          box.errorCaptions.map((caption, captionIndex) => (
                            <tr key={`errorCaption${boxIndex}${captionIndex}`} className={`${styles.hovering}`}>
                              <td>
                                <span
                                  onClick={() =>
                                    handleErrorCaptionClick(boxIndex, captionIndex, caption, setBoxes)
                                  }
                                >
                                  ({boxIndex}-{captionIndex})
                                </span>
                              </td>
                              <td>
                                <span
                                  onClick={() =>
                                    handleErrorCaptionClick(boxIndex, captionIndex, caption, setBoxes)
                                  }
                                >
                                  {caption}
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
