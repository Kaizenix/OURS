export function getSupabaseConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !url.startsWith('http')) {
    url = 'https://placeholder-project.supabase.co';
  } else {
    // 1. Remove trailing slashes
    url = url.replace(/\/+$/, '');
    
    // 2. Remove accidentally appended sub-paths like /rest/v1 or /auth/v1
    url = url.replace(/\/rest\/v1.*$/i, '');
    url = url.replace(/\/auth\/v1.*$/i, '');
    
    // 3. If user pasted Supabase dashboard URL: https://supabase.com/dashboard/project/<ref>
    const matchDashboard = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
    if (matchDashboard && matchDashboard[1]) {
      url = `https://${matchDashboard[1]}.supabase.co`;
    }
  }

  if (!key) {
    key = 'placeholder-anon-key';
  }

  return { supabaseUrl: url, supabaseAnonKey: key };
}
