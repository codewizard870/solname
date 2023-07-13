use anchor_lang::prelude::*;


#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub struct Profile {
    pub name: String, //256
    pub avatar: String, 
    pub location: String, 
    pub website: String, 
    pub shortbio: String, 
}

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub struct SubDomain {
    pub name: String, //256
}

#[account]
pub struct Domain {
    pub name: String, //256
    pub expires_at: u8,
    pub profile: Profile,
    pub invalidators: Vec<SubDomain>, //max 10
    
}
impl Domain {
    pub const MAX_SIZE: usize = (4 + 256) + 1 + ((4 + 256) * 5) + (4 + 10 * (4 + 256));
}

#[derive(Accounts)]
pub struct InitializeMyData<'info> {
    // Note that we have to add 8 to the space for the internal anchor
    #[account(init, payer = signer, space = 8 + Domain::MAX_SIZE)]
    pub acc: Account<'info, Domain>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}