import { Router, Request, Response } from 'express';
// 이미지 파일을 받기 위해서 먼저 설치 필요
// npm install multer
// npm install @types/multer
import fs from 'fs';
import path from 'path';
// 특정 키 값만 가져오기 위한 모듈
// npm install JSONStream

const router = Router();


const dataFilePath:string = "C:\\workplace\\Kilab\\dataset\\output_data\\combined_data.json"

// POST 요청을 처리하여 데이터를 받는 엔드포인트
router.post('/api/json/combined_data', (req: Request, res: Response) => {
    const JSONStream = require('JSONStream');
    try {
        // 요청 본문에서 message 필드 가져오기
        const receivedString: string = req.body.message;
        console.log(receivedString);

        // JSON 파일을 읽어와서 클라이언트에게 전송
        console.log("send combined_data");
        const fileStream = fs.createReadStream(dataFilePath);

        // JSONStream을 사용하여 특정 키값만 파싱
        const jsonStream = JSONStream.parse(receivedString);

        fileStream.pipe(jsonStream);

        jsonStream.on('data', (data: JSON) => {
            console.log('Received data for key:', data);
            res.send(data);
        });

        jsonStream.on('end', () => {
            console.log('JSON file processing completed.');
            res.end();
        });

        jsonStream.on('error', (error: string) => {
            console.error('Error reading JSON file:', error);
            res.status(500).json({ error: 'Failed to fetch data' });
            res.end();
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
        res.end();
    }
});

export default router;
