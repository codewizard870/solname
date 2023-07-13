use anchor_lang::prelude::*;
use crate::state::Domain;

#[derive(Accounts)]
pub struct RegisterDomain<'info> {
    // Note that we have to add 8 to the space for the internal anchor
    #[account(
        init_if_needed, 
        payer = signer, 
        space = 8 + Domain::MAX_SIZE, 
        seeds=[b"domain".as_ref()],
        bump,
    )]
    pub domain: Account<'info, Domain>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn handler(
    ctx: Context<RegisterDomain>,
    name: String,
) -> ProgramResult {
    let domain = &mut ctx.accounts.domain;
    domain.name = name;
    Ok(())
}