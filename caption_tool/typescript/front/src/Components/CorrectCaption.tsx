import React, { useState } from 'react';
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
  const [seletedBox, setSeletedBox] = useState<number>(0);
  // correct caption 선택
  const selectBox = (CaptionIndex:number)=>{
    setSeletedBox(CaptionIndex)
  }

  // 음수를 0으로 변환
  function convertNegativeToZero(num:number) {
      return num < 0 ? 0 : num;
  }
  
  return (
    <div className={`${styles.flexContainer}`}>
      <table style={boxes.length>15?{position:"absolute", marginTop: "150px"}:{position:"absolute", marginTop: "180px"}}>
        <tr>
          {boxes.slice(convertNegativeToZero(0),15).map((box, boxIndex) => (
            <td>
              <button
              style={seletedBox === boxIndex?{color:"white", backgroundColor:"rgb(53, 76, 194)", borderRadius:"5px", border:"none", padding:"5px 10px"}:{backgroundColor:"rgb(231, 234, 237)", borderRadius:"5px", border:"none", padding:"5px 7px"}}
              onClick={()=>selectBox(boxIndex)}>{boxIndex}</button>
            </td>
          ))}
        </tr>
        <tr>
        {boxes.length>15?boxes.slice(15,boxes.length).map((box, boxIndex) => (
            <td>
              <button
              style={seletedBox === boxIndex+15?{color:"white", backgroundColor:"rgb(53, 76, 194)", borderRadius:"5px", border:"none", padding:"5px 10px"}:{backgroundColor:"rgb(231, 234, 237)", borderRadius:"5px", border:"none", padding:"5px 7px"}}
              onClick={()=>selectBox(boxIndex+15)}>{boxIndex+15}</button>
            </td>
          )):""}
        </tr>
      </table>
      <div className={`${styles.captionContainer}`}>
        <h2>correct caption set</h2>
        <h3>박스에 대한 <b>정확한 설명</b>을 입력해주세요.
          <br/>텍스트를 클릭하면 수정할 수 있습니다. </h3>
        <br />
        <br />
        <br />
        {boxes.length > 0 && (
          <div className={`${styles.captionSet} ${styles.radius}`}>
            <table>
              <tbody>
              {[boxes[seletedBox]].map((box, boxIndex) => (
                <React.Fragment key={`correctCaption${seletedBox}`}>
                  {boxIndex>0?<tr><td colSpan={3}><hr style={{width:"100%"}}></hr></td></tr>:""}
                  <tr>
                    <td colSpan={2} style={{display:"table-cell"}}>
                      <button onClick={() => handleAddCaption(seletedBox, setBoxes)} className={`${styles.addBtn}`}>+ add</button>
                    </td>
                  </tr>
                  <tr><br></br><br></br></tr>
                  {box.captions.length > 0 &&
                    box.captions.map((caption, captionIndex) => (
                      <tr key={`correctCaption${seletedBox}${captionIndex}`} className={`${styles.hovering}`}>
                        <td>
                          <span onClick={() => handleCaptionClick(seletedBox, captionIndex, caption, setBoxes)}>
                            ({seletedBox}-{captionIndex})
                          </span>
                        </td>
                        <td>
                          <span onClick={() => handleCaptionClick(seletedBox, captionIndex, caption, setBoxes)}>
                            {caption}
                          </span>
                        </td>
                        <td><button
                          onClick={()=>delCaptionClick(seletedBox, captionIndex, setBoxes)}> X </button>
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
        <br />
        <br />
        <br />
        {boxes.length > 0 && (
          <div className={`${styles.captionSet} ${styles.radius}`}>
            <table>
              {[boxes[seletedBox]].map((box, boxIndex) => (
                <React.Fragment key={`errorCaption${boxIndex}`}>
                  {box.errorCaptions.length > 0 &&
                    box.errorCaptions.map((errorCaptions, captionIndex) => (
                      <tbody>
                      {(boxIndex===0)&&(captionIndex===0)?"":<tr><td colSpan={3}><hr style={{width:"100%"}}></hr></td></tr>}
                      <tr>
                        <td colSpan={2} style={{display:"table-cell"}}>
                          <button onClick={() => handleAddErrorCaption(seletedBox, captionIndex, box.captions[captionIndex], setBoxes)} className={`${styles.addBtn}`}>+ add</button>
                        </td>
                      </tr>
                      <tr><br></br><br></br></tr>
                      {errorCaptions.map((errorCaption, errorCaptionIndex) => (
                        <tr key={`errorCaption${boxIndex}${captionIndex}${errorCaptionIndex}`} className={`${styles.hovering}`}>
                          <td>
                            <span
                              onClick={() =>
                                handleErrorCaptionClick(seletedBox, captionIndex,errorCaptionIndex, errorCaption, setBoxes)
                              }
                            >
                              ({seletedBox}-{captionIndex})
                            </span>
                          </td>
                          <td>
                            <span
                              onClick={() =>
                                handleErrorCaptionClick(seletedBox, captionIndex,errorCaptionIndex, errorCaption, setBoxes)
                              }
                              style={{color:errorCaption === box.captions[captionIndex]?"red":""}}
                            >
                              {errorCaption}
                            </span>
                          </td>
                          <td><button
                            onClick={()=>delErrorCaptionClick(seletedBox, captionIndex, errorCaptionIndex, setBoxes)}> X </button>
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