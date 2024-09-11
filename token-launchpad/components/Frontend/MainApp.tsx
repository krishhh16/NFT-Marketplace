'use client'
import React, { useState } from 'react'
import * as z from "zod"
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { toast, Toaster } from "sonner"
import { clusterApiUrl, Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

const formData = z.object({
    uri: z.string().url({ message: "Please input a valid url" }),
    name: z.string().min(3, {message: "Name must be more than 3 characters long"}),
    symbol: z.string().max(3),
    decimal: z.number().min(0).max(9)
})

function MainApp() {
    const [form, setFormData] = useState<z.infer<typeof formData>>()
    const connection = new Connection(clusterApiUrl("devnet"))
    const wallet = useWallet();

    async function createToken() {
        if (wallet.publicKey){
            const mintKeypair = Keypair.generate();
            const metadata = {
                mint: mintKeypair.publicKey,
                name: 'KIRA',
                symbol: 'KIR    ',
                uri: 'https://cdn.100xdevs.com/metadata.json',
                additionalMetadata: [],
            };
    
            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    
            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: mintLen,
                    lamports,
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: mintKeypair.publicKey,
                    metadata: mintKeypair.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    mintAuthority: wallet.publicKey,
                    updateAuthority: wallet.publicKey,
                }),
            );
                
            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair);
    
            await wallet.sendTransaction(transaction, connection);
    
            console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
            const associatedToken = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID,
            );
    
            console.log(associatedToken.toBase58());
    
            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID,
                ),
            );
    
            await wallet.sendTransaction(transaction2, connection);
    
            const transaction3 = new Transaction().add(
                createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
            );
    
            await wallet.sendTransaction(transaction3, connection);
    
            console.log("Minted!")
        }
        else{
            toast("Please Connect to the wallet first")
        }
    }

    const onSubmit =async (e: any) => {
        e.preventDefault()

        console.log(form)
        const parsedForm = formData.safeParse(form)
        if (!parsedForm.success){
            toast(JSON.parse(parsedForm.error.message)[0].message)
            return
        }

    }

    return (
        <div className="w-screen h-[80vh]" >
            <div className="w-[70%] mx-auto h-[90%]" >
                <h1 className="text-5xl text-center font-bold mb-4 text-white">
                    Create your Token
                </h1>
                <form onSubmit={onSubmit} className="w-[30%] flex flex-col gap-4 text-white mx-auto">
                    <div>
                        <Label className="">Name</Label>
                        <Input
                            value={form?.name}
                        onChange={(e) => {
                            setFormData({
                                name: e.target.value,
                                uri: form?.uri as string,
                                symbol: form?.symbol as string ,
                                decimal: form?.decimal as number
                            })
                        }} className="" placeholder='Zeref' />
                    </div>
                    <div>
                        <Label className="">Symbol</Label>
                        <Input onChange={(e) => {
                            setFormData({
                                name: form?.name as string,
                                uri: form?.uri as string,
                                symbol: e.target.value ,
                                decimal: form?.decimal as number
                            })
                        }}
                        value={form?.symbol}
                        className="" placeholder='ZRF' />

                    </div>
                    <div>
                        <Label className="">URL</Label>
                        <Input
                        type='url'
                        onChange={(e) => {
                            setFormData({
                                name: form?.name as string,
                                uri: e.target.value,
                                symbol: form?.symbol as string ,
                                decimal: form?.decimal as number
                            })
                        }}
                        value={form?.uri}
                        className="" placeholder='https://....' />

                    </div>
                    <div>
                        <Label className="">Decimals</Label>
                        <Input
                        type="number"
                        onChange={(e) => {
                            setFormData({
                                name: form?.name as string,
                                uri: form?.uri as string,
                                symbol: form?.symbol as string ,
                                decimal: parseInt(e.target.value)
                            })
                        }} 
                        value={form?.decimal}
                        className="" placeholder='9' />

                    </div>
                    <Button disabled={!wallet.publicKey} type="submit" className="w-[80%] mx-auto" variant={"secondary"}>
                        Make Token
                    </Button>
                </form>
            </div>
            <Toaster/>
        </div>
    )
}

export default MainApp
