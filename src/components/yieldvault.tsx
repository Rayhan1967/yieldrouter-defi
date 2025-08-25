import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('6Jj2xKBWPb5yLCzJw1wEBZTn3pQCvqPRkx4KA7rJTF5g');

// Minimal IDL untuk program initialization
const idl = {
  "version": "0.1.0",
  "name": "yv_clean",
  "address": "6Jj2xKBWPb5yLCzJw1wEBZTn3pQCvqPRkx4KA7rJTF5g",
  "instructions": [
    {
      "name": "initializeVault",
      "accounts": [
        { "name": "admin", "isMut": true, "isSigner": true },
        { "name": "mint", "isMut": false, "isSigner": false },
        { "name": "vault", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [{ "name": "rewardRate", "type": "u64" }]
    },
    {
      "name": "deposit",
      "accounts": [
        { "name": "depositor", "isMut": true, "isSigner": true },
        { "name": "mint", "isMut": false, "isSigner": false },
        { "name": "vault", "isMut": true, "isSigner": false },
        { "name": "userPosition", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [{ "name": "amount", "type": "u64" }]
    }
  ],
  "accounts": [],
  "types": [],
  "events": [],
  "errors": []
};

export const useYieldVaultProgram = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  if (!wallet || !connection) {
    console.log('Wallet or connection not available');
    return null;
  }

  try {
    const provider = new AnchorProvider(connection, wallet, { 
      commitment: 'confirmed' 
    });

    // FIX: CORRECT CONSTRUCTOR ORDER - idl first, then provider
    // Option 1: new Program(idl, provider) - program ID from IDL
    const program = new Program(idl, provider);
    
    console.log('Program created successfully with IDL address');
    console.log('Program ID from IDL:', program.programId.toString());
    console.log('Expected Program ID:', PROGRAM_ID.toString());

    return { 
      program,
      provider, 
      connection, 
      wallet, 
      programId: program.programId 
    };
  } catch (error) {
    console.error('Error creating program:', error);
    
    // If IDL approach fails, try provider-only fallback
    try {
      const provider = new AnchorProvider(connection, wallet, { 
        commitment: 'confirmed' 
      });
      
      console.log('Fallback to provider-only mode');
      return { 
        provider, 
        connection, 
        wallet, 
        programId: PROGRAM_ID 
      };
    } catch (providerError) {
      console.error('Provider creation also failed:', providerError);
      return null;
    }
  }
};

// PDA helper functions
export const getVaultPDA = (mint) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), mint.toBuffer()],
    PROGRAM_ID
  );
};

export const getUserPositionPDA = (vault, user) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), vault.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
};

export { PROGRAM_ID };
