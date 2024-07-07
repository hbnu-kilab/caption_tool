import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

const jsonOriginPath = path.join(__dirname, '..', '..', 'front', 'public', 'json');

const getPath = (index: number) => `${jsonOriginPath}/splitJson/split_json_${index}.json`;
const getOutputPath = (index: number) => `${jsonOriginPath}/outputJson/output_${index}.json`;

interface UpdateRequestBody {
  jsonIndex: number;
  json: any;
}

interface CustomRequest<T> extends Request {
  body: T;
}

/**
 * @description 변경된 JSON 내용을 전달받아서 output_[index].json 으로 지정된 경로에 파일을 작성합니다.
 * 클라이언트는 OS파일 쓰기 접근이 불가능해 단순한 API 작성으로 남깁니다.
 */
router.post('/', async (req: CustomRequest<UpdateRequestBody>, res: Response) => {
  const { jsonIndex, json } = req.body;
  console.log("start")

  try {
    // 기존 JSON 파일 읽기
    const originalJsonPath = getPath(jsonIndex);
    const originalJson = JSON.parse(await fs.readFile(originalJsonPath, 'utf-8'));

    // 새로운 데이터 병합
    const updatedJson = {
      ...originalJson,
      new_bounding_boxes: json.new_bounding_boxes,
      new_keywords: json.new_keywords
    };

    // 병합된 JSON 파일 저장
    await fs.writeFile(getOutputPath(jsonIndex), JSON.stringify(updatedJson, null, 2));

    // return res.status(201).send();
  } catch (error) {
    console.error(error);
    // return res.status(500).send("서버 에러가 발생하였습니다.");
  }
});

export default router;
