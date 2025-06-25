import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
const PORT:number =3001;
// ✅ just start the server directly
app.listen(PORT, () => {
  console.log(`HTTP API 🚀  Listening on port ${PORT}`);
});
