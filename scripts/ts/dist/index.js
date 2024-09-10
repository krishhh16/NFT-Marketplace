"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const spl_token_metadata_1 = require("@solana/spl-token-metadata");
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
// This function will airdrop the arg amount to toAddress PublicKey
const airdropSol = (toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const airdropSig = yield connection.requestAirdrop(toAddress, amount);
    // @ts-ignore
    yield connection.confirmTransaction({ signature: airdropSig });
    console.log("Airdrop logs:", airdropSig);
});
// This function will check the balance of the specified address in the specified network
const checkWalletBal = (address, network) => __awaiter(void 0, void 0, void 0, function* () {
    const newConnection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)(network));
    const balance = yield connection.getBalance(address);
    console.log(`The address ${address.toString().slice(0, 4) + "..." + address.toString().slice(38, -1)} contains ` + (balance / web3_js_1.LAMPORTS_PER_SOL).toString() + " SOL");
});
const createYourToken = (payer, mintAuthority, decimal) => __awaiter(void 0, void 0, void 0, function* () {
    const mint = yield (0, spl_token_1.createMint)(connection, payer, mintAuthority, null, decimal);
    console.log('created token at: ', mint.toBase58());
    return mint;
});
const payer = web3_js_1.Keypair.generate();
const mintAuthority = web3_js_1.Keypair.generate();
const createAssociatedTokenAccount = (mint, to, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const ata = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, new web3_js_1.PublicKey(to));
    yield (0, spl_token_1.mintTo)(connection, payer, mint, ata.address, mintAuthority, amount);
});
// The following is a function that takes in a account address and returns all the token owned by that address
const getTokensFromAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenAccounts = yield connection.getTokenAccountsByOwner(address, {
        programId: spl_token_1.TOKEN_PROGRAM_ID
    });
    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach(tokenAccount => {
        const accData = spl_token_1.AccountLayout.decode(tokenAccount.account.data);
        console.log(`${accData.mint}----------------------------------------${accData.amount}`);
    });
});
// The following is an implementation of Token Extention to create an Mint account with metadata:
const createTokenWithMetadata = () => __awaiter(void 0, void 0, void 0, function* () {
    const payer = web3_js_1.Keypair.generate();
    const mint = web3_js_1.Keypair.generate();
    const decimal = 9;
    const metadata = {
        mint: mint.publicKey,
        name: "ZEREF",
        symbol: "ZRF",
        uri: "https://i.pinimg.com/474x/4d/3d/0c/4d3d0c0c03ffca26eab4b7181e5a6c3e.jpg",
        additionalMetadata: [["Winning is everything", "You can't win again me"]]
    };
    const metadataAccount = web3_js_1.Keypair.generate();
    const mintLen = (0, spl_token_1.getMintLen)([spl_token_1.ExtensionType.MetadataPointer]);
    const metadataLen = spl_token_1.TYPE_SIZE + spl_token_1.LENGTH_SIZE + (0, spl_token_metadata_1.pack)(metadata).length;
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('devnet'), "confirmed");
    const airdropSign = yield connection.requestAirdrop(payer.publicKey, 4 * web3_js_1.LAMPORTS_PER_SOL);
    yield connection.confirmTransaction(Object.assign({ signature: airdropSign }, (yield connection.getLatestBlockhash())));
    const mintLamports = yield connection.getMinimumBalanceForRentExemption(metadataLen + mintLen);
    const mintTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: mintLamports,
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        space: mintLen
    }), (0, spl_token_1.createInitializeMetadataPointerInstruction)(mint.publicKey, payer.publicKey, mint.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_1.createInitializeMintInstruction)(mint.publicKey, decimal, payer.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_metadata_1.createInitializeInstruction)({
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        mint: mint.publicKey,
        metadata: mint.publicKey,
        name: metadata.name,
        uri: metadata.uri,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
        symbol: metadata.symbol
    }));
    console.log("Successed!");
    yield (0, web3_js_1.sendAndConfirmRawTransaction)(connection, Buffer.from(mintTransaction));
});
const createMintWithMetadata = () => __awaiter(void 0, void 0, void 0, function* () {
    const payer = web3_js_1.Keypair.generate();
    // Connection to devnet cluster
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
    // Transaction to send
    let transaction;
    // Transaction signature returned from sent transaction
    let transactionSignature;
    // Generate new keypair for Mint Account
    const mintKeypair = web3_js_1.Keypair.generate();
    // Address for Mint Account
    const mint = mintKeypair.publicKey;
    // Decimals for Mint Account
    const decimals = 2;
    // Authority that can mint new tokens
    const mintAuthority = web3_js_1.Keypair.generate().publicKey;
    // Authority that can update token metadata
    const updateAuthority = mintAuthority;
    // Metadata to store in Mint Account
    const metaData = {
        updateAuthority: updateAuthority,
        mint: mint,
        name: "OPOS",
        symbol: "OPOS",
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
        additionalMetadata: [["description", "Only Possible On Solana"]],
    };
    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = spl_token_1.TYPE_SIZE + spl_token_1.LENGTH_SIZE;
    // Size of metadata
    const metadataLen = (0, spl_token_metadata_1.pack)(metaData).length;
    // Size of Mint Account with extension
    const mintLen = (0, spl_token_1.getMintLen)([spl_token_1.ExtensionType.MetadataPointer]);
    // Minimum lamports required for Mint Account
    const lamports = yield connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen);
    // Instruction to invoke System Program to create new account
    const createAccountInstruction = web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
        newAccountPubkey: mint, // Address of the account to create
        space: mintLen, // Amount of bytes to allocate to the created account
        lamports, // Amount of lamports transferred to created account
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    });
    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction = (0, spl_token_1.createInitializeMetadataPointerInstruction)(mint, // Mint Account address
    updateAuthority, // Authority that can set the metadata address
    mint, // Account address that holds the metadata
    spl_token_1.TOKEN_2022_PROGRAM_ID);
    // Instruction to initialize Mint Account data
    const initializeMintInstruction = (0, spl_token_1.createInitializeMintInstruction)(mint, // Mint Account Address
    decimals, // Decimals of Mint
    mintAuthority, // Designated Mint Authority
    null, // Optional Freeze Authority
    spl_token_1.TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    );
    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = (0, spl_token_metadata_1.createInitializeInstruction)({
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        mint: mint, // Mint Account address
        mintAuthority: mintAuthority, // Designated Mint Authority
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
    });
    // Instruction to update metadata, adding custom field
    const updateFieldInstruction = (0, spl_token_metadata_1.createUpdateFieldInstruction)({
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        field: metaData.additionalMetadata[0][0], // key
        value: metaData.additionalMetadata[0][1], // value
    });
    // Add instructions to new transaction
    transaction = new web3_js_1.Transaction().add(createAccountInstruction, initializeMetadataPointerInstruction, initializeMintInstruction, initializeMetadataInstruction, updateFieldInstruction);
    let recentBlockhash = yield connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    // Send transaction
    console.log("I ran till this piont");
    transactionSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer, mintKeypair] // Signers
    );
    console.log("\nCreate Mint Account:", `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`);
    // Retrieve mint information
    const mintInfo = yield (0, spl_token_1.getMint)(connection, mint, "confirmed", spl_token_1.TOKEN_2022_PROGRAM_ID);
    // Retrieve and log the metadata pointer state
    const metadataPointer = (0, spl_token_1.getMetadataPointerState)(mintInfo);
    console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));
    // Retrieve and log the metadata state
    const metadata = yield (0, spl_token_1.getTokenMetadata)(connection, mint // Mint Account address
    );
    console.log("\nMetadata:", JSON.stringify(metadata, null, 2));
    // Instruction to remove a key from the metadata
    const removeKeyInstruction = (0, spl_token_metadata_1.createRemoveKeyInstruction)({
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Address of the metadata
        updateAuthority: updateAuthority, // Authority that can update the metadata
        key: metaData.additionalMetadata[0][0], // Key to remove from the metadata
        idempotent: true, // If the idempotent flag is set to true, then the instruction will not error if the key does not exist
    });
    // Add instruction to new transaction
    transaction = new web3_js_1.Transaction().add(removeKeyInstruction);
    // Send transaction
    transactionSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
    console.log("\nRemove Additional Metadata Field:", `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`);
    // Retrieve and log the metadata state
    const updatedMetadata = yield (0, spl_token_1.getTokenMetadata)(connection, mint // Mint Account address
    );
    console.log("\nUpdated Metadata:", JSON.stringify(updatedMetadata, null, 2));
    console.log("\nMint Account:", `https://solana.fm/address/${mint}?cluster=devnet-solana`);
});
createMintWithMetadata();
