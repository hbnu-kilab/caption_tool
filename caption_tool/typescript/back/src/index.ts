import express from 'express';
import gptRouter from '../routes/gpt';

const app = express();
const port = 4000; // express port num

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/', gptRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
