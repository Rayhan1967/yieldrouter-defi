// pages/index.js
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
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { initWeb3Auth } from '../lib/web3auth';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
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
  const [deployForm, setDeployForm] = useState({
    token: 'SOL',
    amount: '',
    protocol: 'Raydium',
    targetChain: 'Solana'
  });

  // Solana tokens untuk testnet
  const SOLANA_TOKENS = {
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'RAY': 'Raydium token address', // Add real addresses
  };

  const TOKEN_DECIMALS = {
    'SOL': 9,
    'USDC': 6,
    'RAY': 6
  };

  const MINIMUM_DEPOSITS = {
    'SOL': 0.1,    // 0.1 SOL
    'USDC': 10,    // 10 USDC
    'RAY': 100,    // 100 RAY
  };

  // Initialize Web3Auth and Solana connection
  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = await initWeb3Auth();
        setWeb3auth(web3authInstance);
        
        const connection = new Connection(clusterApiUrl('devnet'));
        setSolanaConnection(connection);
        
        // Auto-connect if user was previously logged in
        if (web3authInstance.connected) {
          setProvider(web3authInstance.provider);
          await getUserInfo(web3authInstance);
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error);
        toast.error('Failed to initialize wallet connection');
      }
    };
    init();
  }, []);

  // Mock yield rates for Solana DeFi protocols
  useEffect(() => {
    setYieldRates({
      'Raydium-SOL': 12.4,
      'Orca-USDC': 8.7,
      'Jupiter-RAY': 15.2,
      'Marinade-SOL': 7.8
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
        
        // Get Solana balance
        if (solanaConnection) {
          const publicKey = new PublicKey(accounts[0]);
          const balance = await solanaConnection.getBalance(publicKey);
          setBalance(balance / 1e9); // Convert lamports to SOL
        }
        
        toast.success(`Welcome ${userInfo.name || 'User'}! Wallet connected via ${userInfo.typeOfLogin}`);
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  };

  const connectWallet = async () => {
    if (!web3auth) {
      toast.error('Web3Auth not initialized yet');
      return;
    }

    try {
      setLoading(true);
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      await getUserInfo(web3auth);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (!web3auth) return;
    
    try {
      await web3auth.logout();
      setProvider(null);
      setIsConnected(false);
      setWalletAddress('');
      setBalance(0);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to disconnect wallet');
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
      toast.loading('Deploying strategy on Solana...');

      // Simulate Solana transaction
      // In real implementation, you'd interact with Solana programs
      const mockTransaction = {
        signature: 'mock_signature_' + Date.now(),
        amount: inputAmount,
        token: deployForm.token,
        protocol: deployForm.protocol,
        timestamp: new Date().toISOString()
      };

      // Simulate delay for blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Add to strategies
      const newStrategy = {
        id: Date.now().toString(),
        protocol: deployForm.protocol,
        token: deployForm.token,
        amount: inputAmount,
        apy: yieldRates[`${deployForm.protocol}-${deployForm.token}`] || 10.0,
        chain: 'Solana',
        rewards: 0,
        status: 'Active',
        signature: mockTransaction.signature
      };

      setStrategies(prev => [...prev, newStrategy]);
      
      toast.dismiss();
      toast.success(`🎉 Strategy deployed on Solana! Signature: ${mockTransaction.signature.slice(0, 8)}...`);
      
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

  const harvestRewards = async (strategyId) => {
    if (!provider) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Harvesting rewards from Solana...');
      
      // Simulate reward harvest
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update strategy rewards
      setStrategies(prev => prev.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, rewards: strategy.rewards + (strategy.amount * strategy.apy / 100 / 12) }
          : strategy
      ));
      
      toast.dismiss();
      toast.success('🌾 Rewards harvested successfully from Solana!');
      
    } catch (error) {
      console.error('Harvest failed:', error);
      toast.dismiss();
      toast.error(`Harvest failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Web3Auth Status */}
      {isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800">
              ✅ Connected via Web3Auth on Solana Devnet
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
                          Tx: {strategy.signature.slice(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{strategy.apy}% APY</p>
                    <p className="text-gray-600 text-sm">
                      +{(strategy.rewards || 0).toFixed(4)} {strategy.token} rewards
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => harvestRewards(strategy.id)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">Connect your wallet via Web3Auth to deploy strategies on Solana.</p>
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

        {/* Minimum Deposit Info */}
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
            !isConnected || 
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
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🌟 Solana Integration:</h4>
              <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
                <li>✅ Native Solana RPC connection</li>
                <li>✅ Integrated with top Solana DeFi protocols</li>
                <li>✅ Low transaction fees and fast confirmations</li>
                <li>✅ Real-time yield optimization on Solana ecosystem</li>
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

  return (
    <>
      <Head>
        <title>YieldRouter - Cross-Chain DeFi with Web3Auth & Solana</title>
        <meta name="description" content="Social login DeFi yield farming on Solana with Web3Auth embedded wallets" />
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
                    Web3Auth + Solana
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
                <Settings className="w-5 h-5 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {loading ? 'Connecting...' : 'Login with Web3Auth'}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isConnected ? (
            <div className="text-center py-12 animate-fade-in">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce-light" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect via Web3Auth</h2>
              <p className="text-gray-600 mb-8">Login with Google, Twitter, or email - No seed phrases required!</p>
              <div className="space-y-4">
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : '🔐 Login with Social Account'}
                </button>
                <p className="text-sm text-gray-500">Powered by Web3Auth embedded wallets on Solana</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 mb-8 bg-white p-1 rounded-xl shadow-sm border">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'strategies', label: 'Solana Strategies', icon: TrendingUp },
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
              {activeTab === 'bridge' && renderBridge()}
              {activeTab === 'portfolio' && (
                <div className="bg-white rounded-xl shadow-sm border p-6 animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Coins className="w-5 h-5 mr-2 text-purple-600" />
                    Portfolio Analytics (Coming Soon)
                  </h2>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Cross-chain portfolio analytics with Solana and Ethereum integration.</p>
                    <p className="text-gray-500 text-sm mt-2">Track your DeFi performance across multiple chains</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
