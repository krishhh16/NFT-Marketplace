use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Mint, Burn, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::instructions::{CreateMetadataAccountV3, UpdateMetadataAccountV2}
use mpl_token_metadata::types::Creator;

declare_id!("Frjrqak9ospiUqQiBH5E7XduTngUJx1a3E9g28VSaB2C");

#[program]
pub mod nft_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {

}