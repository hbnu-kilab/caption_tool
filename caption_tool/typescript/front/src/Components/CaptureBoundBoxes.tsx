import React, { useEffect, useState, MouseEvent, MutableRefObject } from 'react';
import { Box } from './CoreJsonInterface';
import styles from './Upload.module.css';
import uploadStyles from './CoreStyles';
import html2canvas from 'html2canvas'; // html2canvas import
import { useParams } from 'react-router-dom';


// 바운딩 박스 사용자 정의 컴포넌트
interface BoundBoxesProps {
  newBox?: Box;
  boxes: Box[];
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
  onBoxMouseDown: (e: MouseEvent<HTMLDivElement>) => (index: number) => void;
  onResizeMouseDown: (e: MouseEvent<HTMLDivElement>) => (index: number) => void;
  imageRef: MutableRefObject<HTMLImageElement | null>;
  imageUrl: string;
  selectedBoxIndex: number;
}

const BoundBoxes: React.FC<BoundBoxesProps> = ({
    newBox,
    boxes,
    onMouseUp,
    onMouseMove,
    onMouseDown,
    onResizeMouseDown,
    onBoxMouseDown,
    imageRef,
    imageUrl,
    selectedBoxIndex,
}
) => {
  // 이미지 및 박스를 jpg로 저장하는 함수
  // 컴포넌트가 마운트될 때 이미지를 백엔드에서 가져옴
  const [base64ImageUrl, setBase64ImageUrl] = useState<string>(''); // Base64 이미지 상태
  const { src: imageId } = useParams<{ src: string }>(); // url에서 src 파라미터를 받아옴, 현 페이지에서는 imageId라고 부를거임

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`http://localhost:4000/loadImage/proxy?url=${encodeURIComponent(imageUrl)}`);
        const base64Data = await response.text();
        setBase64ImageUrl(base64Data); // Base64 데이터를 상태로 저장
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };
    fetchImage()
  }, [imageUrl,base64ImageUrl]); // imageUrl이 변경될 때마다 새로 이미지를 로드

  const saveAsImage = async () => {
    const element = document.getElementById('image-container'); // 이미지와 박스를 감싸는 div의 id

    if (element) {
      const canvas = await html2canvas(element); // html2canvas로 DOM을 캔버스로 변환
      const image = canvas.toDataURL('image/jpeg'); // JPG 형식으로 변환

      // 링크를 만들어 다운로드
      const link = document.createElement('a');
      link.href = image;
      link.download = `boxedImage${imageId}.jpg`;
      link.click();
    }
  };

  return (
    <>
      <div
        id="image-container" // 이미지와 박스가 들어갈 div에 id 추가
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <img ref={imageRef} 
        src= {`${base64ImageUrl}`}
        className={`${styles.noSelect}`} 
        alt="Upload" 
        crossOrigin="anonymous"/>
        {newBox && (
          <div
            className="caption-box"
            style={{
              position: 'absolute',
              border: '2px solid red',
              left: `${newBox.x}px`,
              top: `${newBox.y}px`,
              width: `${newBox.width}px`,
              height: `${newBox.height}px`,
              pointerEvents: 'none',
            }}
          />
        )}
        {boxes.map((box, index) => (
          <div
            id={`${box.id}`}
            key={index}
            style={{
              ...uploadStyles.boundBox(box),
              border: `2px solid ${box.color}`,
            }}
            onMouseDown={e => onBoxMouseDown(e)(index)}
          >
            {/* {box.captions && (
              <div style={uploadStyles.caption()}>{index}</div>
            )} */}
            <div
              style={uploadStyles.captionResize()}
              onMouseDown={e => onResizeMouseDown(e)(index)}
            />
          </div>
        ))}
      </div>

      {/* 이미지 저장 버튼 */}
      <button onClick={saveAsImage} className={styles.saveButton}>
        Save as JPG
      </button>
    </>
  );
};

export default BoundBoxes;