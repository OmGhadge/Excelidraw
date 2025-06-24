import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import {CreateUserSchema,SiginSchema,CreateRoomSchema} from "@repo/common/types";
const router:Router = Router();

// const creds = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username,password,email} = CreateUserSchema.safeParse(req.body);

    if (await User.exists({ email })) {
      res.status(409).json({ message: 'User exists' });   // no “return res …”
      return;                                             // early‑exit with void
    }

    const hash  = await bcrypt.hash(password, 12);
    const user  = await User.create({ email, password: hash });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(201).json({ token });                      // again: no “return …”
  } catch (err) {
    next(err);                                            // forward to global handler
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = SiginSchema.safeParse(req.body);

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Bad credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
