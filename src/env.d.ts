/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_SUPABASE_ANON: string;
    readonly PUBLIC_PROJECT_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }