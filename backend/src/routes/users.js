import express from 'express';

import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { overlapCount, sanitizeUser } from '../utils/helpers.js';
import { profileUpdateSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(requireAuth);

const fetchCurrentUser = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, bio, avatar_url, skills_teach, skills_learn, rating, swaps_done')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

router.get('/all', async (req, res) => {
  try {
    const me = await fetchCurrentUser(req.user.id);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, bio, avatar_url, skills_teach, skills_learn, rating, swaps_done')
      .neq('id', req.user.id);

    if (error) throw error;

    const enriched = users.map((u) => {
      const overlap = overlapCount(u.skills_teach, me.skills_learn);
      return { ...sanitizeUser(u), overlap };
    });

    enriched.sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return (b.rating || 0) - (a.rating || 0);
    });

    return res.json({ users: enriched });
  } catch (err) {
    console.error('Users feed error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const me = await fetchCurrentUser(req.user.id);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, bio, avatar_url, skills_teach, skills_learn, rating, swaps_done')
      .neq('id', req.user.id);

    if (error) throw error;

    const matches = users
      .map((u) => {
        const overlap = overlapCount(u.skills_teach, me.skills_learn);
        return { ...sanitizeUser(u), overlap };
      })
      .filter((u) => u.overlap > 0)
      .sort((a, b) => {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap;
        return (b.rating || 0) - (a.rating || 0);
      });

    return res.json({ users: matches });
  } catch (err) {
    console.error('Match feed error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = await fetchCurrentUser(req.user.id);
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Profile fetch error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.patch('/profile', async (req, res) => {
  try {
    const parsed = profileUpdateSchema.parse(req.body);

    const updates = {
      ...(parsed.name ? { name: parsed.name } : {}),
      ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
      ...(parsed.avatarUrl !== undefined ? { avatar_url: parsed.avatarUrl } : {}),
      ...(parsed.skillsTeach ? { skills_teach: parsed.skillsTeach } : {}),
      ...(parsed.skillsLearn ? { skills_learn: parsed.skillsLearn } : {}),
    };

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No changes submitted' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ user: sanitizeUser(data) });
  } catch (err) {
    console.error('Profile update error', err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;

