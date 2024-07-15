import React, {useState} from 'react';
import Draggable from 'react-draggable';
import styles from './Upload.module.css';
import { handleBoxDisplay, handleDeleteClick } from './BoxHandlers';
import uploadStyles from './uploadStyles';
import { Box } from './Upload';

interface CorrectCaptionProps {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
}

// floating box
const BoundBoxNavigation: React.FC<CorrectCaptionProps> = ({ boxes, setBoxes }) => {

  const [firstBoxIndex, setFirstBoxIndex] = useState<number | null>(null); // 현재 리사이징 되려는 첫 번째 박스 인덱스
  const [lastBoxIndex, setLastBoxIndex] = useState<number | null>(null);  // 현재 리사이징 되고 있는 마지막 박스 인덱스

  const moveBox = (boxIndex: number) => {
    if (firstBoxIndex !== null) {
      // 첫번째 인덱스와 같으면
      if (firstBoxIndex === boxIndex) {
        setFirstBoxIndex(null);
      } else {
        boxes[firstBoxIndex].captions.map((caption, captionIndex)=>(
          boxes[boxIndex].captions.push(caption)
        ))
        boxes[firstBoxIndex].errorCaptions.map((errorCaption, errorCaptionIndex)=>(
          boxes[boxIndex].errorCaptions.push(errorCaption)
        ))
        handleDeleteClick(firstBoxIndex, setBoxes)
        setFirstBoxIndex(null);
      }
    } else {
      setFirstBoxIndex(boxIndex);
    }
    };

  return (
    <Draggable>
      <div className={`${styles.draggable} ${styles.floatingBar}`}>
        {boxes.length > 0 && (
          <div className={`${styles.draggable} ${styles.innerFloatingBar}`}>
            {/* <h2>Boxes</h2> */}
            {/* <h3>박스 entity name을 클릭하면 수정할 수 있습니다.</h3> */}
            <table>
              {boxes.map((box, boxIndex) => (
                <tbody>
                <tr key={`box${boxIndex}`}>
                  <td>
                    <span>{boxIndex}</span>
                  </td>
                  <td>
                    <button id={`displayBtn${boxIndex}`} onClick={() => handleBoxDisplay(boxIndex)} className={`${styles.displayBtn}`}>
                      on
                    </button>
                    <button onClick={() => moveBox(boxIndex)} id={`moveBtn${boxIndex}`} style={boxIndex === firstBoxIndex?{backgroundColor: "rgb(53, 76, 194)", color: "white", border: "0", marginLeft: "10px", padding: "5px 7px", borderRadius: "5px"}:{backgroundColor: "rgb(29, 31, 37)", color: "white", border: "0", marginLeft: "10px", padding: "5px 7px", borderRadius: "5px"}} className={`(${styles.displayBtn}`}> 
                      {boxIndex === firstBoxIndex?"cancel":"move"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteClick(boxIndex, setBoxes)} className={`${styles.delBtn}`}>
                      delete
                    </button>
                  </td>
                </tr>
                <tr
                  key={`entityList${boxIndex}`}
                  id={`entityList${boxIndex}`}
                  style={uploadStyles.navElement()}>
                </tr>
                </tbody>
              ))}
            </table>
          </div>
        )}
      </div>
    </Draggable>
    );
};

export default BoundBoxNavigation;