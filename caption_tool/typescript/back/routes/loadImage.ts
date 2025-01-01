import { Router, Request, Response } from 'express';
import request from 'request';
import axios from 'axios';
import { IncomingMessage } from 'http';
import { Buffer } from 'buffer';

const router = Router();

router.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url as string;

  if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).send('Invalid URL');
  }

  try {
      // 첫 번째 경로에서 이미지 요청
      const response = await axios.get(`https://cs.stanford.edu/people/rak248/VG_100K/${imageUrl}.jpg`, {
          responseType: 'arraybuffer',
      });

      const base64Image = Buffer.from(response.data).toString('base64');
      const mimeType = response.headers['content-type'];

      return res.send(`data:${mimeType};base64,${base64Image}`);
  } catch (error) {
      console.error('Error fetching image from VG_100K:', error);

      try {
          // 두 번째 경로에서 이미지 요청
          const response = await axios.get(`https://cs.stanford.edu/people/rak248/VG_100K_2/${imageUrl}.jpg`, {
              responseType: 'arraybuffer',
          });

          const base64Image = Buffer.from(response.data).toString('base64');
          const mimeType = response.headers['content-type'];

          return res.send(`data:${mimeType};base64,${base64Image}`);
      } catch (error) {
          console.error('Error fetching image from VG_100K_2:', error);
          return res.status(500).send('Error fetching image');
      }
  }
});

// router.get('/proxy', async (req, res) => {
//     const imageUrl = req.query.url as string;
//     console.log(imageUrl)

//     try {
//         // 이미지 요청
//         const response = await axios.get(`https://cs.stanford.edu/people/rak248/VG_100K/${imageUrl}.jpg`, {
//           responseType: 'arraybuffer',  // 바이너리 데이터를 가져오기 위한 설정
//         });
    
//         // Buffer 객체를 Base64 문자열로 변환
//         const base64Image = Buffer.from(response.data).toString('base64');
    
//         // 이미지의 MIME 타입 가져오기
//         const mimeType = response.headers['content-type'];
    
//         // 클라이언트에게 Base64 형식으로 응답
//         res.send(`data:${mimeType};base64,${base64Image}`);
//         console.log(`data:${mimeType};base64,${base64Image}`)
//       } catch (error) {
//         try {
//           // 이미지 요청
//           const response = await axios.get(`https://cs.stanford.edu/people/rak248/VG_100K_2/${imageUrl}.jpg`, {
//             responseType: 'arraybuffer',  // 바이너리 데이터를 가져오기 위한 설정
//           });
      
//           // Buffer 객체를 Base64 문자열로 변환
//           const base64Image = Buffer.from(response.data).toString('base64');
      
//           // 이미지의 MIME 타입 가져오기
//           const mimeType = response.headers['content-type'];
      
//           // 클라이언트에게 Base64 형식으로 응답
//           res.send(`data:${mimeType};base64,${base64Image}`);
//           console.log(`data:${mimeType};base64,${base64Image}`)
//         } catch (error) {
//           console.error('Error fetching image:', error);
//           res.status(500).send('Error fetching image');
//         }
//         console.error('Error fetching image:', error);
//         res.status(500).send('Error fetching image');
//       }

      

// });

export default router;

