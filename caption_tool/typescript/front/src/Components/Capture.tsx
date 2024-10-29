import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import styles from './Upload.module.css';

// 이벤트 핸들러 불러오기
// 이벤트 핸들러란? 사용자의 움직임에 따라 일어나는 함수
import { handleBoxClick, handleDeleteClick, handleBoxDisplay } from './BoxHandlers';
import { handleAddCaption, handleAddErrorCaption, handleCaptionClick, handleErrorCaptionClick, delCaptionClick, delErrorCaptionClick } from './CaptionHandler';

import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleResizeMouseDown,
  handleBoxMouseDown,
} from './CoreMouseHandlers';

// ReactDOM, rendering에 사용
import ReactDOM from 'react-dom';

// url parameter 접근을 위함
import { useParams } from 'react-router-dom';
import CorrectCaption from './CoreCorrectCaption';
import BoundBoxNavigation from './BoundBoxNavigation';
import BoundBoxes from './CaptureBoundBoxes';
import { Box } from './CoreJsonInterface';

/**
 * @description
 * 추가되거나, 수정되거나 변경사항이 있는 부분에 대한 상태를 따로 유지하기 위해 작성되었습니다.
 * 새로운 json 파일을 산출하기 위해 REST API 서버와 작업을 수행할 때,
 * 해당 요소를 활용하여 새로운 필드를 구분합니다.
 * @endpoint [POST] :4000/process
 * @body { jsonIndex: number; json: string }
 * @warning json 데이터셋의 용어 구분, 명칭에 혼란이 있어 임의로 작성되었으니 수정 및 변경 바랍니다.
 */

