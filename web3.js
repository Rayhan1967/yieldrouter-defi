import { ethers } from 'ethers';

// Connect to MetaMask
const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    // Load contract
    const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
    const contract = new ethers.Contract(contractAddress, YieldRouterABI, signer);
    
    return { provider, signer, contract };
  }
};

// Deploy strategy example
const deployStrategy = async (contract, tokenAddress, amount, protocol, chain) => {
  try {
    const tx = await contract.deployStrategy(
      tokenAddress,
      ethers.utils.parseEther(amount),
      protocol,
      chain
    );
    await tx.wait();
    console.log("Strategy deployed:", tx.hash);
  } catch (error) {
    console.error("Deployment failed:", error);
  }
};