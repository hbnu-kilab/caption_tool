import React, { useState, useEffect } from 'react';
import { Box } from './CoreJsonInterface';
import styles from './Upload.module.css';
import {
  delCaptionClick,
  delErrorCaptionClick,
  handleAddCaption,
  handleAddErrorCaption,
  handleCaptionClick,
  captionMoveClick,
  handleErrorCaptionClick
} from './CaptionHandler';

interface CorrectCaptionProps {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
  selectedBoxIndex: number;
  onBoxSelect: (index: number) => void;
}

const CorrectCaption: React.FC<CorrectCaptionProps> = ({ boxes, setBoxes , selectedBoxIndex , onBoxSelect}) => {
  const [selectedBox, setSelectedBox] = useState<number>(0);

  useEffect(() => {
    if (selectedBox >= boxes.length) {
      setSelectedBox(Math.max(0, boxes.length - 1));
    }
  }, [boxes]);

  // correct caption 선택
  const selectBox = (CaptionIndex: number) => {
    setSelectedBox(CaptionIndex);
    onBoxSelect(CaptionIndex);
  }

  // 음수를 0으로 변환
  function convertNegativeToZero(num: number) {
    return num < 0 ? 0 : num;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <table cellSpacing="10" style={boxes.length > 15 ? { marginTop: "50px" } : { marginTop: "50px" }}>
        <tbody>
          <tr style={{padding:'10px'}}>
            {boxes.slice(0, 15).map((box, boxIndex) => (
              <td key={boxIndex}>
                <button
                  style={selectedBox === boxIndex ? { color: "white", backgroundColor: "rgb(53, 76, 194)", borderRadius: "5px", border: "none", padding: "5px 10px" } : { backgroundColor: "rgb(231, 234, 237)", borderRadius: "5px", border: "none", padding: "5px 7px" }}
                  onClick={() => selectBox(boxIndex)}
                >
                  {boxIndex}
                </button>
              </td>
            ))}
          </tr>
          {boxes.length > 15 &&
            <tr>
              {boxes.slice(15).map((box, boxIndex) => (
                <td key={boxIndex + 15}>
                  <button
                    style={selectedBox === boxIndex + 15 ? { color: "white", backgroundColor: "rgb(53, 76, 194)", borderRadius: "5px", border: "none", padding: "5px 10px" } : { backgroundColor: "rgb(231, 234, 237)", borderRadius: "5px", border: "none", padding: "5px 7px" }}
                    onClick={() => selectBox(boxIndex + 15)}
                  >
                    {boxIndex + 15}
                  </button>
                </td>
              ))}
            </tr>
          }
        </tbody>
      </table>
    <div className={styles.flexContainer}>

      <div className={styles.captionContainer}>
        <h2>correct caption set</h2>
        <h3>박스에 대한 <b>정확한 설명</b>을 입력해주세요.
          <br />텍스트를 클릭하면 수정할 수 있습니다. </h3>
        <br />
        <br />
        <br />
        {boxes.length > 0 && selectedBox < boxes.length && (
          <div className={`${styles.captionSet} ${styles.radius}`}>
            <table>
              <tbody>
                <tr><br /><br /></tr>
                {boxes[selectedBox].captions.map((caption, captionIndex) => (
                  <React.Fragment key={`correctCaption${selectedBox}${captionIndex}`}>
                    {(captionIndex > 0) && (captionIndex < boxes[selectedBox].captions.length) ? <tr><td colSpan={3}><hr></hr></td></tr> : ""}
                    {(captionIndex > 0) && (captionIndex < boxes[selectedBox].captions.length) ? <tr><td colSpan={3}><p style={{marginTop:'40px'}}></p></td></tr> : ""}

                    <tr className={styles.hovering}>
                      <td style={{ verticalAlign: "top" }}>
                        <button
                          className={styles.movingBtn}>
                          ({selectedBox}-{captionIndex})
                        </button>
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        <span style = {{marginLeft: "5px"}}>
                          {caption}
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>

  );
};

export default CorrectCaption;
