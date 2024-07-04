import React from 'react';
import Draggable from 'react-draggable';
import styles from './Upload.module.css';
import { handleBoxDisplay, handleDeleteClick } from './BoxHandlers';
import uploadStyles from './uploadStyles';
import { Box } from './Upload';

interface CorrectCaptionProps {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
}

const BoundBoxNavigation: React.FC<CorrectCaptionProps> = ({ boxes, setBoxes }) => {
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
                  {/* <td className={`${styles.hovering} ${box.entity.length>0? "":styles.fontRed}`}>
                          <span id={`entity${boxIndex}`}
                          onClick={() => handleEntityDisplay(boxIndex, box.entity[0])}>{box.entity.length>0?`${box.entity[0]}   ▼`:'none   ▼'}</span>
                          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        </td> */}
                  {/* <td>
                          <button onClick={() => handleBoxClick(boxIndex, setBoxes)} className={`${styles.addBtn}`}>
                            + Caption
                          </button>
                        </td> */}
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