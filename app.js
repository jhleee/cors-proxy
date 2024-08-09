const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 9000;

// 로그 파일 스트림 생성
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 콘솔 로깅
app.use(morgan('dev'));

// 파일 로깅
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      console.log('Error: URL parameter is missing');
      return res.status(400).send('URL parameter is missing');
    }

    console.log(`Proxying request to: ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
    });

    const duration = Date.now() - startTime;
    console.log(`Request completed in ${duration}ms`);

    res.status(response.status).send(response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error occurred while proxying the request (${duration}ms):`, error.message);
    res.status(500).send('Error occurred while proxying the request');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server with logging is running on http://localhost:${PORT}`);
});