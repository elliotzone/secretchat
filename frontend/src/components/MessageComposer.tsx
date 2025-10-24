import type { FormEvent } from 'react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Contract, ZeroAddress, getAddress, isAddress } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { SECRET_CHAT_ABI, SECRET_CHAT_ADDRESS } from '../config/contracts';
import { generateRandomKey, encryptMessage } from '../utils/encryption';

type MessageComposerProps = {
  account?: string;
  chainId?: number;
  instance: any;
  onMessageSent: (key: string) => void;
};

export function MessageComposer({ account, chainId, instance, onMessageSent }: MessageComposerProps) {
  const [recipientUsername, setRecipientUsername] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const signerPromise = useEthersSigner({ chainId });
  const queryClient = useQueryClient();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!SECRET_CHAT_ADDRESS) {
      setError('Contract address is not configured');
      setStatus('error');
      return;
    }

    if (!account) {
      setError('Connect a wallet first');
      setStatus('error');
      return;
    }

    if (!signerPromise) {
      setError('Wallet signer unavailable');
      setStatus('error');
      return;
    }

    if (!instance) {
      setError('Encryption service not ready');
      setStatus('error');
      return;
    }

    const usernameValue = recipientUsername.trim();
    const addressValue = recipientAddress.trim();
    const messageValue = message.trim();

    if (!messageValue) {
      setError('Message cannot be empty');
      setStatus('error');
      return;
    }

    if (!usernameValue && !addressValue) {
      setError('Provide a recipient username or address');
      setStatus('error');
      return;
    }

    if (addressValue && !isAddress(addressValue)) {
      setError('Recipient address is invalid');
      setStatus('error');
      return;
    }

    try {
      setStatus('submitting');
      setError(null);

      const key = generateRandomKey();
      const ciphertext = await encryptMessage(messageValue, key);

      const buffer = instance.createEncryptedInput(SECRET_CHAT_ADDRESS, account);
      buffer.add32(Number(key));
      const encryptedPayload = await buffer.encrypt();

      const signer = await signerPromise;
      const contract = new Contract(SECRET_CHAT_ADDRESS, SECRET_CHAT_ABI, signer);
      const tx = await contract.sendMessage(
        usernameValue,
        addressValue ? getAddress(addressValue) : ZeroAddress,
        ciphertext,
        encryptedPayload.handles[0],
        encryptedPayload.inputProof,
      );
      await tx.wait();

      setStatus('idle');
      setMessage('');
      setRecipientAddress('');
      setRecipientUsername('');
      onMessageSent(key);

      await queryClient.invalidateQueries({ queryKey: ['secret-chat', 'outbox', account] });
      await queryClient.invalidateQueries({ queryKey: ['secret-chat', 'inbox', account] });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError((err as Error).message ?? 'Failed to send message');
    }
  };

  const isDisabled = status === 'submitting';

  return (
    <section className="content-card">
      <h2 className="section-title">Compose message</h2>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-row">
          <label className="form-label" htmlFor="recipientUsername">
            Recipient username
          </label>
          <input
            id="recipientUsername"
            type="text"
            className="form-input"
            value={recipientUsername}
            onChange={(event) => setRecipientUsername(event.target.value)}
            placeholder="friend"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="recipientAddress">
            Recipient address
          </label>
          <input
            id="recipientAddress"
            type="text"
            className="form-input"
            value={recipientAddress}
            onChange={(event) => setRecipientAddress(event.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="messageBody">
            Message
          </label>
          <textarea
            id="messageBody"
            className="form-textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your encrypted message"
            rows={5}
          />
        </div>

        <button className="primary-button" type="submit" disabled={isDisabled}>
          {isDisabled ? 'Sending…' : 'Send message'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {status === 'idle' && !error && (
        <p className="info-text">The app encrypts content and keys automatically.</p>
      )}
    </section>
  );
}
