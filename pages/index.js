import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Wallet, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Globe, 
  ArrowRightLeft,
  DollarSign,
  Shield,
  Settings,
  Bell,
  ChevronRight,
  Coins,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useYieldVaultProgram, getVaultPDA, getUserPositionPDA } from '../src/lib/anchor-client';
import { BN } from '@coral-xyz/anchor';
import { 
  getAssociatedTokenAddressSync,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { 
  initializeVaultTransaction, 
  depositToVaultTransaction,
  withdrawFromVaultTransaction,
  harvestRewardsTransaction 
} from '../src/lib/anchor-client';
import { initWeb3Auth } from '../lib/web3auth';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [strategies, setStrategies] = useState([]);
  const [yieldRates, setYieldRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [solanaConnection, setSolanaConnection] = useState(null);
  const [initializingWeb3Auth, setInitializingWeb3Auth] = useState(true);
  const [deployForm, setDeployForm] = useState({
    token: 'SOL',
    amount: '',
    protocol: 'Raydium',
    targetChain: 'Solana'
  });

  // Yield Vault specific states
  const [vaultForm, setVaultForm] = useState({
    mintAddress: 'So11111111111111111111111111111111111111112', // Default Wrapped SOL
    rewardRate: '1000' // Default reward rate
  });

  const validateInputs = () => {
    if (!vaultForm.mintAddress?.trim()) {
      throw new Error('Mint address is required');
    }
    
    if (!vaultForm.rewardRate?.trim()) {
      throw new Error('Reward rate is required');
    }
    
    const rate = parseInt(vaultForm.rewardRate);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('Reward rate must be a positive number');
    }
    
    try {
      new PublicKey(vaultForm.mintAddress);
    } catch {
      throw new Error('Invalid mint address format');
    }
    
    return true;
  };

  const [vaultMessage, setVaultMessage] = useState('');

  // Solana Wallet Adapter hooks
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const anchorProgram = useYieldVaultProgram();

  // Token addresses for Solana
  const SOLANA_TOKENS = {
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  };

  const TOKEN_DECIMALS = {
    'SOL': 9,
    'USDC': 6,
    'RAY': 6
  };

  const MINIMUM_DEPOSITS = {
    'SOL': 0.1,    
    'USDC': 10,    
    'RAY': 100,    
  };

  // Debug Environment Variables
  useEffect(() => {
    console.log('🔍 Debug Environment Variables:');
    console.log('Client ID:', process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? 'Present' : 'Missing');
    console.log('Solana RPC:', process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
  }, []);

  // UPDATE Web3Auth useEffect
  useEffect(() => {
    if (!mounted) return; // Skip jika server-side
    
    const init = async () => {
      try {
        setInitializingWeb3Auth(true);
        console.log('🔄 Initializing Web3Auth...');
        
        const web3authInstance = await initWeb3Auth();
        setWeb3auth(web3authInstance);
        
        const connection = new Connection(clusterApiUrl('devnet'));
        setSolanaConnection(connection);
        
        if (web3authInstance.connected) {
          setProvider(web3authInstance.provider);
          await getUserInfo(web3authInstance);
        }
        
        console.log('✅ Web3Auth initialized successfully');
        toast.success('🚀 Wallet SDK ready');
      } catch (error) {
        console.error('❌ Failed to initialize Web3Auth:', error);
        toast.error(`Failed to initialize wallet: ${error.message}`);
      } finally {
        setInitializingWeb3Auth(false);
      }
    };
    
    init();
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Skip jika belum mounted di client
    
    if (wallet && wallet.publicKey && connection) {
      (async () => {
        try {
          const balanceLamports = await connection.getBalance(wallet.publicKey);
          setBalance(balanceLamports / LAMPORTS_PER_SOL);
          setWalletAddress(wallet.publicKey.toBase58());
          setIsConnected(true);
          toast.success(`Solana wallet connected: ${wallet.publicKey.toBase58().slice(0, 8)}...`);
        } catch (error) {
          console.error('Failed to get Solana balance:', error);
          setBalance(0);
        }
      })();
    }
  }, [wallet, connection, mounted]); 

  useEffect(() => {
    setYieldRates({
      'Raydium-SOL': 12.4,
      'Orca-USDC': 8.7,
      'Jupiter-RAY': 15.2,
      'Marinade-SOL': 7.8,
      'Orca-SOL': 9.3,
      'Raydium-USDC': 11.1
    });
  }, []);

  const getUserInfo = async (web3authInstance) => {
    try {
      const userInfo = await web3authInstance.getUserInfo();
      const accounts = await web3authInstance.provider.request({
        method: "getAccounts",
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        
        if (solanaConnection) {
          try {
            const publicKey = new PublicKey(accounts);
            const balance = await solanaConnection.getBalance(publicKey);
            setBalance(balance / 1e9);
          } catch (balanceError) {
            console.error('Failed to get balance:', balanceError);
            setBalance(0);
          }
        }
        
        toast.success(`Welcome ${userInfo.name || 'User'}! Connected via ${userInfo.typeOfLogin}`);
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
      toast.error('Failed to get user info');
    }
  };

  const connectWallet = async () => {
  if (!web3auth) {
    toast.error('Web3Auth not initialized yet. Please wait...');
    return;
  }

  // Check if already connected
  if (web3auth.connected) {
    console.log('Wallet already connected');
    await getUserInfo(web3auth);
    return;
  }

  try {
    setLoading(true);
    console.log('🔄 Attempting to connect via Web3Auth...');
    
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    await getUserInfo(web3auth);
    
    toast.success('🎉 Wallet connected successfully!');
  } catch (error) {
    console.error('❌ Login failed:', error);
    if (error.message?.includes('User closed the modal') || 
        error.message?.includes('User cancelled') ||
        error.message?.includes('user rejected')) {
      toast.error('💭 Login cancelled by user');
    } else {
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};


  const disconnectWallet = async () => {
  try {
    // Check if web3auth exists
    if (!web3auth) {
      console.log('Web3Auth not initialized');
      setProvider(null);
      setIsConnected(false);
      setWalletAddress('');
      setBalance(0);
      setStrategies([]);
      return;
    }

    // Check if wallet is actually connected before calling logout
    if (!web3auth.connected) {
      console.log('Wallet is already disconnected, cleaning up state...');
      setProvider(null);
      setIsConnected(false);
      setWalletAddress('');
      setBalance(0);
      setStrategies([]);
      toast.success('🔓 Wallet disconnected');
      return;
    }

    // Only call logout if actually connected
    await web3auth.logout();
    
    // Clean up state
    setProvider(null);
    setIsConnected(false);
    setWalletAddress('');
    setBalance(0);
    setStrategies([]);
    
    console.log('✅ Web3Auth logout successful');
    toast.success('🔓 Wallet disconnected successfully');
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if logout fails, clean up the local state
    setProvider(null);
    setIsConnected(false);
    setWalletAddress('');
    setBalance(0);
    setStrategies([]);
    
    // Show appropriate message based on error
    if (error.message?.includes('not connected')) {
      toast.success('🔓 Wallet already disconnected');
    } else {
      toast.error(`Logout failed: ${error.message}`);
    }
  }
};

  const initializeVault = async () => {
  console.log('🎭 === SIMULATION VAULT INIT START ===');
  
  try {
    if (!anchorProgram?.program) {
      throw new Error('❌ Anchor program not available');
    }

    if (!wallet?.publicKey) {
      throw new Error('❌ Wallet not connected');
    }

    const mintAddress = vaultForm?.mintAddress?.trim();
    const rewardRateRaw = vaultForm?.rewardRate?.trim();

    if (!mintAddress || !rewardRateRaw) {
      throw new Error('❌ Missing form inputs');
    }

    const mint = new PublicKey(mintAddress);
    const rewardRate = parseInt(rewardRateRaw);
    if (isNaN(rewardRate) || rewardRate <= 0) {
      throw new Error('❌ Invalid reward rate');
    }
    const rewardRateBN = new BN(rewardRate);

    const [vault] = getVaultPDA(mint);
    const treasury = getAssociatedTokenAddressSync(mint, vault, true);

    setLoading(true);
    setVaultMessage('🎭 Initializing vault (SIMULATION)...');

    const txSignature = await anchorProgram.program.methods
      .initializeVault(rewardRateBN)
      .accounts({
        admin: wallet.publicKey,
        mint: mint,
        vault: vault,
        treasury: treasury,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    setVaultMessage(`🎉 SIMULATION: Vault Initialized!

✅ Transaction: ${txSignature}
✅ Vault PDA: ${vault.toString()}
✅ Treasury: ${treasury.toString()}
✅ Reward Rate: ${rewardRate} tokens/sec
✅ Admin: ${wallet.publicKey.toString()}

🎭 This was a SIMULATION transaction
🔗 Mock Solscan: https://solscan.io/tx/${txSignature}?cluster=devnet`);

    toast.success('🎉 Vault initialized successfully (SIMULATION)!');

  } catch (error) {
    console.error('❌ Initialize vault simulation error:', error);
    setVaultMessage(`❌ Error: ${error.message}`);
    toast.error(`Initialization failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


  const depositToVault = async () => {
  if (!anchorProgram?.program || !wallet?.publicKey) {
    toast.error('Please connect your Solana wallet first');
    return;
  }
  
  if (!vaultForm.mintAddress || !vaultForm.depositAmount) {
    toast.error('Please fill in mint address and deposit amount');
    return;
  }

  try {
    setLoading(true);
    setVaultMessage('🎭 Processing SIMULATION deposit...');
    toast.loading('💰 Processing Deposit (SIMULATION)...');

    const { program } = anchorProgram;
    const mint = new PublicKey(vaultForm.mintAddress);
    const [vault] = getVaultPDA(mint);
    const [userPosition] = getUserPositionPDA(vault, wallet.publicKey);
    const userTokenAccount = getAssociatedTokenAddressSync(mint, wallet.publicKey);
    const treasury = getAssociatedTokenAddressSync(mint, vault, true);
    const amount = parseFloat(vaultForm.depositAmount) * LAMPORTS_PER_SOL;
    
    console.log('🎭 SIMULATION: Creating deposit with:');
    console.log('- Amount:', vaultForm.depositAmount, 'SOL');
    console.log('- User Position PDA:', userPosition.toString());
    
    const tx = await program.methods
      .deposit(new BN(amount))
      .accounts({
        depositor: wallet.publicKey,
        mint: mint,
        vault: vault,
        treasury: treasury,
        userPosition: userPosition,
        userTokenAccount: userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    setVaultMessage(`💰 SIMULATION: Deposit Complete!

✅ Amount: ${vaultForm.depositAmount} SOL
✅ Transaction: ${tx}
✅ User Position: ${userPosition.toString()}
✅ Vault: ${vault.toString()}

🎭 This was a SIMULATION - no real SOL moved
🔗 Mock Solscan: https://solscan.io/tx/${tx}?cluster=devnet`);
    
    toast.dismiss();
    toast.success('💰 Deposit successful (SIMULATION)!');
    setVaultForm({...vaultForm, depositAmount: ''});
    
  } catch (error) {
    console.error('Deposit simulation failed:', error);
    setVaultMessage(`❌ Deposit simulation failed: ${error.message}`);
    toast.dismiss();
    toast.error(`Deposit failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const withdrawFromVault = async () => {
  if (!anchorProgram?.program || !wallet?.publicKey) {
    toast.error('Please connect your Solana wallet first');
    return;
  }
  
  if (!vaultForm.mintAddress || !vaultForm.withdrawAmount) {
    toast.error('Please fill in mint address and withdraw amount');
    return;
  }

  try {
    setLoading(true);
    setVaultMessage('🎭 Processing SIMULATION withdrawal...');
    toast.loading('🏦 Processing Withdrawal (SIMULATION)...');

    const { program } = anchorProgram;
    const mint = new PublicKey(vaultForm.mintAddress);
    const [vault] = getVaultPDA(mint);
    const [userPosition] = getUserPositionPDA(vault, wallet.publicKey);
    const amount = parseFloat(vaultForm.withdrawAmount) * LAMPORTS_PER_SOL;
    
    const tx = await program.methods
      .withdraw(new BN(amount))
      .accounts({
        depositor: wallet.publicKey,
        mint: mint,
        vault: vault,
        userPosition: userPosition,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    setVaultMessage(`🏦 SIMULATION: Withdrawal Complete!

✅ Amount: ${vaultForm.withdrawAmount} SOL
✅ Transaction: ${tx}
✅ User Position: ${userPosition.toString()}
✅ Vault: ${vault.toString()}

🎭 This was a SIMULATION - no real SOL moved
🔗 Mock Solscan: https://solscan.io/tx/${tx}?cluster=devnet`);
    
    toast.dismiss();
    toast.success('🏦 Withdrawal successful (SIMULATION)!');
    setVaultForm({...vaultForm, withdrawAmount: ''});
    
  } catch (error) {
    console.error('Withdrawal simulation failed:', error);
    setVaultMessage(`❌ Withdrawal simulation failed: ${error.message}`);
    toast.dismiss();
    toast.error(`Withdrawal failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const harvestRewards = async () => {
  if (!anchorProgram?.program || !wallet?.publicKey) {
    toast.error('Please connect your Solana wallet first');
    return;
  }
  
  if (!vaultForm.mintAddress) {
    toast.error('Please enter token mint address');
    return;
  }

  try {
    setLoading(true);
    setVaultMessage('🎭 Processing SIMULATION harvest...');
    toast.loading('🌾 Harvesting Rewards (SIMULATION)...');

    const { program } = anchorProgram;
    const mint = new PublicKey(vaultForm.mintAddress);
    const [vault] = getVaultPDA(mint);
    const [userPosition] = getUserPositionPDA(vault, wallet.publicKey);
    
    const tx = await program.methods
      .harvest()
      .accounts({
        depositor: wallet.publicKey,
        mint: mint,
        vault: vault,
        userPosition: userPosition,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    const mockRewards = (Math.random() * 10).toFixed(4);
    
    setVaultMessage(`🌾 SIMULATION: Harvest Complete!

✅ Simulated Rewards: ${mockRewards} tokens
✅ Transaction: ${tx}
✅ User Position: ${userPosition.toString()}
✅ Vault: ${vault.toString()}

🎭 This was a SIMULATION - no real rewards harvested
🔗 Mock Solscan: https://solscan.io/tx/${tx}?cluster=devnet`);
    
    toast.dismiss();
    toast.success('🌾 Harvest successful (SIMULATION)!');
    
  } catch (error) {
    console.error('Harvest simulation failed:', error);
    setVaultMessage(`❌ Harvest simulation failed: ${error.message}`);
    toast.dismiss();
    toast.error(`Harvest failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const deployStrategy = async () => {
    if (!provider || !solanaConnection) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!deployForm.amount || parseFloat(deployForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const minDeposit = MINIMUM_DEPOSITS[deployForm.token];
    const inputAmount = parseFloat(deployForm.amount);
    
    if (inputAmount < minDeposit) {
      toast.error(`Minimum deposit is ${minDeposit} ${deployForm.token}`);
      return;
    }

    try {
      setLoading(true);
      toast.loading('🚀 Deploying strategy on Solana...');

      const mockTransaction = {
        signature: 'mock_sol_' + Math.random().toString(36).substr(2, 9),
        amount: inputAmount,
        token: deployForm.token,
        protocol: deployForm.protocol,
        timestamp: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 3000));

      const newStrategy = {
        id: Date.now().toString(),
        protocol: deployForm.protocol,
        token: deployForm.token,
        amount: inputAmount,
        apy: yieldRates[`${deployForm.protocol}-${deployForm.token}`] || 10.0,
        chain: 'Solana',
        rewards: 0,
        status: 'Active',
        signature: mockTransaction.signature,
        deployedAt: new Date().toLocaleDateString()
      };

      setStrategies(prev => [...prev, newStrategy]);
      
      toast.dismiss();
      toast.success(`🎉 Strategy deployed on Solana! Tx: ${mockTransaction.signature.slice(0, 8)}...`);
      
      setDeployForm({
        token: 'SOL',
        amount: '',
        protocol: 'Raydium',
        targetChain: 'Solana'
      });
      
    } catch (error) {
      console.error('Deploy strategy failed:', error);
      toast.dismiss();
      toast.error(`Deploy failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const harvestRewardsStrategy = async (strategyId) => {
    if (!provider) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      toast.loading('🌾 Harvesting rewards from Solana...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStrategies(prev => prev.map(strategy => 
        strategy.id === strategyId 
          ? { 
              ...strategy, 
              rewards: strategy.rewards + (strategy.amount * strategy.apy / 100 / 12),
              lastHarvest: new Date().toLocaleDateString()
            }
          : strategy
      ));
      
      toast.dismiss();
      toast.success('🌾 Rewards harvested successfully from Solana!');
      
    } catch (error) {
      console.error('Harvest failed:', error);
      toast.dismiss();
      if (error.code === 4001 || error.message?.includes('user rejected')) {
        toast.error('💭 Transaction cancelled by user');
      } else {
        toast.error(`Harvest failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderYieldVault = () => (
    <div className="space-y-6 animate-slide-up">
      {/* Program Status Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Solana Yield Vault</h2>
            <p className="text-gray-600">Automated yield farming with reward accrual</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Program ID:</strong> 6Jj2xKBWPb5yLCzJw1wEBZTn3pQCvqPRkx4KA7rJTF5g
          </p>
          <p className="text-sm text-gray-600">
            <strong>Network:</strong> Solana Devnet | <strong>Status:</strong> 
            <span className="text-green-600 font-medium"> ✅ Live & Active</span>
          </p>
        </div>
      </div>

      {/* DEBUG PANEL - ENHANCED TROUBLESHOOTING */}
      <div className="bg-gray-100 border rounded-lg p-4 text-sm">
        <div className="flex items-center mb-2">
          <Info className="w-4 h-4 text-blue-500 mr-2" />
          <h4 className="font-medium">🔍 Debug Information:</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <p>Anchor Program: {anchorProgram ? '✅ Available' : '❌ Not Available'}</p>
            <p>Program Object: {anchorProgram?.program ? '✅ Available' : '❌ Not Available'}</p>
            <p>Program Methods: {anchorProgram?.program?.methods ? '✅ Available' : '❌ Not Available'}</p>
            <p>Provider: {anchorProgram?.provider ? '✅ Available' : '❌ Not Available'}</p>
          </div>
          <div className="space-y-1">
            <p>Wallet: {wallet ? '✅ Connected' : '❌ Not Connected'}</p>
            <p>Balance: {balance ? `${balance.toFixed(4)} SOL` : 'N/A'}</p>
            <p>Connection: {anchorProgram?.connection ? '✅ Ready' : '❌ Not Ready'}</p>
            <p>Program ID: {anchorProgram?.programId ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
        {anchorProgram && (
          <div className="mt-2 p-2 bg-white rounded text-xs">
            <p><strong>Available Properties:</strong> {Object.keys(anchorProgram).join(', ')}</p>
            {anchorProgram.programId && (
              <p><strong>Program ID:</strong> {anchorProgram.programId.toString()}</p>
            )}
          </div>
        )}
      </div>

      {/* Wallet Connection Status */}
      {!wallet ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-yellow-800 font-medium">Solana Wallet Required</p>
              <p className="text-yellow-700 text-sm">Connect Phantom or Solflare wallet to interact with Yield Vault</p>
              <div className="mt-3">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-800 font-medium">Solana Wallet Connected</p>
                <p className="text-green-700 text-sm">
                  Address: {wallet.publicKey.toString().slice(0, 8)}...{wallet.publicKey.toString().slice(-6)}
                </p>
                <p className="text-green-700 text-sm">
                  Balance: {balance.toFixed(4)} SOL
                </p>
              </div>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold">Auto Rewards</h3>
          </div>
          <p className="text-sm text-gray-600">Automatic reward calculation per second based on deposit amount</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold">Secure PDA</h3>
          </div>
          <p className="text-sm text-gray-600">Program Derived Address ensures secure token operations</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="font-semibold">Instant Harvest</h3>
          </div>
          <p className="text-sm text-gray-600">Harvest accumulated rewards instantly via token minting</p>
        </div>
      </div>

      {/* Vault Operations */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold flex items-center">
            <Coins className="w-5 h-5 mr-2 text-purple-600" />
            Vault Operations
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Initialize Vault */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">1. Initialize Vault</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Mint Address
                  </label>
                  <input
                    type="text"
                    placeholder="So11111111111111111111111111111111111111112 (Wrapped SOL)"
                    value={vaultForm.mintAddress}
                    onChange={(e) => setVaultForm({...vaultForm, mintAddress: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                  {vaultForm.mintAddress && (() => {
                    try {
                      new PublicKey(vaultForm.mintAddress);
                      return <p className="text-green-500 text-xs mt-1">✅ Valid mint address format</p>;
                    } catch {
                      return <p className="text-red-500 text-xs mt-1">⚠️ Invalid mint address format</p>;
                    }
                  })()} 
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Rate (tokens per second)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={vaultForm.rewardRate}
                    onChange={(e) => setVaultForm({...vaultForm, rewardRate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                    min="1"
                  />
                </div>
                <button
                  onClick={initializeVault}
                  disabled={loading || !wallet || !vaultForm.mintAddress || (() => {
                    try {
                      new PublicKey(vaultForm.mintAddress);
                      return false;
                    } catch {
                      return true;
                    }
                  })()}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Initializing...' : '🚀 Initialize Vault'}
                </button>
              </div>
            </div>

            {/* Deposit & Operations */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">2. Deposit & Earn</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Amount (SOL)
                  </label>
                  <input
                    type="number"
                    placeholder="Amount to deposit (min 0.01 SOL)"
                    value={vaultForm.depositAmount}
                    onChange={(e) => setVaultForm({...vaultForm, depositAmount: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={depositToVault}
                    disabled={loading || !wallet || !vaultForm.depositAmount || parseFloat(vaultForm.depositAmount) < 0.01}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Processing...' : '💰 Deposit'}
                  </button>
                  <button
                    onClick={harvestRewards}
                    disabled={loading || !wallet || !vaultForm.mintAddress}
                    className="flex-1 bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Processing...' : '🌾 Harvest'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Withdraw Amount (SOL)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Amount to withdraw"
                      value={vaultForm.withdrawAmount}
                      onChange={(e) => setVaultForm({...vaultForm, withdrawAmount: e.target.value})}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={loading}
                      step="0.01"
                      min="0.01"
                    />
                    <button
                      onClick={withdrawFromVault}
                      disabled={loading || !wallet || !vaultForm.withdrawAmount}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '⏳' : '🏦 Withdraw'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Status Message with Multi-line Support */}
          {vaultMessage && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-blue-800 text-sm font-medium whitespace-pre-line">{vaultMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Program Features */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Program Features</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Initialize vault with customizable reward rates</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Automatic reward accrual based on time and deposit</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Secure withdraw with PDA authority validation</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Harvest rewards via direct token minting</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Admin controls for vault management</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Math overflow protection and security features</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Examples */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border rounded-xl p-4">
        <h4 className="font-medium text-gray-800 mb-3">📋 Quick Examples:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Wrapped SOL (for testing):</p>
            <p className="text-gray-600 font-mono text-xs break-all">So11111111111111111111111111111111111111112</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Program Status:</p>
            <p className="text-green-600">✅ Live on Solana Devnet</p>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-white rounded border text-xs text-gray-600">
          <p><strong>💡 Pro Tip:</strong> Start with wrapped SOL mint address for testing. Make sure you have at least 0.1 SOL for transaction fees.</p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Debug Info Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="font-medium">Initializing:</span> {initializingWeb3Auth ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Web3Auth Ready:</span> {web3auth ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Solana Connected:</span> {wallet ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Client ID:</span> {process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? 'Set' : 'Missing'}
          </div>
        </div>
      </div>

      {/* Web3Auth Status */}
      {isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800">
              ✅ Connected via Web3Auth on Solana Devnet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          </div>
        </div>
      )}

      {/* Solana Wallet Status */}
      {wallet && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-purple-600 mr-2" />
            <p className="text-purple-800">
              🚀 Solana Wallet Connected: {wallet.publicKey.toString().slice(0, 8)}...{wallet.publicKey.toString().slice(-6)} | Balance: {balance.toFixed(4)} SOL
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">SOL Balance</p>
              <p className="text-2xl font-bold">{balance.toFixed(4)} SOL</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Rewards</p>
              <p className="text-2xl font-bold">
                {strategies.reduce((sum, s) => sum + (s.rewards || 0), 0).toFixed(4)} SOL
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Active Strategies</p>
              <p className="text-2xl font-bold">{strategies.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg APY</p>
              <p className="text-2xl font-bold">
                {strategies.length > 0 
                  ? (strategies.reduce((sum, s) => sum + (s.apy || 0), 0) / strategies.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
            <Zap className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Active Strategies */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Active Solana Strategies
          </h2>
        </div>
        <div className="p-0">
          {strategies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No strategies deployed yet</p>
              <p className="text-sm">Deploy your first Solana strategy to start earning yield.</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <div key={strategy.id} className="p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {strategy.token?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{strategy.protocol} - {strategy.token}</h3>
                      <p className="text-gray-600 text-sm">
                        {strategy.amount} {strategy.token} on {strategy.chain}
                      </p>
                      {strategy.signature && (
                        <p className="text-xs text-blue-600">
                          Tx: {strategy.signature.slice(0, 12)}... | {strategy.deployedAt}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{strategy.apy}% APY</p>
                    <p className="text-gray-600 text-sm">
                      +{(strategy.rewards || 0).toFixed(4)} {strategy.token} rewards
                    </p>
                    {strategy.lastHarvest && (
                      <p className="text-xs text-gray-500">Last: {strategy.lastHarvest}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => harvestRewardsStrategy(strategy.id)}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      🌾 Harvest
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Solana DeFi Opportunities */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Best Solana Yield Opportunities
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(yieldRates).map(([key, rate]) => {
              const [protocol, token] = key.split('-');
              return (
                <div key={key} className="p-4 border rounded-lg hover:border-purple-500 transition-colors cursor-pointer transform hover:scale-102">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{protocol}</h4>
                      <p className="text-gray-600 text-sm">{token} Pool on Solana</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">{rate}%</p>
                      <p className="text-xs text-gray-500">APY</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategies = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Deploy Solana Strategy</h2>
        
        {!isConnected && !wallet && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">Connect your wallet via Web3Auth or Solana Wallet to deploy strategies.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
            <select 
              value={deployForm.token}
              onChange={(e) => setDeployForm({...deployForm, token: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="SOL">SOL (Solana Native)</option>
              <option value="USDC">USDC (USD Coin)</option>
              <option value="RAY">RAY (Raydium)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input 
              type="number" 
              value={deployForm.amount}
              onChange={(e) => setDeployForm({...deployForm, amount: e.target.value})}
              placeholder={`Min: ${MINIMUM_DEPOSITS[deployForm.token]} ${deployForm.token}`}
              min={MINIMUM_DEPOSITS[deployForm.token]}
              step="0.01"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Network</label>
            <select 
              value={deployForm.targetChain}
              onChange={(e) => setDeployForm({...deployForm, targetChain: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="Solana">Solana</option>
            </select>
          </div>
        </div>

        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Info className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-medium text-purple-800">Solana Strategy Requirements</h4>
          </div>
          <div className="text-purple-700 text-sm space-y-1">
            <p>• Minimum deposit: {MINIMUM_DEPOSITS[deployForm.token]} {deployForm.token}</p>
            <p>• Network: Solana Devnet (for demo)</p>
            <p>• Authentication: Web3Auth social login</p>
            {deployForm.amount && parseFloat(deployForm.amount) < MINIMUM_DEPOSITS[deployForm.token] && (
              <p className="text-red-600 font-medium">⚠️ Amount below minimum - please increase</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Solana Protocol</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {['Raydium', 'Orca', 'Jupiter', 'Marinade'].map((protocol) => (
              <div 
                key={protocol} 
                onClick={() => !loading && setDeployForm({...deployForm, protocol})}
                className={`p-4 border rounded-lg cursor-pointer transition-colors transform hover:scale-105 ${
                  deployForm.protocol === protocol 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'hover:border-purple-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <h4 className="font-semibold">{protocol}</h4>
                <p className="text-green-600 text-sm">
                  {yieldRates[`${protocol}-SOL`] || yieldRates[`${protocol}-${deployForm.token}`] || '10.0'}% APY
                </p>
                <p className="text-xs text-gray-500">on Solana</p>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            (!isConnected && !wallet) || 
            loading || 
            !deployForm.amount || 
            parseFloat(deployForm.amount) < MINIMUM_DEPOSITS[deployForm.token]
          }
          onClick={deployStrategy}
        >
          {loading ? '⏳ Deploying to Solana...' : '🚀 Deploy Strategy on Solana'}
        </button>

        {/* Web3Auth Integration Info */}
        {isConnected && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔐 Web3Auth Features:</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                <li>✅ Social login (Google, Twitter, Discord) - No seed phrases!</li>
                <li>✅ Embedded wallet automatically created</li>
                <li>✅ Cross-device wallet access with same social account</li>
                <li>✅ Enterprise-grade security with MPC technology</li>
              </ul>
            </div>
          </div>
        )}

        {/* Solana Wallet Integration Info */}
        {wallet && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🌟 Solana Integration:</h4>
              <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
                <li>✅ Native Solana RPC connection</li>
                <li>✅ Integrated with top Solana DeFi protocols</li>
                <li>✅ Low transaction fees and fast confirmations</li>
                <li>✅ Real-time yield optimization on Solana ecosystem</li>
                <li>✅ Yield Vault program deployed: 6Jj2xKBWPb5yLCzJw1wEBZTn3pQCvqPRkx4KA7rJTF5g</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderBridge = () => (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2" />
          Cross-Chain Bridge (Coming Soon)
        </h2>
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 text-sm">Cross-chain bridge between Ethereum and Solana is in development. This will enable seamless asset transfers using Wormhole protocol.</p>
          </div>
        </div>
        
        <div className="space-y-6 opacity-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">From</h3>
              <select className="w-full p-3 border rounded-lg mb-3" disabled>
                <option>Ethereum</option>
              </select>
              <select className="w-full p-3 border rounded-lg mb-3" disabled>
                <option>USDC</option>
              </select>
              <input 
                type="number" 
                placeholder="Amount" 
                className="w-full p-3 border rounded-lg"
                disabled
              />
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">To</h3>
              <select className="w-full p-3 border rounded-lg mb-3" disabled>
                <option>Solana</option>
              </select>
              <select className="w-full p-3 border rounded-lg mb-3" disabled>
                <option>USDC</option>
              </select>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">You will receive ≈</p>
                <p className="text-lg font-semibold">0.00 USDC</p>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed"
            disabled
          >
            🌉 Bridge Assets (Coming Q1 2025)
          </button>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Coins className="w-5 h-5 mr-2 text-purple-600" />
        Portfolio Analytics (Coming Soon)
      </h2>
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Cross-chain portfolio analytics with Solana and Ethereum integration.</p>
        <p className="text-gray-500 text-sm">Track your DeFi performance across multiple chains</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Coming Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Multi-chain asset tracking</li>
            <li>• Performance analytics and ROI calculations</li>
            <li>• Risk assessment and diversification insights</li>
            <li>• Automated rebalancing suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>YieldRouter - Cross-Chain DeFi with Web3Auth & Solana Yield Vault</title>
        <meta name="description" content="Social login DeFi yield farming on Solana with Web3Auth embedded wallets and Yield Vault program" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }} 
        />
        
        {/* CONDITIONAL RENDERING BERDASARKAN MOUNTED STATE */}
        {!mounted ? (
          // LOADING STATE SAAT BELUM MOUNTED
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading YieldRouter DeFi...</p>
            </div>
          </div>
        ) : (
          // MAIN CONTENT SETELAH MOUNTED
          <>
            {/* Header */}
            <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        YieldRouter
                      </h1>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        Web3Auth + Solana + Yield Vault
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
                    <Settings className="w-5 h-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
                    
                    {/* Solana Wallet Button */}
                    <WalletMultiButton />
                    
                    {/* Web3Auth Button */}
                    {!isConnected ? (
                      <button
                        onClick={connectWallet}
                        disabled={loading || initializingWeb3Auth || !web3auth}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        {loading 
                          ? 'Connecting...' 
                          : initializingWeb3Auth 
                            ? 'Initializing...'
                            : !web3auth
                              ? 'SDK Loading...'
                              : 'Login with Web3Auth'
                        }
                      </button>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium text-sm">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </div>
                        <button
                          onClick={disconnectWallet}
                          className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {!isConnected && !wallet ? (
                <div className="text-center py-12 animate-fade-in">
                  <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce-light" />
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect via Web3Auth or Solana Wallet</h2>
                  <p className="text-gray-600 mb-8">
                    Login with Google, Twitter, email or connect Phantom/Solflare wallet
                  </p>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={connectWallet}
                        disabled={loading || initializingWeb3Auth || !web3auth}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {loading 
                          ? 'Connecting...' 
                          : initializingWeb3Auth 
                            ? 'Initializing SDK...'
                            : !web3auth
                              ? 'Loading...'
                              : '🔐 Login with Social Account'
                        }
                      </button>
                      <div className="flex justify-center">
                        <WalletMultiButton />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {initializingWeb3Auth 
                        ? 'Initializing Web3Auth SDK...' 
                        : 'Powered by Web3Auth embedded wallets on Solana with Yield Vault program'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  {/* Navigation Tabs */}
                  <div className="flex space-x-1 mb-8 bg-white p-1 rounded-xl shadow-sm border">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                      { id: 'strategies', label: 'Solana Strategies', icon: TrendingUp },
                      { id: 'yieldvault', label: 'Yield Vault', icon: Shield },
                      { id: 'bridge', label: 'Bridge', icon: ArrowRightLeft },
                      { id: 'portfolio', label: 'Portfolio', icon: Coins }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-purple-600 text-white shadow-md transform scale-105'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  {activeTab === 'dashboard' && renderDashboard()}
                  {activeTab === 'strategies' && renderStrategies()}
                  {activeTab === 'yieldvault' && renderYieldVault()}
                  {activeTab === 'bridge' && renderBridge()}
                  {activeTab === 'portfolio' && renderPortfolio()}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-light {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-bounce-light {
          animation: bounce-light 2s infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
}
