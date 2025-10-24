import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from './Header';
import { RegistrationForm } from './RegistrationForm';
import { MessageComposer } from './MessageComposer';
import { MessageList } from './MessageList';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { SECRET_CHAT_ADDRESS } from '../config/contracts';
import '../styles/SecretChatApp.css';

export function SecretChatApp() {
  const { address, isConnected, chainId } = useAccount();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox' | 'outbox'>('compose');
  const [lastSentKey, setLastSentKey] = useState<string | null>(null);

  return (
    <div className="secret-chat-app">
      <Header />
      <main className="chat-container">
        <div className="chat-layout">
          <aside className="chat-sidebar">
            <RegistrationForm account={address} chainId={chainId} />

            <section className="tab-section">
              <h2 className="section-title">Workspace</h2>
              <div className="tab-buttons">
                <button
                  className={activeTab === 'compose' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setActiveTab('compose')}
                >
                  Compose
                </button>
                <button
                  className={activeTab === 'inbox' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setActiveTab('inbox')}
                >
                  Inbox
                </button>
                <button
                  className={activeTab === 'outbox' ? 'tab-button active' : 'tab-button'}
                  onClick={() => setActiveTab('outbox')}
                >
                  Sent
                </button>
              </div>
            </section>

            {lastSentKey && (
              <div className="info-card">
                <h3>Latest message key</h3>
                <p>{lastSentKey}</p>
              </div>
            )}

            {!SECRET_CHAT_ADDRESS && (
              <p className="warning-text">Set VITE_SECRETCHAT_ADDRESS to interact with the contract.</p>
            )}

            {zamaError && <p className="error-text">{zamaError}</p>}
            {isZamaLoading && <p className="info-text">Initializing encryption service…</p>}
            {!isZamaLoading && !instance && <p className="warning-text">Encryption service unavailable.</p>}
          </aside>

          <section className="chat-content">
            {!isConnected && <p className="info-text">Connect a wallet to get started.</p>}

            {isConnected && activeTab === 'compose' && (
              <MessageComposer
                account={address}
                chainId={chainId}
                instance={instance}
                onMessageSent={setLastSentKey}
              />
            )}

            {isConnected && activeTab === 'inbox' && (
              <MessageList account={address} chainId={chainId} instance={instance} type="inbox" />
            )}

            {isConnected && activeTab === 'outbox' && (
              <MessageList account={address} chainId={chainId} instance={instance} type="outbox" />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
