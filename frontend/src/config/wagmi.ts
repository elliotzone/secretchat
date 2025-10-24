import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_ID ?? 'secretchat-placeholder';

export const config = getDefaultConfig({
  appName: 'SecretChat',
  projectId,
  chains: [sepolia],
  ssr: false,
});
