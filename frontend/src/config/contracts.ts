import { sepolia } from 'wagmi/chains';
import { SECRET_CHAT_ABI } from './secretChatAbi';

const envAddress = "0x1F1B4D5D42caFc496E81DBfbbF7285075be3a8FF";

export const SECRET_CHAT_ADDRESS = envAddress ? (envAddress as `0x${string}`) : undefined;
export const SECRET_CHAT_CHAIN = sepolia;
export { SECRET_CHAT_ABI };
