use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Mint, Burn, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::instructions::{CreateMetadataAccountV3, UpdateMetadataAccountV2}
use mpl_token_metadata::types::Creator;

declare_id!("Frjrqak9ospiUqQiBH5E7XduTngUJx1a3E9g28VSaB2C");

#[program]
pub mod nft_program {
    use super::*;

    pub fn Mint_Nft(ctx: Context<MintNft>, _input: Vec<u8>, uri: String, name: String, symbol: String) -> Result<()> {
        let index = &mut ctx.accounts.index_account;

        if index.counter > 5000 {
            return Err(ErrorCode::MintLimitExceeded.into());
        }



        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(init_if_needed, payer = payer_account, space = 8 + std::mem::size_of::<AmoebitIndex>())]
    pub index_account: Account<'info, AmoebitIndex>,
    #[account(mut)]
    pub payer_account: Signer<'info>,
    /// CHECK: Wallet check
    #[account()]
    pub wallet: AccountInfo<'info>,
    /// CHECK: Mint account validation
    #[account(mut)]
    pub mint_account: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: Meta account (PDA)
    #[account(mut)]
    pub meta_account: AccountInfo<'info>,
    /// CHECK: Metaplex token metadata program
    #[account(address = TOKEN_META_PROGRAM.parse::<Pubkey>().unwrap())]
    pub meta_program_account: AccountInfo<'info>,
    /// CHECK: Auth account
    #[account(mut)]
    pub auth_account: AccountInfo<'info>,
    /// CHECK: Sysvar rent account
    #[account(address = sysvar::rent::ID)]
    pub rent_account: AccountInfo<'info>,
    #[account(address = TOKEN_PROGRAM.parse::<Pubkey>().unwrap())]
    pub token_program_account: Program<'info, Token>,
    /// CHECK: WL Mint Account
    #[account()]
    pub wl_mint: AccountInfo<'info>,
    #[account(mut)]
    pub discount_mint_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
#[account]
pub struct AmoebitIndex {
    pub counter: u16,
}

// Constants (adapt these for your use case)
const PREFIX: &str = "amoebit_minter";
const TOKEN_PROGRAM: &str = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_META_PROGRAM: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const OUR_WALLET: &str = "AmbtTL5LS42RFL1ZL5QQan8ZSyn27pvVoCbFYF2eTwyH";
const MINT_KEY: &str = "DwuhyNAQYjJHKZJEkVLy5Phoz83Tty6whVcZ79eQ7rXs";
const RELEASE_TIME: i64 = 1636758000; // Example timestamp


#[error_code]
pub enum ErrorCode {
    #[msg("Maximum mint limit exceeded")]
    MintLimitExceeded
}