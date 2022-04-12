import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { AuthRouter } from './routes';
import { clientErrorMiddlware } from './middleware/error';

dotenv.config();

console.log('NODE_ENV is', process.env.NODE_ENV);

// INITIALIZE FIREBASE APP
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FB_PROJECT_ID,
    privateKey: `${process.env.FB_PRIVATE_KEY}`.replace(/\\n/g, '\n'),
    clientEmail: process.env.FB_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FB_DATABASE_URL,
});

const app = express();
const port = process.env.PORT || 3000;

// SET UP BODY PARSER
app.use(express.json());

// SET UP CROSS ORIGIN REQUEST CONFIG
app.use(cors());

// HANDLE URL ENCODING
app.use(express.urlencoded({ extended: false }));

// USE AUTH ROUTER
app.use(AuthRouter);

// CLIENT ERROR ROUTE HANDLER
app.use(clientErrorMiddlware);

// HEALTHY CHECK
app.get('/ok', (req, res) => {
  res.json({
    message: 'Healthy',
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
