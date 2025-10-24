import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useSecretChatMessages } from '../hooks/useSecretChatMessages';
import type { MessageRecord } from '../hooks/useSecretChatMessages';
import { SECRET_CHAT_ABI, SECRET_CHAT_ADDRESS, SECRET_CHAT_CHAIN } from '../config/contracts';
import { decryptMessage } from '../utils/encryption';

type MessageListProps = {
  account?: string;
  chainId?: number;
  instance: any;
  type: 'inbox' | 'outbox';
};

type DecryptedState = Record<number, { key: string; plainText: string }>;

export function MessageList({ account, chainId, instance, type }: MessageListProps) {
  const signerPromise = useEthersSigner({ chainId });
  const { data, isLoading } = useSecretChatMessages(type, account);
  const [decrypted, setDecrypted] = useState<DecryptedState>({});
  const [error, setError] = useState<string | null>(null);
  const [decryptingId, setDecryptingId] = useState<number | null>(null);
  const publicClient = usePublicClient({ chainId: SECRET_CHAT_CHAIN.id });
  const queryClient = useQueryClient();

  const decryptKey = async (message: MessageRecord) => {
    if (!instance) {
      setError('Encryption service not ready');
      return;
    }

    if (!signerPromise) {
      setError('Wallet signer unavailable');
      return;
    }

    if (!SECRET_CHAT_ADDRESS) {
      setError('Contract address is not configured');
      return;
    }

    if (!publicClient) {
      setError('RPC client unavailable');
      return;
    }

    try {
      setDecryptingId(message.id);
      setError(null);

      const encryptedKey = (await publicClient.readContract({
        abi: SECRET_CHAT_ABI,
        address: SECRET_CHAT_ADDRESS,
        functionName: 'getEncryptedKey',
        args: [BigInt(message.id)],
      })) as string;

      const signer = await signerPromise;
      const signerAddress = await signer.getAddress();

      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contractAddresses = [SECRET_CHAT_ADDRESS];

      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        [
          {
            handle: encryptedKey,
            contractAddress: SECRET_CHAT_ADDRESS,
          },
        ],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        signerAddress,
        startTimestamp,
        durationDays,
      );

      const decryptedKey = result[encryptedKey]?.toString();
      if (!decryptedKey) {
        throw new Error('Failed to decrypt key');
      }

      const plainText = await decryptMessage(message.ciphertext, decryptedKey);

      setDecrypted((prev) => ({ ...prev, [message.id]: { key: decryptedKey, plainText } }));
      await queryClient.invalidateQueries({ queryKey: ['secret-chat', type, account] });
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? 'Failed to decrypt message');
    } finally {
      setDecryptingId(null);
    }
  };

  if (!SECRET_CHAT_ADDRESS) {
    return <p className="warning-text">Contract address missing.</p>;
  }

  if (isLoading) {
    return <p className="info-text">Loading messages…</p>;
  }

  if (!data || data.length === 0) {
    return <p className="info-text">No messages yet.</p>;
  }

  return (
    <section className="content-card">
      <h2 className="section-title">{type === 'inbox' ? 'Inbox' : 'Sent messages'}</h2>
      {error && <p className="error-text">{error}</p>}
      <div className="message-list">
        {data.map((message) => {
          const decryptedEntry = decrypted[message.id];
          return (
            <article key={message.id} className="message-card">
              <div className="message-metadata">
                <div>
                  <strong>From:</strong> {message.senderUsername || message.sender}
                </div>
                <div>
                  <strong>To:</strong> {message.recipientUsername || message.recipient}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date(message.timestamp * 1000).toLocaleString()}
                </div>
              </div>
              <p className="ciphertext">Ciphertext: {message.ciphertext}</p>
              {decryptedEntry ? (
                <div className="decrypted-block">
                  <p><strong>Decrypted key:</strong> {decryptedEntry.key}</p>
                  <p><strong>Message:</strong> {decryptedEntry.plainText}</p>
                </div>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() => decryptKey(message)}
                  disabled={decryptingId === message.id}
                >
                  {decryptingId === message.id ? 'Decrypting…' : 'Decrypt message'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
