import React, {useState} from 'react';
import Draggable from 'react-draggable';
import styles from './Upload.module.css';
import { handleBoxDisplay } from './CoreBoxHandlers';
import uploadStyles from './uploadStyles';
import { Box } from './CoreJsonInterface';

interface CorrectCaptionProps {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
}

// floating box
const BoundBoxNavigation: React.FC<CorrectCaptionProps> = ({ boxes, setBoxes }) => {

  const [firstBoxIndex, setFirstBoxIndex] = useState<number | null>(null); // 현재 리사이징 되려는 첫 번째 박스 인덱스
  const [lastBoxIndex, setLastBoxIndex] = useState<number | null>(null);  // 현재 리사이징 되고 있는 마지막 박스 인덱스

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
                <tr key={`${box.id}`}>
                  <td>
                    <span>{boxIndex}</span>
                  </td>
                  <td>
                    <button id={`displayBtn_${box.id}`} onClick={() => handleBoxDisplay(box.id)} className={`${styles.displayBtn}`}>
                      on
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