import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, sendAndConfirmRawTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, AccountLayout, getMintLen, ExtensionType, TYPE_SIZE, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, createInitializeMetadataPointerInstruction, createInitializeMintInstruction } from "@solana/spl-token";
import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';

const connection = new Connection(clusterApiUrl("devnet"))

// This function will airdrop the arg amount to toAddress PublicKey
const airdropSol = async (toAddress: PublicKey, amount: number) => {
    const airdropSig = await connection.requestAirdrop(toAddress, amount)
    // @ts-ignore
    await connection.confirmTransaction({ signature: airdropSig })
    console.log("Airdrop logs:", airdropSig)
}

// This function will check the balance of the specified address in the specified network
const checkWalletBal = async (address: PublicKey, network: "devnet" | "mainnet-beta" | "testnet") => {
    const newConnection = new Connection(clusterApiUrl(network))
    const balance = await connection.getBalance(address)
    console.log(`The address ${address.toString().slice(0, 4) + "..." + address.toString().slice(38, -1)} contains ` + (balance / LAMPORTS_PER_SOL).toString() + " SOL")
}

const createYourToken = async (payer: Keypair, mintAuthority: PublicKey, decimal: number) => {
    const mint = await createMint(connection, payer, mintAuthority, null, decimal)
    console.log('created token at: ', mint.toBase58())
    return mint
}
const payer = Keypair.generate();
const mintAuthority = Keypair.generate()

const createAssociatedTokenAccount = async (mint: PublicKey, to: String, amount: number) => {
    const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, new PublicKey(to),)

    await mintTo(connection, payer, mint, ata.address, mintAuthority, amount)
}

// The following is a function that takes in a account address and returns all the token owned by that address
const getTokensFromAddress = async (address: PublicKey) => {
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


// The following is an implementation of Token Extention to create an Mint account with metadata:
const createTokenWithMetadata = async () => {
    const payer = Keypair.generate();
    const mint  = Keypair.generate();
    const decimal = 9;

    const metadata: TokenMetadata = {
        mint: mint.publicKey,
        name: "ZEREF",
        symbol: "ZRF",
        uri: "https://i.pinimg.com/474x/4d/3d/0c/4d3d0c0c03ffca26eab4b7181e5a6c3e.jpg",
        additionalMetadata: [["Winning is everything", "You can't win again me"]]
    }

    const metadataAccount = Keypair.generate()

    const mintLen = getMintLen([ExtensionType.MetadataPointer])
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const connection = new Connection(clusterApiUrl('devnet'), "confirmed")

    const airdropSign = await connection.requestAirdrop(payer.publicKey, 4* LAMPORTS_PER_SOL)

    await connection.confirmTransaction({
        signature: airdropSign,
        ...(await connection.getLatestBlockhash())
    })


    const mintLamports = await connection.getMinimumBalanceForRentExemption(metadataLen + mintLen)

    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint.publicKey,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
            space: mintLen
        }),
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: metadataAccount.publicKey,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
            space: metadataLen
        }),
        createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, metadataAccount.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint.publicKey, decimal, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            mint: mint.publicKey,
            metadata: mint.publicKey,
            name: metadata.name,
            uri: metadata.uri,
            mintAuthority: payer.publicKey,
            updateAuthority: payer.publicKey,
            symbol: metadata.symbol
        })
    )
    console.log("Successed!")
    await sendAndConfirmRawTransaction(connection, Buffer.from(mintTransaction) )
}




