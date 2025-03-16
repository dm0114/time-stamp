import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키를 가져옵니다.
// 실제 프로젝트에서는 환경 변수를 사용하세요.
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
