import React from 'react';
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
  return (
    <div className={`${styles.flexContainer}`}>
      <div className={`${styles.captionContainer}`}>
        <h2>correct caption set</h2>
        <h3>박스에 대한 <b>정확한 설명</b>을 입력해주세요.
          <br/>텍스트를 클릭하면 수정할 수 있습니다. </h3>
        {boxes.length > 0 && (
          <div className={`${styles.captionSet} ${styles.radius}`}>
            <table>
              <tbody>
              {boxes.map((box, boxIndex) => (
                <React.Fragment key={`correctCaption${boxIndex}`}>
                  {boxIndex>0?<tr><td colSpan={3}><hr style={{width:"100%"}}></hr></td></tr>:""}
                  <tr>
                    <td colSpan={2} style={{display:"table-cell"}}>
                      <button onClick={() => handleAddCaption(boxIndex, setBoxes)} className={`${styles.addBtn}`}>+ add</button>
                    </td>
                  </tr>
                  <tr><br></br><br></br></tr>
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
                        <td><button
                          onClick={()=>delCaptionClick(boxIndex, captionIndex, setBoxes)}> X </button>
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
          <div className={`${styles.captionSet} ${styles.radius}`}>
            <table>
              {boxes.map((box, boxIndex) => (
                <React.Fragment key={`errorCaption${boxIndex}`}>
                  {box.errorCaptions.length > 0 &&
                    box.errorCaptions.map((errorCaptions, captionIndex) => (
                      <tbody>
                      {(boxIndex===0)&&(captionIndex===0)?"":<tr><td colSpan={3}><hr style={{width:"100%"}}></hr></td></tr>}
                      <tr>
                        <td colSpan={2} style={{display:"table-cell"}}>
                          <button onClick={() => handleAddErrorCaption(boxIndex, captionIndex, box.captions[captionIndex], setBoxes)} className={`${styles.addBtn}`}>+ add</button>
                        </td>
                      </tr>
                      <tr><br></br><br></br></tr>
                      {errorCaptions.map((errorCaption, errorCaptionIndex) => (
                        <tr key={`errorCaption${boxIndex}${captionIndex}${errorCaptionIndex}`} className={`${styles.hovering}`}>
                          <td>
                            <span
                              onClick={() =>
                                handleErrorCaptionClick(boxIndex, captionIndex,errorCaptionIndex, errorCaption, setBoxes)
                              }
                            >
                              ({boxIndex}-{captionIndex})
                            </span>
                          </td>
                          <td>
                            <span
                              onClick={() =>
                                handleErrorCaptionClick(boxIndex, captionIndex,errorCaptionIndex, errorCaption, setBoxes)
                              }
                              style={{color:errorCaption === box.captions[captionIndex]?"red":""}}
                            >
                              {errorCaption}
                            </span>
                          </td>
                          <td><button
                            onClick={()=>delErrorCaptionClick(boxIndex, captionIndex, errorCaptionIndex, setBoxes)}> X </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    ))}
                </React.Fragment>
              ))}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrectCaption;