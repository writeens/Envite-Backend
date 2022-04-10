import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// SET UP CROSS ORIGIN REQUEST CONFIG
app.use(cors());

// HEALTHY CHECK
app.get('/ok', (req, res) => {
  res.json({
    message: 'Healthy',
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
