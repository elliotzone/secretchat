/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SECRETCHAT_ADDRESS?: `0x${string}`;
  readonly VITE_WALLETCONNECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
