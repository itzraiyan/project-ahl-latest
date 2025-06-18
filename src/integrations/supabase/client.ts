
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jsmptqlbeqhsrjrtgvfu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzbXB0cWxiZXFoc3JqcnRndmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTY2NjksImV4cCI6MjA2NTY3MjY2OX0.1rLpL7a0bABglLL6KeEQEZATQ4oBqqSAAKry5yc0Omw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
