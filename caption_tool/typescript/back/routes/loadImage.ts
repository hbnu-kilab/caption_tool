import { Router, Request, Response } from 'express';
import request from 'request';
import axios from 'axios';
import { IncomingMessage } from 'http';
import { Buffer } from 'buffer';

const router = Router();

router.get('/proxy', async (req, res) => {
    const imageUrl = req.query.url as string;
    console.log(imageUrl)

    try {
        // 이미지 요청
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',  // 바이너리 데이터를 가져오기 위한 설정
        });
    
        // Buffer 객체를 Base64 문자열로 변환
        const base64Image = Buffer.from(response.data).toString('base64');
    
        // 이미지의 MIME 타입 가져오기
        const mimeType = response.headers['content-type'];
    
        // 클라이언트에게 Base64 형식으로 응답
        res.send(`data:${mimeType};base64,${base64Image}`);
        console.log(`data:${mimeType};base64,${base64Image}`)
      } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Error fetching image');
      }

    // request({ url: imageUrl, encoding: null }, (err: Error | null, resp: IncomingMessage, buffer: Buffer) => {
    //     if (!err && resp.statusCode === 200) {
    //         res.set('Content-Type', resp.headers['content-type']);
    //         res.send(buffer);
            
    //     } else {
    //         res.status(500).send('Error fetching image');
    //     }
    // });
});

export default router;

