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
const payer = web3_js_1.Keypair.fromSecretKey(Uint8Array.from([102, 144, 169, 42, 220, 87, 99, 85, 100, 128, 197, 17, 41, 234, 250, 84, 87, 98, 161, 74, 15, 249, 83, 6, 120, 159, 135, 22, 46, 164, 204, 141, 234, 217, 146, 214, 61, 187, 254, 97, 124, 111, 61, 29, 54, 110, 245, 186, 11, 253, 11, 127, 213, 20, 73, 8, 25, 201, 22, 107, 4, 75, 26, 120]));
createYourToken(payer, payer.publicKey, 9);