// 본격적인 페이지 코드
const Capturing: React.FC = () => {
  // 리액트의 상태 변수 정의
  // js는 기본적으로 비동기 방식으로 연결됨.
  // 따라서 데이터가 변하면 주기적으로 랜더링을 다시 해야하는데, 이 빈도가 잦으면 컴퓨터 자원을 많이 잡아먹음(모든 데이터를 기준으로 랜더링 되게 만들어선 안된다는 소리임)
  // => 리액트에서는 상태변수를 사용, 상태변수가 변할떄 랜더링 하도록 규정해둠

  const [boxes, setBoxes] = useState<Box[]>([]); // 박스 array 상태 변수
  // 변경되거나 추가되는 box 요소에 대해 따로 보관하여 JSON 파일에 추가하는 목적의 상태 ( AddedState JSDoc 참고 )

  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number>(0);

  const [newBox, setNewBox] = useState<Box | null>(null); // 새로 만드는 박스를 잠시 저장해두는 상태변수
  const [startX, setStartX] = useState<number>(0); // Box.x 가 될 변수
  const [startY, setStartY] = useState<number>(0); // Box.y 가 될 변수

  // 이벤트 핸들링을 위한 상태 변수
  const [isDragging, setIsDragging] = useState<boolean>(false); // 드래그 중인지 체크(MouseHandler에서 사용)
  const [isResizing, setIsResizing] = useState<boolean>(false); // 리사이즈 중인지 체크(MouseHandler에서 사용)
  const [movingBoxIndex, setMovingBoxIndex] = useState<number | null>(null); // 현재 움직이고 있는 박스의 인덱스(boxes array 기준)
  const [resizeIndex, setResizeIndex] = useState<number | null>(null); // 현재 리사이징 되고 있는 박스의 인덱스(boxes array 기준)

  const [selectedLongCaptionSegment, setSelectedLongCaptionSegment] = useState<boolean[]>([]); // caption으로 추가된 segment에 취소선 css를 부여하게 하기 위한 상태변수, 랜더링의 기준
  const [selectedCocoCaptionSegment, setSelectedCocoCaptionSegment] = useState<boolean[]>([]); // caption으로 추가된 segment에 취소선 css를 부여하게 하기 위한 상태변수, 랜더링의 기준

  const [longCaption, setlongCaption] = useState<string>('');

  // 리액트에선 html 요소에 직접 접근을 막고, useRef나 react dom을 사용하여 접근하도록 함
  const imageRef = useRef<HTMLImageElement>(null); // 이미지 요소에 접근하도록 하는
  const { src: imageId } = useParams<{ src: string }>(); // url에서 src 파라미터를 받아옴, 현 페이지에서는 imageId라고 부를거임

  const [imageUrl, setImageUrl] = useState<string>(''); // 이미지 url
  const [ VGId, setVGId ] = useState<string>(''); // url에서 src 파라미터를 받아옴, 현 페이지에서는 imageId라고 부를거임
  const [loadedImage, setLoadedImage] = useState<string | null>(null);


  interface OriginalJsonType {
    [key: string]: any; // 기존 JSON 데이터의 키가 무엇이든 상관없이 모두 any 타입으로 지정
  }

  const [originalJson, setOriginalJson] = useState<OriginalJsonType>({});

  //const [originalJson, setOriginalJson] = useState({});

  // useEffect: 페이지가 처음 시작될때, 기준이 되는 상태변수가 변할때 재 실행 되는 함수
  // 페이지 시작할 때만 실행되는 useEffect
  useEffect(() => {
    console.log(1)
    // /json/splitJson/split_json_${imageId}.json에서 값을 가져옴
    fetch(`/json/coreJson/core_${imageId}.json`)
      .then(response => response.json())
      .then(data => { // 데이터를 받아오면
        const key: string = String(Object.keys(data)[0]); // 데이터의 키 값(image_id)을 가져오기
        console.log(data)
        console.log({ key })
        setVGId(key)
        setOriginalJson(data[key]); // 기존 JSON 데이터를 상태로 저장
        setImageUrl(data[key].image_url); // 이미지 url 세팅하기

        // json에 있는 바운딩 박스 가져오기
        console.log(`박스 가져오기 시작~`)
        data[key]['regions'].map((object:any)=>(
          boxes.push({
            id: object.id,
            color: object.color,
            x: object.x,
            y: object.y,
            height: object.height,
            width: object.width,
            captions: object.captions.map((item: any) => item.caption),
            object_ids: object.object_ids,
            relationships: object.relationships,
          })
        ))
        boxes.sort((a,b)=>Number(a.id.split("_")[1]) - Number(b.id.split("_")[1]))
        setBoxes(boxes.slice(0,8))
        console.log(`box: ${boxes}`)
        console.log(`왜 안뜰까?`)
      })
      .catch(error => console.error('데이터 가져오기 중 문제가 발생했습니다:', error));
  }, [imageId]);

  // selectedSegment들이 변할때 재 실행 되는 useEffect
  useEffect(() => {
    console.log(2)
    fetch(`/json/coreJson/core_${imageId}.json`)
    .then(response => response.json())
    .then(data => { // 데이터를 받아오면
      const key: string = String(Object.keys(data)[0]); // 데이터의 키 값(image_id)을 가져오기
      setImageUrl(data[key].image_url); // 이미지 url 세팅하기
    })
    .catch(error => console.error('데이터 가져오기 중 문제가 발생했습니다:', error));
  }, [selectedLongCaptionSegment, selectedCocoCaptionSegment, longCaption]);

  // =============================================================================================
  // 헤더에 있는 버튼, 이전이나 다음 페이지로 이동 시 현재까지 변경된 사항들이 저장되도록 하기
  // prev 버튼 실행시 적용되는 함수
  const prevPage = () =>{
    if (imageId !== "1") window.location.href = `http://localhost:3000/capture/${Number(imageId)-1}`
    // 현재까지 변경된 사항들이 저장되도록 하기
  }
  // next 버튼 실행시 적용되는 함수
  const nextPage = () =>{
    if (imageId !== "2186") window.location.href = `http://localhost:3000/capture/${Number(imageId)+1}`

    // 현재까지 변경된 사항들이 저장되도록 하기
  }
  // const saveButton = (event:any) => {
  //       event.preventDefault(); 
  //       const updatedJson = {
  //           ...originalJson, // 기존 JSON 데이터 유지
  //           new_localizednarratives: longCaption,
  //           new_bounding_boxes: boxes.map((box) => ({
  //               id: box.id,
  //               object_ids: box.object_ids,
  //               x: box.x,
  //               y: box.y,
  //               width: box.width,
  //               height: box.height,
  //               relationship: box.relationships,
  //               captions: box.captions,
  //           })),
  //       };

  //       fetch('http://localhost:4000/process', {
  //           method: 'POST',
  //           headers: {
  //               'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({ jsonIndex: imageId, json: updatedJson }),
  //       })
  //           .then((response) => {
  //               if (response.ok) {
  //                   alert('저장되었습니다.');
  //               } else {
  //                   alert('저장 중 오류가 발생했습니다.');
  //               }
  //           })
  //           .catch((error) => {
  //               console.error('저장 중 오류가 발생했습니다:', error);
  //               alert('저장 중 오류가 발생했습니다.');
  //           });
  //   };



    // ==============================================================================================

  const handleBoxSelect = (index: number) => {
    setSelectedBoxIndex(index);
  };

  const onHandleMouseMove = (e: MouseEvent<HTMLDivElement>) =>
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
    );

  const onHandleMouseUp = () =>
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
    );

  const saveLongcaption = () => {
    const textarea = document.getElementById('longCaption') as HTMLInputElement;
    let innerlongCaption:string = String(textarea.value);
    console.log("update longcaption")
    setlongCaption(innerlongCaption)
    if (textarea){
      textarea.value = innerlongCaption
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
        <div className={`${styles.headerControlSection}`}>
          {/* <button className={`${styles.saveButton}`} onClick={saveButton}>💾 save</button> */}
          <button className={`${imageId !== "2186"? styles.button : styles.deadButton}`} onClick={nextPage}>next ▶</button>
        </div>
      </div>
      {/* 바디 박스 */}
      <div className={`${styles.innerDiv}`}>
        <h1>이미지 캡션 데이터 구축</h1>
        {/* 바운딩 박스 */}
        <BoundBoxes
          boxes={boxes}
          onMouseMove={onHandleMouseMove}
          onMouseUp={onHandleMouseUp}
          onMouseDown={e => handleMouseDown(e, imageRef, setStartX, setStartY, setIsDragging)}
          onBoxMouseDown={e => index => handleBoxMouseDown(index, e, imageRef, setStartX, setStartY, setMovingBoxIndex)}
          onResizeMouseDown={e => index => handleResizeMouseDown(index, e, setIsResizing, setResizeIndex) }
          imageRef={imageRef}
          imageUrl={imageUrl}
          newBox={newBox}
          selectedBoxIndex={selectedBoxIndex}
          onBoxSelect={handleBoxSelect}
        />
        {/* ===================================================================================== */}
        {/* floating box */}
        {/* <BoundBoxNavigation boxes={boxes} setBoxes={setBoxes} /> */}
      </div>
      {/* ===================================================================================== */}
      <div className={`${styles.innerDiv} ${styles.overflowY}`}>
      {/* ===================================================================================== */}
        {/* <div>
          <h1>Caption</h1>
          <h2>Long caption</h2>
          <h3>전반적인 이미지에 대한 설명</h3>
          {/* textaread의 readOnly  속성을 제거하면 내용을 고칠 수 있음~ */}
          {/* <textarea id="longCaption" className={`${styles.fixedTextarea} ${styles.longCaption} ${styles.radius}`}></textarea>
          <button onClick={() => saveLongcaption()} className={`${styles.longCaptionSave} ${styles.radius}`}>save</button>
        </div>
        <div>
          <h2>Segments of Long caption</h2>
          <h3>segment를 클릭하여 알맞은 박스 인덱스를 입력해주세요</h3>
          <table id="captionList"></table>
        </div>
        <div>
          <h2>Segments of COCO captions</h2>
          <h3>segment를 클릭하여 알맞은 박스 인덱스를 입력해주세요</h3>
          <table id="cocoCaptionList"></table>
        </div> */} 
        {/* correct caption */}
        <CorrectCaption
          boxes={boxes}
          setBoxes={setBoxes}
          selectedBoxIndex={selectedBoxIndex}
          onBoxSelect={handleBoxSelect}
        /> {/* Caption 전체 */}
      </div>
    </div>
  );
};

export default Capturing;