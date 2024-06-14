import { Router, Request, Response } from 'express';
// 이미지 파일을 받기 위해서 먼저 설치 필요
// npm install multer
// npm install @types/multer
import multer from 'multer';
import path from 'path';

const router = Router();

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 고유한 파일명 생성
  },
});

const upload = multer({ storage });

// image는 blob 형태로 반환돼서 get으로 받으면 더러움..
router.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ message: 'File uploaded successfully', file: req.file });
  } else {
    res.status(400).json({ message: 'File upload failed' });
  }
});

export default router;