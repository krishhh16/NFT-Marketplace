"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
    const wallet = useWallet();
    const { setVisible} = useWalletModal();

    const USER_PUBLIC_KEY = wallet?.publicKey?.toString().slice(0, 4) + "..." + wallet?.publicKey?.toString().slice(38, -1)
    return (
        <>
            {
                wallet.publicKey ?
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant={"ghost"} className="bg-[#A259FF] rounded-2xl border-0 text-white p-6 h-[5vh] " >
                                {USER_PUBLIC_KEY}
                            </Button>
                            
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full" >
                            <DropdownMenuLabel  onClick={() => setVisible(true)}><Button variant={"link"} >Change Wallet</Button>  </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel onClick={() => wallet.disconnect()} ><Button  variant={"link"} className="w-full" >Disconnect wallet</Button>  </DropdownMenuLabel>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    :
                    <WalletMultiButton style={{ backgroundColor: "#A259FF", borderRadius: "100px" }} />
            }
        </>
    );
}