import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';

const PROGRAM_ID = new PublicKey('6Jj2xKBWPb5yLCzJw1wEBZTn3pQCvqPRkx4KA7rJTF5g');

class SimulatedProgram {
  readonly programId = PROGRAM_ID;

  constructor() {
  }

  methods = {
    initializeVault: (rewardRate) => ({
      accounts: (accounts) => ({
        rpc: async () => {
          console.log('🎭 SIMULATION: Initialize Vault');
          console.log('- Reward Rate:', rewardRate.toString());
          console.log('- Admin:', accounts.admin.toString());
          console.log('- Mint:', accounts.mint.toString());
          console.log('- Vault PDA:', accounts.vault.toString());
          console.log('- Treasury:', accounts.treasury.toString());
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const mockTx = 'SIM_INIT_' + Math.random().toString(36).substr(2, 12);
          console.log('✅ SIMULATION: Vault initialized, tx:', mockTx);
          
          return mockTx;
        }
      })
    }),

    deposit: (amount) => ({
      accounts: (accounts) => ({
        rpc: async () => {
          console.log('🎭 SIMULATION: Deposit to Vault');
          console.log('- Amount:', amount.toString(), 'lamports');
          console.log('- Depositor:', accounts.depositor.toString());
          console.log('- Vault:', accounts.vault.toString());
          console.log('- User Position:', accounts.userPosition.toString());
          
          if (amount.toNumber() < 10000000) {
            throw new Error('SIMULATION: Amount too small (min 0.01 SOL)');
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const mockTx = 'SIM_DEPOSIT_' + Math.random().toString(36).substr(2, 12);
          console.log('✅ SIMULATION: Deposit successful, tx:', mockTx);
          
          return mockTx;
        }
      })
    }),

    withdraw: (amount) => ({
      accounts: (accounts) => ({
        rpc: async () => {
          console.log('🎭 SIMULATION: Withdraw from Vault');
          console.log('- Amount:', amount.toString(), 'lamports');
          console.log('- Depositor:', accounts.depositor.toString());
          console.log('- Vault:', accounts.vault.toString());
          console.log('- User Position:', accounts.userPosition.toString());
          
          await new Promise(resolve => setTimeout(resolve, 1800));
          
          const mockTx = 'SIM_WITHDRAW_' + Math.random().toString(36).substr(2, 12);
          console.log('✅ SIMULATION: Withdrawal successful, tx:', mockTx);
          
          return mockTx;
        }
      })
    }),

    harvest: () => ({
      accounts: (accounts) => ({
        rpc: async () => {
          console.log('🎭 SIMULATION: Harvest Rewards');
          console.log('- User:', accounts.user?.toString() || accounts.depositor?.toString() || 'Unknown');
          console.log('- Vault:', accounts.vault.toString());
          console.log('- User Position:', accounts.userPosition?.toString() || 'Unknown');
          
          const mockRewards = Math.random() * 1000000000;
          console.log('- Simulated Rewards:', mockRewards, 'lamports');
          
          await new Promise(resolve => setTimeout(resolve, 1600));
          
          const mockTx = 'SIM_HARVEST_' + Math.random().toString(36).substr(2, 12);
          console.log('✅ SIMULATION: Harvest successful, tx:', mockTx);
          
          return mockTx;
        }
      })
    }),

    setRewardRate: (newRate) => ({
      accounts: (accounts) => ({
        rpc: async () => {
          console.log('🎭 SIMULATION: Set Reward Rate');
          console.log('- New Rate:', newRate.toString());
          console.log('- Admin:', accounts.admin.toString());
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockTx = 'SIM_SET_RATE_' + Math.random().toString(36).substr(2, 12);
          console.log('✅ SIMULATION: Rate updated, tx:', mockTx);
          
          return mockTx;
        }
      })
    })
  };
}

// Hook utama dengan full simulation support
export function useYieldVaultProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    console.log('🎭 SIMULATION MODE: useYieldVaultProgram initialized');
    
    if (!connection || !wallet) {
      return {
        program: null,
        provider: null,
        programId: PROGRAM_ID,
        connection: connection,
        simulation: true,
        status: 'not_ready'
      };
    }

    const mockProvider = {
      connection: connection,
      wallet: wallet,
      publicKey: wallet.publicKey,
      opts: { commitment: 'confirmed' }
    };

    console.log('✅ SIMULATION: Program ready with mock provider');
    
    return {
      program: new SimulatedProgram(),
      provider: mockProvider,
      programId: PROGRAM_ID,
      connection: connection,
      wallet: wallet,
      simulation: true,
      status: 'ready'
    };
  }, [connection, wallet]);
}

export function getVaultPDA(mint) {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), mint.toBuffer()],
    PROGRAM_ID
  );
  
  console.log('🎭 SIMULATION: Generated Vault PDA:', pda.toString(), 'bump:', bump);
  return [pda, bump];
}

export function getUserPositionPDA(vault, user) {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), vault.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
  
  console.log('🎭 SIMULATION: Generated User Position PDA:', pda.toString(), 'bump:', bump);
  return [pda, bump];
}

export function simulateAccountExists(publicKey) {
  const exists = Math.random() > 0.3;
  console.log('🎭 SIMULATION: Account', publicKey.toString(), exists ? 'exists' : 'does not exist');
  return exists;
}

export function simulateAccountBalance(publicKey) {
  const balance = Math.random() * 10000000000;
  console.log('🎭 SIMULATION: Account balance for', publicKey.toString().slice(0, 8) + '...', balance / 1e9, 'SOL');
  return balance;
}

export function getSimulationStatus() {
  return {
    mode: 'simulation',
    programId: PROGRAM_ID.toString(),
    network: 'mock_devnet',
    features: ['vault_operations', 'pda_generation', 'mock_transactions'],
    timestamp: new Date().toISOString()
  };
}

export const initializeVaultTransaction = async (params) => {
  console.log('🎭 SIMULATION: initializeVaultTransaction called with:', params);
  return { simulation: true, status: 'ready' };
};

export const depositToVaultTransaction = async (params) => {
  console.log('🎭 SIMULATION: depositToVaultTransaction called with:', params);
  return { simulation: true, status: 'ready' };
};

export const withdrawFromVaultTransaction = async (params) => {
  console.log('🎭 SIMULATION: withdrawFromVaultTransaction called with:', params);
  return { simulation: true, status: 'ready' };
};

export const harvestRewardsTransaction = async (params) => {
  console.log('🎭 SIMULATION: harvestRewardsTransaction called with:', params);
  return { simulation: true, status: 'ready' };
};
