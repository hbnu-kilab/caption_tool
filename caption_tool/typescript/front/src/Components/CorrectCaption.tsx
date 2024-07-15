import React, { useState, useEffect } from 'react';
import { Box } from './Upload';
import styles from './Upload.module.css';
import {
  delCaptionClick,
  delErrorCaptionClick,
  handleAddCaption,
  handleAddErrorCaption,
  handleCaptionClick,
  handleErrorCaptionClick
} from './CaptionHandler';

interface CorrectCaptionProps {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
}

const CorrectCaption: React.FC<CorrectCaptionProps> = ({ boxes, setBoxes }) => {
  const [selectedBox, setSelectedBox] = useState<number>(0);

  useEffect(() => {
    if (selectedBox >= boxes.length) {
      setSelectedBox(Math.max(0, boxes.length - 1));
    }
  }, [boxes]);

  // correct caption 선택
  const selectBox = (CaptionIndex: number) => {
    setSelectedBox(CaptionIndex);
  }

  // 음수를 0으로 변환
  function convertNegativeToZero(num: number) {
    return num < 0 ? 0 : num;
  }

  return (
    <div className={styles.flexContainer}>
      <table style={boxes.length > 15 ? { position: "absolute", marginTop: "150px" } : { position: "absolute", marginTop: "180px" }}>
        <tbody>
          <tr>
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
                <tr>
                  <td colSpan={2} style={{ display: "table-cell" }}>
                    <button onClick={() => handleAddCaption(selectedBox, setBoxes)} className={styles.addBtn}>+ add</button>
                  </td>
                </tr>
                <tr><br /><br /></tr>
                {boxes[selectedBox].captions.map((caption, captionIndex) => (
                  <React.Fragment key={`correctCaption${selectedBox}${captionIndex}`}>
                    {(captionIndex > 0) && (captionIndex < boxes[selectedBox].captions.length) ? <tr><td colSpan={3}><p></p></td></tr> : ""}
                    <tr className={styles.hovering}>
                      <td style={{ verticalAlign: "top" }}>
                        <span onClick={() => handleCaptionClick(selectedBox, captionIndex, caption, setBoxes)}>
                          ({selectedBox}-{captionIndex})
                        </span>
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        <span onClick={() => handleCaptionClick(selectedBox, captionIndex, caption, setBoxes)}>
                          {caption}
                        </span>
                      </td>
                      <td><button onClick={() => delCaptionClick(selectedBox, captionIndex, setBoxes)}> X </button></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className={styles.captionContainer}>
        <h2>error caption set</h2>
        <h3>박스에 대해 <b>틀린</b> 설명을 입력해주세요. <br />텍스트를 클릭하면 수정할 수 있습니다.</h3>
        <br />
        <br />
        <br />
        {boxes.length > 0 && selectedBox < boxes.length && (
          <div className={`${styles.captionSet} ${styles.radius}`}>
            <table>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ display: "table-cell" }}>
                    <button onClick={() => handleAddErrorCaption(selectedBox, boxes[selectedBox].errorCaptions.length, boxes[selectedBox].captions[0], setBoxes)} className={styles.addBtn}>+ add</button>
                  </td>
                </tr>
                <tr><br /><br /></tr>
                {boxes[selectedBox].errorCaptions.map((errorCaptions, captionIndex) => (
                  <React.Fragment key={`errorCaption${selectedBox}${captionIndex}`}>
                    {(captionIndex > 0) && (captionIndex < boxes[selectedBox].errorCaptions.length) ? <tr><td colSpan={3}><p></p></td></tr> : ""}
                    {errorCaptions.map((errorCaption, errorCaptionIndex) => (
                      <tr key={`errorCaption${selectedBox}${captionIndex}${errorCaptionIndex}`} className={styles.hovering}>
                        <td style={{ verticalAlign: "top" }}>
                          <span onClick={() => handleErrorCaptionClick(selectedBox, captionIndex, errorCaptionIndex, errorCaption, setBoxes)}>
                            ({selectedBox}-{captionIndex})
                          </span>
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <span onClick={() => handleErrorCaptionClick(selectedBox, captionIndex, errorCaptionIndex, errorCaption, setBoxes)} style={{ color: errorCaption === boxes[selectedBox].captions[captionIndex] ? "red" : "" }}>
                            {errorCaption}
                          </span>
                        </td>
                        <td><button onClick={() => delErrorCaptionClick(selectedBox, captionIndex, errorCaptionIndex, setBoxes)}> X </button></td>
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
  );
};

export default CorrectCaption;
