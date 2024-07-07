import express from 'express';
import gptRouter from '../routes/gpt';
import jsonRouter from '../routes/json';
import processRouter from '../routes/process';

const app = express();
const port = 4000; // express port num

// 모든 경로에 대해 CORS 허용 설정
// npm install cors --save 
const cors = require('cors');
// 모든 경로에 대해 CORS 허용 설정
app.use(cors());
app.use(express.json({ limit: '200mb' })); // JSON 요청을 파싱하는 미들웨어 추가 및 크기 제한 설정
app.use(express.urlencoded({ limit: '200mb', extended: true })); // URL-encoded 데이터 크기 제한 설정

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/', gptRouter);
app.use('/', jsonRouter);
app.use('/process', processRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
