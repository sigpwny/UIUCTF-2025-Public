/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CTFD_BASE_URL: string;
  readonly PUBLIC_CTF_TIME_START: string;
  readonly PUBLIC_CTF_TIME_END: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
