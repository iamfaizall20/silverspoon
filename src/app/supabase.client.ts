import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtoxkxjhtigdcmhohrsz.supabase.co';
const supabaseKey = 'sb_publishable_8MCxKa2WnNLALk8OHP6jqA_rjXnvtgz';

export const supabase = createClient(supabaseUrl, supabaseKey);