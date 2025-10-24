import type { FormEvent } from 'react';
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { SECRET_CHAT_ABI, SECRET_CHAT_ADDRESS } from '../config/contracts';
import '../styles/SecretChatApp.css';

type RegistrationFormProps = {
  account?: string;
  chainId?: number;
};

export function RegistrationForm({ account, chainId }: RegistrationFormProps) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const signerPromise = useEthersSigner({ chainId });

  const usernameQuery = useReadContract({
    abi: SECRET_CHAT_ABI,
    address: SECRET_CHAT_ADDRESS,
    functionName: 'getUsername',
    args: account ? [account as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(account && SECRET_CHAT_ADDRESS),
      refetchOnWindowFocus: false,
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      setStatus('error');
      return;
    }

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

    try {
      setStatus('submitting');
      setError(null);

      const signer = await signerPromise;
      const contract = new Contract(SECRET_CHAT_ADDRESS, SECRET_CHAT_ABI, signer);
      const tx = await contract.registerUsername(username.trim());
      await tx.wait();

      setStatus('success');
      setUsername('');
      await usernameQuery.refetch();
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError((err as Error).message ?? 'Failed to register username');
    }
  };

  return (
    <section className="sidebar-card">
      <h2 className="section-title">Username</h2>
      <form className="form" onSubmit={onSubmit}>
        <label className="form-label" htmlFor="username">
          Choose a username
        </label>
        <input
          id="username"
          type="text"
          className="form-input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="e.g. alice"
          maxLength={64}
        />
        <button className="primary-button" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Saving…' : 'Save username'}
        </button>
      </form>
      {usernameQuery.data && (
        <p className="info-text">Current username: {usernameQuery.data || 'Not set'}</p>
      )}
      {status === 'success' && <p className="success-text">Username updated.</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
