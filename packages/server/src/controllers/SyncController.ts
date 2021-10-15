import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

export class SyncController {
  async post(req: Request, res: Response) {
    const { authorization } = req.headers;
    const { scholars } = req.body;

    if (!authorization) {
      return res.status(400).json({ error: 'Missing authorization token' });
    }

    const auth = await supabase.auth.api.getUser(authorization);

    if (!auth.user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    if (!scholars) return res.status(400).json({ error: 'Missing scholars data' });

    const inserted = await supabase
      .from('sync')
      .upsert({ user_id: auth.user?.id, data: JSON.stringify(scholars) }, { onConflict: 'user_id' })
      .single();

    if (inserted.data?.data) {
      const scholarsParsed = JSON.parse(inserted.data.data);
      return res.status(200).json({ scholars: scholarsParsed });
    }

    return res.status(500).json({ error: 'Something went wrong' });
  }

  async get(req: Request, res: Response) {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(400).json({ error: 'Missing authorization token' });
    }

    const auth = await supabase.auth.api.getUser(authorization);

    if (!auth.user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const exists = await supabase.from('sync').select('*').eq('user_id', auth.user.id).single();

    if (exists.data?.data) {
      const scholarsParsed = JSON.parse(exists.data.data);
      return res.status(200).json({ scholars: scholarsParsed });
    }

    return res.status(200).json({ scholars: [] });
  }
}
