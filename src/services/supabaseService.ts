import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseClient: any = null;

export const getSupabaseClient = (config?: SupabaseConfig) => {
  if (config) {
    supabaseClient = createClient(config.url, config.anonKey);
  }
  return supabaseClient;
};

export const testSupabaseConnection = async (config: SupabaseConfig) => {
  let url = config.url.trim();
  // Auto fix if user just pasted the project ref with https:// but forgot .supabase.co
  if (url.startsWith('https://') && url.split('.').length === 1) {
    url = `${url}.supabase.co`;
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Anon Key (401 Unauthorized)');
      } else if (response.status === 404) {
        throw new Error('Project not found or invalid URL (404)');
      } else {
        throw new Error(`Connection failed with HTTP Status: ${response.status}`);
      }
    }
    
    // Validate that the request actually returned OpenAPI spec typical of Supabase REST
    const data = await response.json();
    if (!data || (!data.openapi && !data.swagger && !data.info)) {
      throw new Error('Invalid response from Supabase REST API.');
    }

    return true;
  } catch (err: any) {
    throw new Error(err.message || 'Network error or invalid URL format');
  }
};
