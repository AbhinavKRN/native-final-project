import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { supabase } from '../config/supabase.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { sanitizeUser } from '../utils/helpers.js';

dotenv.config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', parsed.email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(parsed.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: parsed.name,
        email: parsed.email,
        password_hash,
        bio: parsed.bio || '',
        avatar_url: parsed.avatarUrl || '',
        skills_teach: parsed.skillsTeach ?? [],
        skills_learn: parsed.skillsLearn ?? [],
        rating: 0,
        swaps_done: 0,
      })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: data.id, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.status(201).json({ token, user: sanitizeUser(data) });
  } catch (err) {
    console.error('Register error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, bio, avatar_url, skills_teach, skills_learn, rating, swaps_done, password_hash')
      .eq('email', parsed.email)
      .single();

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(parsed.password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error', err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;

