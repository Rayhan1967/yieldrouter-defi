// lib/web3auth.js
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { SolanaWalletAdapter } from '@web3auth/solana-provider';

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // Get from Web3Auth Dashboard

export const web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x3", // Solana Devnet
    rpcTarget: "https://api.devnet.solana.com",
    displayName: "Solana Devnet",
    blockExplorer: "https://solscan.io",
    ticker: "SOL",
    tickerName: "Solana",
  },
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
};

export const initWeb3Auth = async () => {
  const web3auth = new Web3Auth(web3AuthOptions);
  await web3auth.initModal();
  return web3auth;
};
