import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"))

// This function will airdrop the arg amount to toAddress PublicKey
const airdropSol = async (toAddress: PublicKey, amount: number) => {
    const airdropSig = await connection.requestAirdrop(toAddress, amount)
    // @ts-ignore
    await connection.confirmTransaction({signature: airdropSig})
    console.log("Airdrop logs:", airdropSig)
}

// This function will check the balance of the specified address in the specified network
const checkWalletBal = async (address: PublicKey, network: "devnet" | "mainnet-beta" | "testnet") => {
    const newConnection = new Connection(clusterApiUrl(network))
    const balance = await connection.getBalance(address)
    console.log( `The address ${address.toString().slice(0,4) + "..." + address.toString().slice(38, -1)} contains ` +  (balance/LAMPORTS_PER_SOL).toString() + " SOL")
}

const createYourToken = async (payer: Keypair, mintAuthority: PublicKey, decimal: number ) => {
    const mint = await createMint(connection, payer, mintAuthority, null,decimal )
    console.log('created token at: ', mint.toBase58())
    return mint
} 

const payer = Keypair.fromSecretKey(Uint8Array.from([102,144,169,42,220,87,99,85,100,128,197,17,41,234,250,84,87,98,161,74,15,249,83,6,120,159,135,22,46,164,204,141,234,217,146,214,61,187,254,97,124,111,61,29,54,110,245,186,11,253,11,127,213,20,73,8,25,201,22,107,4,75,26,120]));

createYourToken(payer, payer.publicKey, 9)