import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import './App.css'; // 스타일을 별도의 CSS 파일로 분리하는 것을 권장합니다.

interface Box {
  index: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [captionCount, setCaptionCount] = useState(0);
  const [longCaption, setLongCaption] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartX(x);
    setStartY(y);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentBox({
      index: captionCount,
      left: Math.min(startX, x),
      top: Math.min(startY, y),
      width: Math.abs(startX - x),
      height: Math.abs(startY - y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    if (currentBox) {
      setBoxes([...boxes, currentBox]);
      setCaptionCount(captionCount + 1);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCaptionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      setCaptions([...captions, inputValue]);
      setInputValue('');
    }
  };

  const handleLongCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLongCaption(e.target.value);
  };

  const handleLongCaptionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', handleMouseDown as any);
      containerRef.current.addEventListener('mousemove', handleMouseMove as any);
      containerRef.current.addEventListener('mouseup', handleMouseUp as any);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handleMouseDown as any);
        containerRef.current.removeEventListener('mousemove', handleMouseMove as any);
        containerRef.current.removeEventListener('mouseup', handleMouseUp as any);
      }
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div>
      <h1>이미지 캡션 데이터 구축</h1>
      <div className="container">
        <div className="image-container" id="imageContainer" ref={containerRef}>
          <img id="image" src="static/images/sunset.jpg" alt="image.jpg" />
          {boxes.map(box => (
            <div
              key={box.index}
              className="caption-box"
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                position: 'absolute',
              }}
            >
              <div className="caption-index">({box.index})</div>
              <div className="resize-handle"></div>
            </div>
          ))}
          {currentBox && (
            <div
              className="caption-box"
              style={{
                left: currentBox.left,
                top: currentBox.top,
                width: currentBox.width,
                height: currentBox.height,
                position: 'absolute',
              }}
            ></div>
          )}
        </div>

        <div className="form-container">
          <div className="form-section">
            <div>
              <h2>글로벌 Long 캡션 추가</h2>
              <form id="globalLongCaptionForm" onSubmit={handleLongCaptionSubmit}>
                <label htmlFor="globalLongCaption">글로벌 Long 캡션:</label><br />
                <textarea
                  id="globalLongCaption"
                  name="globalLongCaption"
                  rows={6}
                  cols={50}
                  required
                  value={longCaption}
                  onChange={handleLongCaptionChange}
                ></textarea><br /><br />
              </form>
              <div id="long-caption-list"></div>
            </div>
            <div>
              <h2>새 캡션 추가</h2>
              <form id="captionForm" onSubmit={handleCaptionSubmit}>
                <label htmlFor="caption">캡션:</label><br />
                <input
                  type="text"
                  id="caption"
                  name="caption"
                  required
                  value={inputValue}
                  onChange={handleCaptionChange}
                /><br /><br />
                <button type="submit">캡션 추가</button>
              </form>
              <div className="caption-set-container">
                <h2>Caption Set</h2>
                <div id="caption-set" className="dropzone">
                  {captions.map((caption, index) => (
                    <div key={index} className="caption-list-item">
                      {caption}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="error-set-container">
              <h2>Error Set</h2>
              <div id="error-set" className="dropzone">
                {captions.map((caption, index) => (
                  <div key={index} className="caption-list-item error-caption">
                    {caption}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
