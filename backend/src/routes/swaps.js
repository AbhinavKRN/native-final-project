import express from 'express';

import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import {
  swapRequestSchema,
  swapRespondSchema,
  swapCompleteSchema,
} from '../validators/schemas.js';
import { sanitizeUser } from '../utils/helpers.js';

const router = express.Router();

router.use(requireAuth);

const ensureUserExists = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

const incrementSwapsDone = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('swaps_done')
    .eq('id', userId)
    .single();
  if (error) throw error;

  const current = data?.swaps_done ?? 0;
  const { error: updateError } = await supabase
    .from('users')
    .update({ swaps_done: current + 1 })
    .eq('id', userId);

  if (updateError) throw updateError;
};

router.get('/mine', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('swaps')
      .select('*')
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ swaps: data });
  } catch (err) {
    console.error('Fetch swaps error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.post('/request', async (req, res) => {
  try {
    const parsed = swapRequestSchema.parse(req.body);

    if (parsed.receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot request a swap with yourself' });
    }

    await ensureUserExists(parsed.receiverId);

    const { data, error } = await supabase
      .from('swaps')
      .insert({
        sender_id: req.user.id,
        receiver_id: parsed.receiverId,
        skill_offered: parsed.skillOffered.toLowerCase(),
        skill_requested: parsed.skillRequested.toLowerCase(),
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ swap: data });
  } catch (err) {
    console.error('Swap request error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.patch('/respond', async (req, res) => {
  try {
    const parsed = swapRespondSchema.parse(req.body);

    const { data: swap, error } = await supabase
      .from('swaps')
      .select('*')
      .eq('id', parsed.swapId)
      .single();

    if (error) throw error;

    if (swap.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Only receiver can respond' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Swap already handled' });
    }

    const nextStatus = parsed.action === 'accept' ? 'active' : 'rejected';

    const { data: updated, error: updateError } = await supabase
      .from('swaps')
      .update({ status: nextStatus })
      .eq('id', parsed.swapId)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({ swap: updated });
  } catch (err) {
    console.error('Swap respond error', err);
    return res.status(400).json({ error: err.message });
  }
});

router.patch('/complete', async (req, res) => {
  try {
    const parsed = swapCompleteSchema.parse(req.body);

    const { data: swap, error } = await supabase
      .from('swaps')
      .select('*')
      .eq('id', parsed.swapId)
      .single();

    if (error) throw error;

    if (![swap.sender_id, swap.receiver_id].includes(req.user.id)) {
      return res.status(403).json({ error: 'Only participants can complete swaps' });
    }

    if (swap.status !== 'active') {
      return res.status(400).json({ error: 'Swap not active' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('swaps')
      .update({ status: 'completed' })
      .eq('id', parsed.swapId)
      .select()
      .single();

    if (updateError) throw updateError;

    await incrementSwapsDone(swap.sender_id);
    await incrementSwapsDone(swap.receiver_id);

    return res.json({ swap: updated });
  } catch (err) {
    console.error('Swap complete error', err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;

