import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, AccountLayout } from "@solana/spl-token";

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
const payer = Keypair.generate();
const mintAuthority = Keypair.generate()

const createAssociatedTokenAccount = async (mint: PublicKey, to: String, amount: number) => {
    const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, new PublicKey(to), )

    await mintTo(connection, payer, mint, ata.address,  mintAuthority, amount)
} 

// The following is a function that takes in a account address and returns all the token owned by that address
const getTokensFromAddress = async (address:PublicKey) => {
    const tokenAccounts = await connection.getTokenAccountsByOwner(address, {
        programId: TOKEN_PROGRAM_ID
    })

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach(tokenAccount => {
        const accData = AccountLayout.decode(tokenAccount.account.data)
        console.log(`${accData.mint}----------------------------------------${accData.amount}`)

    })
}

