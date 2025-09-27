use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use mpl_token_metadata::{
    instructions::{CreateV1CpiBuilder, CreateV1InstructionAccounts, CreateV1InstructionArgs},
    types::{Creator, Collection},
};

declare_id!("NFTLauncher1111111111111111111111111111111");

#[program]
pub mod analos_nft_launcher {
    use super::*;

    /// Mint a single NFT with metadata
    pub fn mint_nft(
        ctx: Context<MintNft>,
        args: MintNftArgs,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        
        // Create NFT metadata using Metaplex Token Metadata
        let creators = vec![Creator {
            address: ctx.accounts.authority.key(),
            verified: true,
            share: 100,
        }];

        let collection = Collection {
            name: args.collection_name.clone(),
            family: args.collection_symbol.clone(),
        };

        let create_ix = CreateV1CpiBuilder::new(&ctx.accounts.metadata_program)
            .mint(ctx.accounts.mint.to_account_info())
            .authority(ctx.accounts.authority.to_account_info())
            .payer(ctx.accounts.authority.to_account_info())
            .update_authority(ctx.accounts.authority.to_account_info())
            .system_program(ctx.accounts.system_program.to_account_info())
            .rent(ctx.accounts.rent.to_account_info())
            .metadata(ctx.accounts.metadata.to_account_info())
            .create_v1(CreateV1InstructionArgs {
                data: mpl_token_metadata::types::DataV2 {
                    name: args.name,
                    symbol: args.symbol,
                    uri: args.uri,
                    seller_fee_basis_points: args.seller_fee_basis_points,
                    creators: Some(creators),
                    collection: Some(collection),
                    uses: None,
                },
                is_mutable: true,
                collection_details: None,
            });

        create_ix.invoke()?;

        // Store NFT info
        nft.mint = ctx.accounts.mint.key();
        nft.metadata = ctx.accounts.metadata.key();
        nft.owner = ctx.accounts.authority.key();
        nft.name = args.name.clone();
        nft.symbol = args.symbol.clone();
        nft.uri = args.uri.clone();
        nft.seller_fee_basis_points = args.seller_fee_basis_points;
        nft.bump = ctx.bumps.nft;

        msg!("NFT minted: {} with metadata: {}", nft.mint, nft.uri);
        Ok(())
    }

    /// Update NFT metadata (only by owner)
    pub fn update_nft_metadata(
        ctx: Context<UpdateNftMetadata>,
        args: UpdateNftMetadataArgs,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.nft;
        
        // Only NFT owner can update
        require!(
            ctx.accounts.authority.key() == nft.owner,
            ErrorCode::Unauthorized
        );

        if let Some(name) = args.name {
            nft.name = name;
        }
        if let Some(symbol) = args.symbol {
            nft.symbol = symbol;
        }
        if let Some(uri) = args.uri {
            nft.uri = uri;
        }
        if let Some(seller_fee_basis_points) = args.seller_fee_basis_points {
            nft.seller_fee_basis_points = seller_fee_basis_points;
        }

        msg!("NFT metadata updated: {}", nft.mint);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(args: MintNftArgs)]
pub struct MintNft<'info> {
    #[account(
        init,
        payer = authority,
        space = Nft::LEN,
        seeds = [b"nft", authority.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub nft: Account<'info, Nft>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,
    
    /// CHECK: This account is created by the metadata program
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: This is the Metaplex Token Metadata program
    pub metadata_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateNftMetadata<'info> {
    #[account(
        mut,
        has_one = owner @ ErrorCode::InvalidOwner,
    )]
    pub nft: Account<'info, Nft>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Nft {
    pub mint: Pubkey,
    pub metadata: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintNftArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub collection_name: String,
    pub collection_symbol: String,
    pub seller_fee_basis_points: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateNftMetadataArgs {
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub uri: Option<String>,
    pub seller_fee_basis_points: Option<u16>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid metadata")]
    InvalidMetadata,
}

impl Nft {
    pub const LEN: usize = 8 + // discriminator
        32 + // mint
        32 + // metadata
        32 + // owner
        4 + 32 + // name (4 + 32)
        4 + 10 + // symbol (4 + 10)
        4 + 200 + // uri (4 + 200)
        2 + // seller_fee_basis_points
        1; // bump
}
