import { createClient } from '@supabase/supabase-js';

// 👇 เอา Project URL จาก Supabase มาใส่ตรงนี้
const supabaseUrl = 'https://fjpjqhrvehjeplcnnsqf.supabase.co';

// 👇 เอา API Key (anon public) มาใส่ตรงนี้
const supabaseKey = 'sb_publishable_tFTZE0Z7MQzqb_AZF7LNXg_cHJgRvzr';

export const supabase = createClient(supabaseUrl, supabaseKey);