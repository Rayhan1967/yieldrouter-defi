// _app.js - UPDATE VERSION
import '../styles/global.css'
import Head from 'next/head'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import { Buffer } from 'buffer';

// ✅ ADD THIS BUFFER POLYFILL - CRITICAL FOR ANCHOR
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Import wallet CSS
import '@solana/wallet-adapter-react-ui/styles.css';

function MyApp({ Component, pageProps }) {
  // Solana setup
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <>
      <Head>
        {/* ======= FAVICON & LOGO SETUP ======= */}
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        
        {/* ======= META TAGS ======= */}
        <title>YieldRouter DeFi - Solana Yield Vault Platform</title>
        <meta name="description" content="Cross-chain DeFi yield farming on Solana with Web3Auth embedded wallets and Yield Vault program" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8b5cf6" />
        
        {/* ======= SOCIAL SHARING (Open Graph) ======= */}
        <meta property="og:title" content="YieldRouter DeFi - Solana Yield Vault" />
        <meta property="og:description" content="Automated yield farming with Web3Auth social login and Solana blockchain integration" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yieldrouter.app" />
        
        {/* ======= TWITTER CARD ======= */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="YieldRouter DeFi" />
        <meta name="twitter:description" content="Solana Yield Vault with Web3Auth Integration" />
        <meta name="twitter:image" content="/logo.png" />
      </Head>

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Component {...pageProps} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}

export default MyApp
