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
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [strategies, setStrategies] = useState([]);
  const [yieldRates, setYieldRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractDeployed, setContractDeployed] = useState(false);
  const [deployForm, setDeployForm] = useState({
    token: 'USDC',
    amount: '',
    protocol: 'Aave',
    targetChain: 'Ethereum'
  });

  // Contract configuration - UPDATED WITH DEPLOYED ADDRESSES
  const CONTRACT_ADDRESS = "0xfCFF84BE5680300cf05542F0d2fe0b69A1888071";
  const CONTRACT_ABI = [
    "function deployStrategy(address token, uint256 amount, string protocol, string targetChain) external",
    "function getUserStrategies(address user) external view returns (uint256[] memory)",
    "function getStrategy(uint256 strategyId) external view returns (tuple(uint256 id, address user, address token, uint256 amount, uint256 deployedAt, string protocol, string targetChain, uint256 totalRewards, bool active))",
    "function calculatePotentialRewards(uint256 strategyId) external view returns (uint256)",
    "function harvestRewards(uint256 strategyId) external",
    "function getBestYield(address token) external view returns (string memory, uint256)",
    "function initiateBridge(address fromToken, address toToken, uint256 amount, string targetChain) external returns (bytes32)",
    "function supportedTokens(address) external view returns (bool)",
    "function addSupportedToken(address token) external",
    "function updateProtocol(string memory _protocol, address _contractAddress, uint256 _minDeposit, uint256 _performanceFee, bool _active) external",
    "function updateYieldRate(string memory _protocol, uint256 _apy, uint256 _tvl) external",
    "function owner() external view returns (address)",
    "event StrategyDeployed(address indexed user, uint256 indexed strategyId, address token, uint256 amount, string targetChain)",
    "event YieldHarvested(address indexed user, uint256 indexed strategyId, uint256 rewards, uint256 timestamp)"
  ];

  // Token addresses from deployment
  const TOKEN_ADDRESSES = {
    'USDC': '0xDA5e0021135cEf939C16186e09887391cd214c49',
    'DAI': '0x8E459c6ED35FcC02D76322f695afbAa5C3bAFa9A',
    'USDT': '0xf6008900Cbbf56F3886C9cb58fAaC3B5c293298A',
    'ETH': '0x0000000000000000000000000000000000000000'
  };

  const TOKEN_DECIMALS = {
    'USDC': 6,
    'DAI': 18,
    'USDT': 6,
    'ETH': 18
  };

  // Minimum deposits per protocol (in tokens, not wei)
  const MINIMUM_DEPOSITS = {
    'USDC': 1,    // 1 USDC
    'DAI': 1,     // 1 DAI  
    'USDT': 1,    // 1 USDT
    'ETH': 0.01   // 0.01 ETH
  };

  // Mock data for demonstration
  useEffect(() => {
    setYieldRates({
      'Aave-USDC': 8.5,
      'Compound-DAI': 7.2,
      'Raydium-SOL': 12.3,
      'PancakeSwap-BNB': 15.1
    });
  }, []);

  // Setup contract on initialization
  const setupContract = async () => {
    if (!contract || !walletAddress) return;
    
    try {
      // Check if user is owner
      const owner = await contract.owner();
      const isOwner = owner.toLowerCase() === walletAddress.toLowerCase();
      
      if (isOwner) {
        console.log('User is contract owner, setting up protocols...');
        await setupProtocols();
      }
    } catch (error) {
      console.error('Setup contract failed:', error);
    }
  };

  // Setup protocols and tokens (owner only)
  const setupProtocols = async () => {
    if (!contract) return;
    
    try {
      // Add supported tokens
      const tokens = Object.values(TOKEN_ADDRESSES).filter(addr => addr !== '0x0000000000000000000000000000000000000000');
      
      for (const tokenAddress of tokens) {
        const isSupported = await contract.supportedTokens(tokenAddress);
        if (!isSupported) {
          console.log('Adding token to supported list:', tokenAddress);
          const tx = await contract.addSupportedToken(tokenAddress, { gasLimit: 200000 });
          await tx.wait();
        }
      }

      // Setup protocols
      const protocols = [
        {
          name: 'aave',
          contractAddress: '0x0000000000000000000000000000000000000001',
          minDeposit: ethers.utils.parseUnits('1', 6), // 1 USDC
          performanceFee: 200,
          active: true
        },
        {
          name: 'compound', 
          contractAddress: '0x0000000000000000000000000000000000000002',
          minDeposit: ethers.utils.parseUnits('1', 18), // 1 DAI
          performanceFee: 250,
          active: true
        }
      ];

      for (const protocol of protocols) {
        console.log(`Setting up protocol: ${protocol.name}`);
        const tx = await contract.updateProtocol(
          protocol.name,
          protocol.contractAddress,
          protocol.minDeposit,
          protocol.performanceFee,
          protocol.active,
          { gasLimit: 300000 }
        );
        await tx.wait();
      }

      // Setup yield rates - FIXED: renamed 'yield' to 'yieldItem'
      const yieldSetup = [
        { name: 'aave', apy: 850, tvl: ethers.utils.parseEther('1000000') },
        { name: 'compound', apy: 720, tvl: ethers.utils.parseEther('800000') }
      ];

      for (const yieldItem of yieldSetup) {  // ✅ FIXED: renamed from 'yield' to 'yieldItem'
        console.log(`Setting yield rate for: ${yieldItem.name}`);
        const tx = await contract.updateYieldRate(yieldItem.name, yieldItem.apy, yieldItem.tvl, { gasLimit: 200000 });
        await tx.wait();
      }

      toast.success('Contract setup completed!');
    } catch (error) {
      console.error('Protocol setup failed:', error);
      toast.error('Failed to setup protocols. You may not be the owner.');
    }
  };

  // Check if contract is deployed
  const checkContractDeployment = async (providerInstance) => {
    try {
      const contractCode = await providerInstance.getCode(CONTRACT_ADDRESS);
      const deployed = contractCode !== '0x';
      
      console.log('Contract check:', {
        address: CONTRACT_ADDRESS,
        hasCode: deployed,
        codeLength: contractCode.length
      });
      
      setContractDeployed(deployed);
      
      if (!deployed) {
        toast.error('Contract not deployed at this address!');
      }
      
      return deployed;
    } catch (error) {
      console.error('Contract check failed:', error);
      setContractDeployed(false);
      return false;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      
      console.log('Wallet connected:', {
        address,
        chainId: network.chainId,
        balance: ethers.utils.formatEther(balance)
      });
      
      // Check if contract is deployed
      const isDeployed = await checkContractDeployment(provider);
      
      let contractInstance = null;
      if (isDeployed) {
        contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        console.log('Contract initialized:', CONTRACT_ADDRESS);
      } else {
        console.log('Contract not available, using mock data');
      }
      
      setProvider(provider);
      setSigner(signer);
      setContract(contractInstance);
      setWalletAddress(address);
      setBalance(parseFloat(ethers.utils.formatEther(balance)));
      setChainId(network.chainId);
      setIsConnected(true);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      // Handle wallet connection rejection
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Wallet connection cancelled by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserStrategies = async () => {
    if (!contract || !walletAddress || !contractDeployed) {
      console.log('Skipping contract call - using mock data');
      return;
    }
    
    try {
      console.log('Loading strategies from contract...');
      const strategyIds = await contract.getUserStrategies(walletAddress);
      console.log('Strategy IDs from contract:', strategyIds);
      
      const strategiesData = [];
      
      for (let id of strategyIds) {
        try {
          const strategy = await contract.getStrategy(id);
          const tokenSymbol = Object.keys(TOKEN_ADDRESSES).find(key => 
            TOKEN_ADDRESSES[key].toLowerCase() === strategy.token.toLowerCase()
          ) || 'Unknown';
          
          const decimals = TOKEN_DECIMALS[tokenSymbol] || 18;
          
          strategiesData.push({
            id: strategy.id.toString(),
            protocol: strategy.protocol,
            token: tokenSymbol,
            amount: parseFloat(ethers.utils.formatUnits(strategy.amount, decimals)),
            apy: yieldRates[`${strategy.protocol}-${tokenSymbol}`] || 8.5,
            chain: strategy.targetChain,
            rewards: parseFloat(ethers.utils.formatUnits(strategy.totalRewards, decimals)),
            status: strategy.active ? 'Active' : 'Inactive'
          });
        } catch (strategyError) {
          console.error(`Error loading strategy ${id}:`, strategyError);
        }
      }
      
      setStrategies(strategiesData);
    } catch (error) {
      console.error('Failed to load strategies:', error);
      toast.error('Failed to load strategies from contract');
    }
  };

  const deployStrategy = async () => {
    if (!contract || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!deployForm.amount || parseFloat(deployForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Validate minimum deposit
    const minDeposit = MINIMUM_DEPOSITS[deployForm.token];
    const inputAmount = parseFloat(deployForm.amount);
    
    if (inputAmount < minDeposit) {
      toast.error(`Minimum deposit is ${minDeposit} ${deployForm.token}`);
      return;
    }

    try {
      setLoading(true);
      
      const tokenAddress = TOKEN_ADDRESSES[deployForm.token];
      const decimals = TOKEN_DECIMALS[deployForm.token];
      const amount = ethers.utils.parseUnits(deployForm.amount, decimals);
      
      console.log('Deploy strategy params:', {
        token: deployForm.token,
        tokenAddress,
        amount: deployForm.amount,
        amountWei: amount.toString(),
        protocol: deployForm.protocol,
        chain: deployForm.targetChain
      });

      // Step 1: Ensure token is supported
      toast.loading('Checking token support...');
      const isSupported = await contract.supportedTokens(tokenAddress);
      
      if (!isSupported) {
        toast.loading('Adding token to supported list...');
        try {
          const addTokenTx = await contract.addSupportedToken(tokenAddress, { gasLimit: 200000 });
          await addTokenTx.wait();
          toast.success('Token added to supported list!');
        } catch (error) {
          if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            toast.dismiss();
            toast.error('Transaction cancelled by user');
            return;
          }
          toast.error('Failed to add token. You may not be the owner.');
          return;
        }
      }

      toast.dismiss();
      
      // Step 2: Handle token approval for non-ETH tokens
      if (deployForm.token !== 'ETH') {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function allowance(address owner, address spender) external view returns (uint256)",
            "function balanceOf(address owner) external view returns (uint256)"
          ],
          signer
        );
        
        // Check user balance
        toast.loading('Checking token balance...');
        const userBalance = await tokenContract.balanceOf(walletAddress);
        if (userBalance.lt(amount)) {
          toast.dismiss();
          toast.error(`Insufficient ${deployForm.token} balance. You need ${deployForm.amount} ${deployForm.token}`);
          return;
        }
        
        // Check and set approval
        toast.loading('Checking token allowance...');
        const currentAllowance = await tokenContract.allowance(walletAddress, CONTRACT_ADDRESS);
        
        if (currentAllowance.lt(amount)) {
          toast.loading('Approving token spending...');
          try {
            const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, ethers.constants.MaxUint256, {
              gasLimit: 100000
            });
            await approveTx.wait();
            toast.success('Token approved!');
          } catch (error) {
            toast.dismiss();
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
              toast.error('Token approval cancelled by user');
              return;
            }
            throw error;
          }
        }
        
        toast.dismiss();
      }
      
      // Step 3: Deploy strategy with robust error handling
      toast.loading('Deploying strategy to blockchain...');
      
      const txOptions = {
        gasLimit: 1000000, // Higher gas limit for complex transactions
        value: deployForm.token === 'ETH' ? amount : 0,
      };
      
      const tx = await contract.deployStrategy(
        tokenAddress,
        amount,
        deployForm.protocol.toLowerCase(),
        deployForm.targetChain.toLowerCase(),
        txOptions
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      toast.dismiss();
      
      if (receipt.status === 1) {
        // Get strategy ID from event
        const event = receipt.events?.find(e => e.event === 'StrategyDeployed');
        const strategyId = event?.args?.strategyId;
        
        toast.success(`🎉 Strategy deployed successfully! ID: ${strategyId || 'N/A'}`);
        
        // Reset form
        setDeployForm({
          token: 'USDC',
          amount: '',
          protocol: 'Aave',
          targetChain: 'Ethereum'
        });
        
        // Refresh strategies
        setTimeout(() => loadUserStrategies(), 2000);
      } else {
        toast.error('Transaction failed on blockchain');
      }
      
    } catch (error) {
      console.error('Deploy strategy failed:', error);
      toast.dismiss();
      
      // ✅ UPDATED: Enhanced error handling for user rejection
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        // User rejected transaction - this is normal behavior
        toast.error('💭 Transaction cancelled by user');
        console.log('User cancelled transaction - this is normal behavior');
      } else if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
        toast.error('💭 Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('💰 Insufficient ETH for gas fees');
      } else if (error.message?.includes('Amount below minimum')) {
        toast.error(`📊 Amount below minimum requirement. Please deposit at least ${MINIMUM_DEPOSITS[deployForm.token]} ${deployForm.token}`);
      } else if (error.message?.includes('Token not supported')) {
        toast.error('🪙 Token not supported. Please setup contract first.');
      } else {
        // Other errors
        toast.error(`❌ Deploy failed: ${error.reason || error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const harvestRewards = async (strategyId) => {
    if (!contract) {
      toast.error('Contract not connected');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Harvesting rewards...');
      
      const tx = await contract.harvestRewards(strategyId, {
        gasLimit: 300000
      });
      await tx.wait();
      
      toast.dismiss();
      toast.success('🌾 Rewards harvested successfully!');
      
      // Refresh strategies
      await loadUserStrategies();
      
    } catch (error) {
      console.error('Harvest failed:', error);
      toast.dismiss();
      
      // ✅ UPDATED: Enhanced error handling for user rejection
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('💭 Transaction cancelled by user');
      } else if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
        toast.error('💭 Transaction cancelled by user');
      } else {
        toast.error(`❌ Harvest failed: ${error.reason || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load strategies and setup contract when wallet connects
  useEffect(() => {
    if (isConnected && contract) {
      loadUserStrategies();
      setupContract();
    }
  }, [isConnected, contract]);

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
      });
      
      // Reconnect after network switch
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      
    } catch (error) {
      console.error('Failed to switch network:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Network switch cancelled by user');
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Contract Status Alert */}
      {isConnected && (
        <div className={`border rounded-lg p-4 ${
          contractDeployed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {contractDeployed ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <p className={`${
              contractDeployed ? 'text-green-800' : 'text-red-800'
            }`}>
              {contractDeployed 
                ? `✅ Smart contract connected: ${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-8)}` 
                : '❌ Smart contract not found or not deployed'
              }
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Wallet Balance</p>
              <p className="text-2xl font-bold">{balance.toFixed(4)} ETH</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Rewards</p>
              <p className="text-2xl font-bold">
                ${strategies.reduce((sum, s) => sum + (s.rewards || 0), 0).toFixed(4)}
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

      {/* Network Status */}
      {isConnected && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Connected to Chain ID: {chainId}</span>
              <span className="text-sm text-gray-500">
                ({chainId === 11155111 ? 'Sepolia Testnet' : 'Unknown Network'})
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => switchNetwork(11155111)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  chainId === 11155111 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Sepolia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Strategies */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Active Strategies
          </h2>
        </div>
        <div className="p-0">
          {strategies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No strategies deployed yet</p>
              <p className="text-sm">Deploy your first strategy in the Strategies tab to start earning yield.</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <div key={strategy.id} className="p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {strategy.token?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{strategy.protocol} - {strategy.token}</h3>
                      <p className="text-gray-600 text-sm">
                        {strategy.amount} {strategy.token} on {strategy.chain}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{strategy.apy}% APY</p>
                    <p className="text-gray-600 text-sm">
                      +${(strategy.rewards || 0).toFixed(4)} rewards
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => harvestRewards(strategy.id)}
                      disabled={loading || (strategy.rewards || 0) === 0}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(strategy.rewards || 0) > 0 ? '🌾 Harvest' : 'No Rewards'}
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Best Opportunities */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Best Yield Opportunities
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(yieldRates).map(([key, rate]) => {
              const [protocol, token] = key.split('-');
              return (
                <div key={key} className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer transform hover:scale-102">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{protocol}</h4>
                      <p className="text-gray-600 text-sm">{token} Pool</p>
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
        <h2 className="text-xl font-semibold mb-4">Deploy New Strategy</h2>
        
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">Please connect your wallet to deploy strategies.</p>
            </div>
          </div>
        )}

        {isConnected && chainId !== 11155111 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">Please switch to Sepolia Testnet to deploy strategies.</p>
            </div>
          </div>
        )}

        {isConnected && !contractDeployed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">Smart contract not found. Please check the contract address and network.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
            <select 
              value={deployForm.token}
              onChange={(e) => setDeployForm({...deployForm, token: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="USDC">USDC (6 decimals)</option>
              <option value="DAI">DAI (18 decimals)</option>
              <option value="USDT">USDT (6 decimals)</option>
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
              step="0.1"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Chain</label>
            <select 
              value={deployForm.targetChain}
              onChange={(e) => setDeployForm({...deployForm, targetChain: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
              <option value="BNB Chain">BNB Chain</option>
            </select>
          </div>
        </div>

        {/* Minimum Deposit Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-800">Deployment Requirements</h4>
          </div>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• Minimum deposit: {MINIMUM_DEPOSITS[deployForm.token]} {deployForm.token}</p>
            <p>• Network: Sepolia Testnet required</p>
            <p>• Contract: Must be deployed and accessible</p>
            {deployForm.amount && parseFloat(deployForm.amount) < MINIMUM_DEPOSITS[deployForm.token] && (
              <p className="text-red-600 font-medium">⚠️ Amount below minimum - please increase</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Protocol</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {['Aave', 'Compound', 'Raydium', 'PancakeSwap'].map((protocol) => (
              <div 
                key={protocol} 
                onClick={() => !loading && setDeployForm({...deployForm, protocol})}
                className={`p-4 border rounded-lg cursor-pointer transition-colors transform hover:scale-105 ${
                  deployForm.protocol === protocol 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-blue-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <h4 className="font-semibold">{protocol}</h4>
                <p className="text-green-600 text-sm">
                  {yieldRates[`${protocol}-USDC`] || '8.5'}% APY
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !isConnected || 
            loading || 
            !deployForm.amount || 
            parseFloat(deployForm.amount) < MINIMUM_DEPOSITS[deployForm.token] ||
            chainId !== 11155111 ||
            !contractDeployed
          }
          onClick={deployStrategy}
        >
          {loading ? '⏳ Deploying...' : '🚀 Deploy Strategy'}
        </button>

        {/* ✅ UPDATED: Enhanced Help Text with Transaction Tips */}
        {isConnected && contractDeployed && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">💡 How Strategy Deployment Works:</h4>
              <ol className="text-gray-600 text-sm space-y-1 list-decimal list-inside">
                <li>Your tokens are approved for the smart contract</li>
                <li>Tokens are deposited into the selected DeFi protocol</li>
                <li>Strategy begins earning yield automatically</li>
                <li>You can harvest rewards anytime from the Dashboard</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📱 MetaMask Transaction Tips:</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                <li>Make sure you have enough ETH for gas fees (~$2-5)</li>
                <li>Review transaction details before clicking "Confirm"</li>
                <li>✅ You can safely cancel by clicking "Reject" in MetaMask</li>
                <li>Transaction confirmation takes 1-2 minutes</li>
                <li>If cancelled, no funds are lost - try again anytime</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Info className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-800">💰 Get Test Tokens:</h4>
              </div>
              <p className="text-green-700 text-sm">
                Need test tokens? Get free USDC, DAI, and USDT from our deployed mock contracts on Sepolia. 
                Visit the contract on Etherscan and call the "faucet" function.
              </p>
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
          Cross-Chain Bridge
        </h2>
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 text-sm">Bridge functionality is coming soon. Currently in development.</p>
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
                <option>Polygon</option>
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
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed"
            disabled
          >
            🌉 Bridge Assets (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>YieldRouter - Cross-Chain DeFi Aggregator</title>
        <meta name="description" content="Simplify your DeFi experience with cross-chain yield farming" />
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
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
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
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    YieldRouter
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
                <Settings className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium text-sm">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                    <button
                      onClick={() => window.open(`https://sepolia.etherscan.io/address/${walletAddress}`, '_blank')}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8">Connect your wallet to access YieldRouter&apos;s DeFi features</p>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 mb-8 bg-white p-1 rounded-xl shadow-sm border">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'strategies', label: 'Strategies', icon: TrendingUp },
                  { id: 'bridge', label: 'Bridge', icon: ArrowRightLeft },
                  { id: 'portfolio', label: 'Portfolio', icon: Coins }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
                    Portfolio Analytics
                  </h2>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Portfolio analytics and detailed performance metrics coming soon.</p>
                    <p className="text-gray-500 text-sm mt-2">Track your DeFi performance across all strategies</p>
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
