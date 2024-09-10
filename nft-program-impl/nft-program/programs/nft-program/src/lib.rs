use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::Token;


declare_id!("Frjrqak9ospiUqQiBH5E7XduTngUJx1a3E9g28VSaB2C");

#[program]
pub mod nft_program {
    use super::*;

    
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>, // This is the account that has the authority to mint more tokens(NFT in this case)
    #[account(mut)]
    pub mint: UncheckedAccount<'info>, // Account automatically does it's own checks on the account(Like checking ownership, existence of the acc), but we would like to have more control, so we're gonna use UncheckedAccount to add custom checks on the account
    pub token_program: Program<'info, Token>, // Donno for sure, but it is a program that handles mechanism regarding tokens
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>, // this is the account that will contain all the info like the name, symbol and the url to the NFT
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>, // this is the account to which the newly minted NFT will be sent to
    pub token_metadata_program: UncheckedAccount<'info>, // this points to the program that handles the metadata of the NFT. This will point to metaplex since it manages the metadata of the NFT
    #[account(mut)]
    pub payer: AccountInfo<'info>,
}
