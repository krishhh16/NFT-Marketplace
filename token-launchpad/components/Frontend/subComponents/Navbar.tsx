import WalletButton from '@/components/Wallet/WalletButton'
import React from 'react'
import * as motion from "framer-motion/client"

function Navbar() {
    
    return (
        <div className="h-[100px] p-10 px-16 flex justify-between w-full" >
            <motion.div initial={{y: -60, opacity: 0}}  whileInView={{y: 0, opacity: 1}}  transition={{duration: 1.3}} className="flex w-1/2 gap-4 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="rgba(141,4,239,1)"><path d="M21 11.6458V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11.6458C2.37764 10.9407 2 10.0144 2 9V3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44772 22 3V9C22 10.0144 21.6224 10.9407 21 11.6458ZM19 12.874C18.6804 12.9562 18.3453 13 18 13C16.8053 13 15.7329 12.4762 15 11.6458C14.2671 12.4762 13.1947 13 12 13C10.8053 13 9.73294 12.4762 9 11.6458C8.26706 12.4762 7.19469 13 6 13C5.6547 13 5.31962 12.9562 5 12.874V20H19V12.874ZM14 9C14 8.44772 14.4477 8 15 8C15.5523 8 16 8.44772 16 9C16 10.1046 16.8954 11 18 11C19.1046 11 20 10.1046 20 9V4H4V9C4 10.1046 4.89543 11 6 11C7.10457 11 8 10.1046 8 9C8 8.44772 8.44772 8 9 8C9.55228 8 10 8.44772 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9Z"></path></svg>
                <h1 className="font-[700] text-2xl  text-white">
                    Token Launch Pad
                </h1>
            </motion.div>
            <motion.div initial={{y: -60, opacity: 0}} whileInView={{y: 0, opacity: 1}}  transition={{duration: 1.2}} className="flex items-center gap-10">
                <WalletButton/>
            </motion.div>
        </div>
    )
}

export default Navbar
