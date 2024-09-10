import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, sendAndConfirmRawTransaction, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, AccountLayout, getMintLen, ExtensionType, TYPE_SIZE, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, getTokenMetadata, getMetadataPointerState, getMint } from "@solana/spl-token";
import { createInitializeInstruction, createRemoveKeyInstruction, createUpdateFieldInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';

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
    const mint = Keypair.generate();
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

    const airdropSign = await connection.requestAirdrop(payer.publicKey, 4 * LAMPORTS_PER_SOL)

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
        createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
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
    await sendAndConfirmRawTransaction(connection, Buffer.from(mintTransaction))
}

const createMintWithMetadata = async () => {
    const payer = Keypair.generate();

    // Connection to devnet cluster
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Transaction to send
    let transaction: Transaction;
    // Transaction signature returned from sent transaction
    let transactionSignature: string;

    // Generate new keypair for Mint Account
    const mintKeypair = Keypair.generate();
    // Address for Mint Account
    const mint = mintKeypair.publicKey;
    // Decimals for Mint Account
    const decimals = 2;
    // Authority that can mint new tokens
    const mintAuthority = Keypair.generate().publicKey;
    // Authority that can update token metadata
    const updateAuthority = mintAuthority;

    // Metadata to store in Mint Account
    const metaData: TokenMetadata = {
        updateAuthority: updateAuthority,
        mint: mint,
        name: "OPOS",
        symbol: "OPOS",
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
        additionalMetadata: [["description", "Only Possible On Solana"]],
    };

    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    // Size of metadata
    const metadataLen = pack(metaData).length;

    // Size of Mint Account with extension
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtension + metadataLen
    );

    // Instruction to invoke System Program to create new account
    const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
        newAccountPubkey: mint, // Address of the account to create
        space: mintLen, // Amount of bytes to allocate to the created account
        lamports, // Amount of lamports transferred to created account
        programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    });

    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction =
        createInitializeMetadataPointerInstruction(
            mint, // Mint Account address
            updateAuthority, // Authority that can set the metadata address
            mint, // Account address that holds the metadata
            TOKEN_2022_PROGRAM_ID
        );

    // Instruction to initialize Mint Account data
    const initializeMintInstruction = createInitializeMintInstruction(
        mint, // Mint Account Address
        decimals, // Decimals of Mint
        mintAuthority, // Designated Mint Authority
        null, // Optional Freeze Authority
        TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    );

    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        mint: mint, // Mint Account address
        mintAuthority: mintAuthority, // Designated Mint Authority
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
    });

    // Instruction to update metadata, adding custom field
    const updateFieldInstruction = createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        field: metaData.additionalMetadata[0][0], // key
        value: metaData.additionalMetadata[0][1], // value
    });
    // Add instructions to new transaction
    transaction = new Transaction().add(
        createAccountInstruction,
        initializeMetadataPointerInstruction,
        initializeMintInstruction,
        initializeMetadataInstruction,
        updateFieldInstruction
    );
    let recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    
    console.log("I ran till this piont")
    // Send transaction
    transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, mintKeypair] // Signers
    );


    console.log(
        "\nCreate Mint Account:",
        `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );

    // Retrieve mint information
    const mintInfo = await getMint(
        connection,
        mint,
        "confirmed",
        TOKEN_2022_PROGRAM_ID
    );

    // Retrieve and log the metadata pointer state
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));

    // Retrieve and log the metadata state
    const metadata = await getTokenMetadata(
        connection,
        mint // Mint Account address
    );
    console.log("\nMetadata:", JSON.stringify(metadata, null, 2));

    // Instruction to remove a key from the metadata
    const removeKeyInstruction = createRemoveKeyInstruction({
        programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Address of the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        key: metaData.additionalMetadata[0][0], // Key to remove from the metadata
        idempotent: true, // If the idempotent flag is set to true, then the instruction will not error if the key does not exist
    });

    // Add instruction to new transaction
    transaction = new Transaction().add(removeKeyInstruction);

    // Send transaction
    transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    );

    console.log(
        "\nRemove Additional Metadata Field:",
        `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );

    // Retrieve and log the metadata state
    const updatedMetadata = await getTokenMetadata(
        connection,
        mint // Mint Account address
    );
    console.log("\nUpdated Metadata:", JSON.stringify(updatedMetadata, null, 2));

    console.log(
        "\nMint Account:",
        `https://solana.fm/address/${mint}?cluster=devnet-solana`
    );

}


createMintWithMetadata();