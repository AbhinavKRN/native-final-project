import express from 'express';

import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { ratingSchema } from '../validators/schemas.js';
import { sanitizeUser } from '../utils/helpers.js';

const router = express.Router();

router.use(requireAuth);

router.post('/user', async (req, res) => {
  try {
    const parsed = ratingSchema.parse(req.body);

    if (parsed.targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }

    const { data: completedSwap, error: swapError } = await supabase
      .from('swaps')
      .select('id')
      .eq('status', 'completed')
      .or(
        `and(sender_id.eq.${req.user.id},receiver_id.eq.${parsed.targetUserId}),and(sender_id.eq.${parsed.targetUserId},receiver_id.eq.${req.user.id})`,
      )
      .maybeSingle();

    if (swapError) throw swapError;
    if (!completedSwap) {
      return res.status(400).json({ error: 'No completed swap found between users' });
    }

    const { data: target, error: targetError } = await supabase
      .from('users')
      .select('id, rating, swaps_done')
      .eq('id', parsed.targetUserId)
      .single();

    if (targetError) throw targetError;

    const currentCount = target.swaps_done || 0;
    const currentRating = target.rating || 0;
    const newRating = (currentRating * currentCount + parsed.rating) / (currentCount + 1);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ rating: Number(newRating.toFixed(2)) })
      .eq('id', parsed.targetUserId)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({ user: sanitizeUser(updatedUser) });
  } catch (err) {
    console.error('Rating error', err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;

