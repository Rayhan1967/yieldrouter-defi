import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';

<<<<<<< HEAD
const clientId = "BMKLbXXKAPL-fz4ewRwT9TPIA90MchL5TbZTTJ9R3Ql8wZGXO1uITVoL1IDhEi6UCaZPwrFHFq4GCUP4kpvcXkg"; // Get from Web3Auth Dashboard
=======
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "BMKLbXXKAPL-fz4ewRwT9TPIA90MchL5TbZTTJ9R3Ql8wZGXO1uITVoL1IDhEi6UCaZPwrFHFq4GCUP4kpvcXkg";
>>>>>>> a5f70c9 (Final YieldRouter DeFi app update: bugfix and docs ready for hackathon)

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x3", // Solana Devnet
  rpcTarget: "https://api.devnet.solana.com",
  displayName: "Solana Devnet",
  blockExplorer: "https://solscan.io",
  ticker: "SOL",
  tickerName: "Solana",
};

export const initWeb3Auth = async () => {
  try {
    console.log('🔄 Initializing Web3Auth with Client ID:', clientId ? 'Present' : 'Missing');
    
    const privateKeyProvider = new SolanaPrivateKeyProvider({
      config: { chainConfig }
    });

    const openloginAdapter = new OpenloginAdapter({
      privateKeyProvider,
      adapterSettings: {
        uxMode: "popup",
        whiteLabel: {
          appName: "YieldRouter",
          appUrl: "https://yieldrouter-defi.vercel.app",
          logoLight: "https://web3auth.io/images/web3auth-logo.svg",
          logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
          defaultLanguage: "en",
          mode: "light",
        },
      }
    });

    const web3auth = new Web3Auth({
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      chainConfig,
      uiConfig: {
        appName: "YieldRouter",
        theme: {
          primary: "#7c3aed",
        },
        mode: "light",
        logoLight: "https://web3auth.io/images/web3auth-logo.svg",
        logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
        defaultLanguage: "en",
      },
    });

    
    web3auth.configureAdapter(openloginAdapter);
    
    
    await web3auth.initModal();
    
    console.log('✅ Web3Auth initialized successfully');
    return web3auth;
  } catch (error) {
    console.error('❌ Failed to initialize Web3Auth:', error);
    throw error;
  }
};
