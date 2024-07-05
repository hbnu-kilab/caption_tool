import fs from 'fs/promises';
import path from 'path';
import { Router, Request, Response } from 'express';

const router = Router();

const jsonOriginPath = path.join(__dirname, '..', '..', 'front', 'public', 'json');

const getPath = (index: number) => `${jsonOriginPath}/splitJson/split_json_${index}.json`;
const getOutputPath = (index: number) => `${jsonOriginPath}/outputJson/output_${index}.json`;

interface UpdateRequestBody {
  jsonIndex: number;
  json: any;
}


/**
 * @description 변경된 JSON 내용을 전달받아서 output_[index].json 으로 지정된 경로에 파일을 작성합니다.
 * 클라이언트는 OS파일 쓰기 접근이 불가능해 단순한 API 작성으로 남깁니다.
 */
router.post('/', async (req: Request<{}, {}, UpdateRequestBody>, res: Response) => {
  const { jsonIndex, json } = req.body;

  try {
    // 기존 JSON을 가져오는 코드. 활용이 필요할까봐 남겨둡니다.
    // const originJson = await fs.readFile(getPath(req.body.jsonIndex), 'utf-8');
    await fs.writeFile(getOutputPath(jsonIndex), json);

    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send("서버 에러가 발생하였습니다.");
  }
});


export default router;
