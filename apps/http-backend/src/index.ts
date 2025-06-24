import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`HTTP API 🚀  ${process.env.PORT}`)
    )
  )
  .catch(console.error);
