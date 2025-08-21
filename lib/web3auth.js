import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "BMKLbXXKAPL-fz4ewRwT9TPIA90MchL5TbZTTJ9R3Ql8wZGXO1uITVoL1IDhEi6UCaZPwrFHFq4GCUP4kpvcXkg";

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
    // ===== PROVIDER HARUS INI! =====
    const privateKeyProvider = new SolanaPrivateKeyProvider({
      config: { chainConfig }
    });

    const openloginAdapter = new OpenloginAdapter({
      privateKeyProvider,
      adapterSettings: {
        uxMode: "popup",
        whiteLabel: {
          appName: "YieldRouter",
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
      privateKeyProvider,
      chainConfig,
      uiConfig: {
        appName: "YieldRouter",
        theme: { primary: "#7c3aed" },
        mode: "light",
        logoLight: "https://web3auth.io/images/web3auth-logo.svg",
        logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
        defaultLanguage: "en",
      }
    });

    // ===== DEBUG LOG, lihat di browser console setelah login fail/success =====
    console.log("DEBUG privateKeyProvider:", privateKeyProvider);
    console.log("DEBUG openloginAdapter:", openloginAdapter);

    // ===== URUTAN INI HARUS BENAR =====
    web3auth.configureAdapter(openloginAdapter);
    await web3auth.initModal();
    return web3auth;

  } catch (error) {
    console.error('Failed to initialize Web3Auth:', error);
    throw error;
  }
};
