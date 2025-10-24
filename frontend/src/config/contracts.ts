import { sepolia } from 'wagmi/chains';
import { SECRET_CHAT_ABI } from './secretChatAbi';

const envAddress = import.meta.env.VITE_SECRETCHAT_ADDRESS;

export const SECRET_CHAT_ADDRESS = envAddress ? (envAddress as `0x${string}`) : undefined;
export const SECRET_CHAT_CHAIN = sepolia;
export { SECRET_CHAT_ABI };
