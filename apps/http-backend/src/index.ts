import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import designsRouter from './routes/designs.js';

dotenv.config();

const app = express();
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/designs', designsRouter);
const PORT:number =3001;

app.listen(PORT, () => {
  console.log(`HTTP API Listening on port ${PORT}`);
});
