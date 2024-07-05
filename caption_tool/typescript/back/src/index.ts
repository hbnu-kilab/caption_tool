import express from 'express';
import gptRouter from '../routes/gpt';
import jsonRouter from '../routes/json';
import processRouter from '../routes/process';

const app = express();
const port = 4000; // express port num

// 모든 경로에 대해 CORS 허용 설정
// npm install cors --save 
const cors = require('cors');
app.use(express.json()); // JSON 요청을 파싱하는 미들웨어 추가
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/', gptRouter);
app.use('/', jsonRouter);
app.use('/process', processRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
