import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { company_name, sector, market, description, website, contact_email } = req.body;

  const { data, error } = await supabase
    .from('partners')
    .insert([{ company_name, sector, market, description, website, contact_email }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: 'Partner registered successfully' });
}