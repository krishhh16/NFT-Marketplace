'use client'
import React, { useState } from 'react'
import * as z from "zod"
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { toast, Toaster } from "sonner"
import { clusterApiUrl,PublicKey, Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';

const formData = z.object({
    uri: z.string().url({ message: "Please input a valid url" }),
    name: z.string().min(3, {message: "Name must be more than 3 characters long"}),
    symbol: z.string().max(3),
    decimal: z.number().min(0).max(9)
})

function MainApp() {
    const [mintData, setMintData] = useState<{mintAcc: String, associateTokenData: string}>({
        mintAcc: "",
        associateTokenData: ""
    })
    const [minted, setMinted] = useState(false)
    const [form, setFormData] = useState<z.infer<typeof formData>>({
        uri: "https://github.com",
        name: "Zeref",
        symbol: "ZRF",
        decimal: 9
    })
    const connection = new Connection(clusterApiUrl("devnet"))
    const wallet = useWallet();

    async function createToken() {
        if (wallet.publicKey){
            
            try {
            const mintKeypair = Keypair.generate();
            const myKey = wallet.publicKey;
            const metadata: TokenMetadata = {
                name: form?.name as string,
                uri: form?.uri as string,
                symbol: form?.symbol as string,
                mint: mintKeypair.publicKey,
                additionalMetadata: []
            }

            console.log("Metadata: ",   metadata.name)
            console.log("Form: ", form)
            console.log(mintKeypair.publicKey.toString())

            const mintLen = getMintLen([ExtensionType.MetadataPointer])
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen)
            console.log("I only run till here")
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: myKey,
                    lamports,
                    newAccountPubkey: mintKeypair.publicKey,
                    programId: TOKEN_2022_PROGRAM_ID,
                    space: mintLen
                }),
                createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(mintKeypair.publicKey, form?.decimal as number, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    metadata: mintKeypair.publicKey,
                    uri: metadata.uri,
                    name: metadata.name,
                    mintAuthority: myKey,
                    mint: mintKeypair.publicKey,
                    symbol: metadata.symbol,
                    programId: TOKEN_2022_PROGRAM_ID,
                    updateAuthority: wallet.publicKey
                })
            )
            
            transaction.feePayer = myKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair)
            
            
            await wallet.sendTransaction(transaction, connection) 
            console.log("but not till here")
            const associateTokenAccount = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,myKey, false, TOKEN_2022_PROGRAM_ID
            )

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey, associateTokenAccount, myKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID
                )
            )

            await wallet.sendTransaction(transaction2, connection)

            const transaction3 = new Transaction().add(
                createMintToInstruction(mintKeypair.publicKey, associateTokenAccount, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
            )

            await wallet.sendTransaction(transaction3, connection)

            setMinted(true)
            setMintData({
                mintAcc: mintKeypair.publicKey.toString(),
                associateTokenData: associateTokenAccount.toString()
            })

            }catch (err: any) {
                toast(`Error happened: ${err.message}`)
            }
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

        createToken()

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
                    {
                        minted &&
                        <div>
                            <Label>Your Mint is: {mintData.mintAcc}</Label>
                            <Label>Your ATA is: {mintData.associateTokenData}</Label>
                        </div>
                    }
                </form>

            </div>
            <Toaster theme="system" />
        </div>
    )
}

export default MainApp
