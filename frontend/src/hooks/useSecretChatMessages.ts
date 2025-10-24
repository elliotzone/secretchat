import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { SECRET_CHAT_ABI, SECRET_CHAT_ADDRESS, SECRET_CHAT_CHAIN } from '../config/contracts';

export type MessageRecord = {
  id: number;
  sender: string;
  senderUsername: string;
  recipient: string;
  recipientUsername: string;
  ciphertext: string;
  timestamp: number;
};

async function fetchMessageIds(
  client: NonNullable<ReturnType<typeof usePublicClient>>,
  contractAddress: `0x${string}`,
  type: 'inbox' | 'outbox',
  address: string,
) {
  const functionName = type === 'inbox' ? 'getInboxIds' : 'getOutboxIds';
  const ids = (await client.readContract({
    abi: SECRET_CHAT_ABI,
    address: contractAddress,
    functionName,
    args: [address as `0x${string}`],
  })) as readonly bigint[];

  return ids as unknown as bigint[];
}

async function fetchMessages(
  client: NonNullable<ReturnType<typeof usePublicClient>>,
  contractAddress: `0x${string}`,
  ids: readonly bigint[],
) {
  if (ids.length === 0) {
    return [] as MessageRecord[];
  }

  const messages = await Promise.all(
    ids.map(async (id) => {
      const result = (await client.readContract({
        abi: SECRET_CHAT_ABI,
        address: contractAddress,
        functionName: 'getMessageMetadata',
        args: [id],
      })) as readonly [string, string, string, string, string, bigint];

      return {
        id: Number(id),
        sender: result[0],
        senderUsername: result[1],
        recipient: result[2],
        recipientUsername: result[3],
        ciphertext: result[4],
        timestamp: Number(result[5]),
      } satisfies MessageRecord;
    }),
  );

  return messages.sort((a, b) => b.timestamp - a.timestamp);
}

export function useSecretChatMessages(type: 'inbox' | 'outbox', account?: string) {
  const client = usePublicClient({ chainId: SECRET_CHAT_CHAIN.id });
  const contractAddress = SECRET_CHAT_ADDRESS as `0x${string}` | undefined;

  return useQuery({
    queryKey: ['secret-chat', type, account],
    queryFn: async () => {
      if (!client || !account || !contractAddress) {
        return [] as MessageRecord[];
      }

      const ids = await fetchMessageIds(client, contractAddress, type, account);
      return fetchMessages(client, contractAddress, ids);
    },
    enabled: Boolean(client && account && contractAddress),
    refetchOnWindowFocus: false,
  });
}
