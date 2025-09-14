use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use mpl_core::{
    instructions::{
        CreateV1CpiBuilder, CreateV1InstructionAccounts, CreateV1InstructionArgs,
        UpdateV1CpiBuilder, UpdateV1InstructionAccounts, UpdateV1InstructionArgs,
    },
    types::{Plugin, PluginType, RuleSet, UpdateAuthority},
};
use mpl_token_metadata::{
    instructions::{CreateV1CpiBuilder as MetadataCreateV1CpiBuilder, CreateV1InstructionAccounts as MetadataCreateV1InstructionAccounts, CreateV1InstructionArgs as MetadataCreateV1InstructionArgs},
    types::{Creator, Collection},
};

declare_id!("NFTLauncher1111111111111111111111111111111");

#[program]
pub mod analos_nft_launcher {
    use super::*;

    /// Initialize a new NFT collection
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        args: CreateCollectionArgs,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        collection.authority = ctx.accounts.authority.key();
        collection.mint = ctx.accounts.mint.key();
        collection.metadata = ctx.accounts.metadata.key();
        collection.name = args.name;
        collection.symbol = args.symbol;
        collection.description = args.description;
        collection.image_uri = args.image_uri;
        collection.external_url = args.external_url;
        collection.seller_fee_basis_points = args.seller_fee_basis_points;
        collection.max_supply = args.max_supply;
        collection.mint_price = args.mint_price;
        collection.fee_wallet = args.fee_wallet;
        collection.is_public = args.is_public;
        collection.total_minted = 0;
        collection.bump = ctx.bumps.collection;

        // Create the collection metadata using Metaplex Core
        let creators = vec![Creator {
            address: ctx.accounts.authority.key(),
            verified: true,
            share: 100,
        }];

        let collection_metadata = Collection {
            name: args.name.clone(),
            family: args.symbol.clone(),
        };

        let create_ix = MetadataCreateV1CpiBuilder::new(&ctx.accounts.metadata_program)
            .mint(ctx.accounts.mint.to_account_info())
            .authority(ctx.accounts.authority.to_account_info())
            .payer(ctx.accounts.authority.to_account_info())
            .update_authority(ctx.accounts.authority.to_account_info())
            .system_program(ctx.accounts.system_program.to_account_info())
            .rent(ctx.accounts.rent.to_account_info())
            .metadata(ctx.accounts.metadata.to_account_info())
            .create_v1(MetadataCreateV1InstructionArgs {
                data: mpl_token_metadata::types::DataV2 {
                    name: args.name,
                    symbol: args.symbol,
                    uri: args.metadata_uri,
                    seller_fee_basis_points: args.seller_fee_basis_points,
                    creators: Some(creators),
                    collection: Some(collection_metadata),
                    uses: None,
                },
                is_mutable: true,
                collection_details: None,
            });

        create_ix.invoke()?;

        msg!("Collection created: {}", collection.mint);
        Ok(())
    }

    /// Mint an NFT from the collection
    pub fn mint_nft(
        ctx: Context<MintNft>,
        args: MintNftArgs,
    ) -> Result<()> {
        let collection = &ctx.accounts.collection;
        let nft = &mut ctx.accounts.nft;

        // Check if collection is public or user is whitelisted
        require!(
            collection.is_public || collection.whitelist.contains(&ctx.accounts.minter.key()),
            ErrorCode::NotWhitelisted
        );

        // Check supply
        require!(
            collection.total_minted < collection.max_supply,
            ErrorCode::CollectionSoldOut
        );

        // Check payment
        if collection.mint_price > 0 {
            let mint_price_lamports = (collection.mint_price * 1_000_000_000.0) as u64;
            require!(
                ctx.accounts.payment_token_account.amount >= mint_price_lamports,
                ErrorCode::InsufficientPayment
            );

            // Transfer payment to fee wallet
            let cpi_accounts = Transfer {
                from: ctx.accounts.payment_token_account.to_account_info(),
                to: ctx.accounts.fee_token_account.to_account_info(),
                authority: ctx.accounts.minter.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, mint_price_lamports)?;
        }

        // Create NFT using Metaplex Core
        let create_ix = CreateV1CpiBuilder::new(&ctx.accounts.core_program)
            .asset(ctx.accounts.nft_asset.to_account_info())
            .owner(ctx.accounts.minter.to_account_info())
            .payer(ctx.accounts.minter.to_account_info())
            .update_authority(ctx.accounts.collection_authority.to_account_info())
            .system_program(ctx.accounts.system_program.to_account_info())
            .rent(ctx.accounts.rent.to_account_info())
            .create_v1(CreateV1InstructionArgs {
                name: args.name,
                symbol: args.symbol,
                uri: args.uri,
                plugins: Some(vec![Plugin {
                    plugin_type: PluginType::Royalties,
                    plugin_authority: Some(PluginAuthority::UpdateAuthority),
                    data: vec![], // Royalty data
                }]),
            });

        create_ix.invoke()?;

        // Update collection stats
        let collection_account = &mut ctx.accounts.collection;
        collection_account.total_minted += 1;

        // Store NFT info
        nft.collection = collection.key();
        nft.mint = ctx.accounts.nft_mint.key();
        nft.asset = ctx.accounts.nft_asset.key();
        nft.owner = ctx.accounts.minter.key();
        nft.token_id = collection.total_minted;
        nft.metadata_uri = args.uri;
        nft.bump = ctx.bumps.nft;

        msg!("NFT minted: {} from collection {}", nft.mint, collection.key());
        Ok(())
    }

    /// Update collection metadata
    pub fn update_collection(
        ctx: Context<UpdateCollection>,
        args: UpdateCollectionArgs,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        
        // Only collection authority can update
        require!(
            ctx.accounts.authority.key() == collection.authority,
            ErrorCode::Unauthorized
        );

        if let Some(name) = args.name {
            collection.name = name;
        }
        if let Some(description) = args.description {
            collection.description = description;
        }
        if let Some(image_uri) = args.image_uri {
            collection.image_uri = image_uri;
        }
        if let Some(external_url) = args.external_url {
            collection.external_url = external_url;
        }
        if let Some(seller_fee_basis_points) = args.seller_fee_basis_points {
            collection.seller_fee_basis_points = seller_fee_basis_points;
        }
        if let Some(is_public) = args.is_public {
            collection.is_public = is_public;
        }

        msg!("Collection updated: {}", collection.key());
        Ok(())
    }

    /// Add addresses to whitelist
    pub fn add_to_whitelist(
        ctx: Context<UpdateWhitelist>,
        addresses: Vec<Pubkey>,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        
        require!(
            ctx.accounts.authority.key() == collection.authority,
            ErrorCode::Unauthorized
        );

        for address in addresses {
            if !collection.whitelist.contains(&address) {
                collection.whitelist.push(address);
            }
        }

        msg!("Added {} addresses to whitelist", addresses.len());
        Ok(())
    }

    /// Remove addresses from whitelist
    pub fn remove_from_whitelist(
        ctx: Context<UpdateWhitelist>,
        addresses: Vec<Pubkey>,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        
        require!(
            ctx.accounts.authority.key() == collection.authority,
            ErrorCode::Unauthorized
        );

        for address in addresses {
            collection.whitelist.retain(|&x| x != address);
        }

        msg!("Removed {} addresses from whitelist", addresses.len());
        Ok(())
    }

    /// Burn an NFT
    pub fn burn_nft(
        ctx: Context<BurnNft>,
    ) -> Result<()> {
        let nft = &ctx.accounts.nft;
        
        require!(
            ctx.accounts.authority.key() == nft.owner,
            ErrorCode::Unauthorized
        );

        // Burn the NFT asset
        let burn_ix = UpdateV1CpiBuilder::new(&ctx.accounts.core_program)
            .asset(ctx.accounts.nft_asset.to_account_info())
            .authority(ctx.accounts.authority.to_account_info())
            .payer(ctx.accounts.authority.to_account_info())
            .system_program(ctx.accounts.system_program.to_account_info())
            .rent(ctx.accounts.rent.to_account_info())
            .update_v1(UpdateV1InstructionArgs {
                new_update_authority: None,
                plugins: Some(vec![]), // Remove all plugins
            });

        burn_ix.invoke()?;

        msg!("NFT burned: {}", nft.mint);
        Ok(())
    }

    /// Mint NFTs from a collection
    pub fn mint_nft(
        ctx: Context<MintNft>,
        collection_id: String,
        quantity: u32,
        phase: String,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        let clock = Clock::get()?;
        
        // Validate phase
        match phase.as_str() {
            "presale" => {
                // Check if presale is active
                require!(
                    collection.presale_start <= clock.unix_timestamp,
                    ErrorCode::PresaleNotStarted
                );
                require!(
                    collection.presale_end > clock.unix_timestamp,
                    ErrorCode::PresaleEnded
                );
            }
            "public" => {
                // Check if public mint is active
                require!(
                    collection.public_start <= clock.unix_timestamp,
                    ErrorCode::PublicMintNotStarted
                );
            }
            _ => return Err(ErrorCode::InvalidPhase.into()),
        }
        
        // Check supply
        require!(
            collection.total_minted + quantity <= collection.max_supply,
            ErrorCode::ExceedsMaxSupply
        );
        
        // Update collection stats
        collection.total_minted += quantity;
        
        msg!("Minted {} NFTs from collection {}", quantity, collection_id);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(args: CreateCollectionArgs)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = Collection::LEN,
        seeds = [b"collection", args.name.as_bytes()],
        bump
    )]
    pub collection: Account<'info, Collection>,
    
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
#[instruction(args: MintNftArgs)]
pub struct MintNft<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub collection: Account<'info, Collection>,
    
    #[account(
        init,
        payer = minter,
        space = Nft::LEN,
        seeds = [b"nft", collection.key().as_ref(), &collection.total_minted.to_le_bytes()],
        bump
    )]
    pub nft: Account<'info, Nft>,
    
    #[account(
        init,
        payer = minter,
        mint::decimals = 0,
        mint::authority = collection_authority,
    )]
    pub nft_mint: Account<'info, Mint>,
    
    /// CHECK: This account is created by the core program
    #[account(mut)]
    pub nft_asset: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub minter: Signer<'info>,
    
    /// CHECK: Collection authority for minting
    pub collection_authority: UncheckedAccount<'info>,
    
    #[account(
        mut,
        constraint = payment_token_account.owner == minter.key(),
    )]
    pub payment_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = fee_token_account.owner == collection.fee_wallet,
    )]
    pub fee_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: This is the Metaplex Core program
    pub core_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateCollection<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub collection: Account<'info, Collection>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateWhitelist<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub collection: Account<'info, Collection>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct BurnNft<'info> {
    #[account(
        mut,
        has_one = owner @ ErrorCode::InvalidOwner,
        close = authority,
    )]
    pub nft: Account<'info, Nft>,
    
    /// CHECK: NFT asset account
    #[account(mut)]
    pub nft_asset: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
    /// CHECK: This is the Metaplex Core program
    pub core_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(collection_id: String, quantity: u32, phase: String)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"collection", collection_id.as_bytes()],
        bump = collection.bump
    )]
    pub collection: Account<'info, Collection>,
    
    /// CHECK: This is the NFT asset account
    #[account(mut)]
    pub nft_asset: UncheckedAccount<'info>,
    
    /// CHECK: This is the owner account
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    
    pub core_program: Program<'info, mpl_core::program::MplCore>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub metadata: Pubkey,
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image_uri: String,
    pub external_url: String,
    pub seller_fee_basis_points: u16,
    pub max_supply: u32,
    pub mint_price: u64, // in lamports
    pub fee_wallet: Pubkey,
    pub is_public: bool,
    pub whitelist: Vec<Pubkey>,
    pub total_minted: u32,
    pub bump: u8,
}

#[account]
pub struct Nft {
    pub collection: Pubkey,
    pub mint: Pubkey,
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub token_id: u32,
    pub metadata_uri: String,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionArgs {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image_uri: String,
    pub external_url: String,
    pub metadata_uri: String,
    pub seller_fee_basis_points: u16,
    pub max_supply: u32,
    pub mint_price: u64,
    pub fee_wallet: Pubkey,
    pub is_public: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintNftArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionArgs {
    pub name: Option<String>,
    pub description: Option<String>,
    pub image_uri: Option<String>,
    pub external_url: Option<String>,
    pub seller_fee_basis_points: Option<u16>,
    pub is_public: Option<bool>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Not whitelisted")]
    NotWhitelisted,
    #[msg("Collection sold out")]
    CollectionSoldOut,
    #[msg("Insufficient payment")]
    InsufficientPayment,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid mint price")]
    InvalidMintPrice,
    #[msg("Invalid supply")]
    InvalidSupply,
    #[msg("Presale not started")]
    PresaleNotStarted,
    #[msg("Presale ended")]
    PresaleEnded,
    #[msg("Public mint not started")]
    PublicMintNotStarted,
    #[msg("Invalid phase")]
    InvalidPhase,
    #[msg("Exceeds max supply")]
    ExceedsMaxSupply,
    #[msg("Exceeds wallet mint limit")]
    ExceedsWalletMintLimit,
}

impl Collection {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // mint
        32 + // metadata
        4 + 32 + // name (4 + 32)
        4 + 10 + // symbol (4 + 10)
        4 + 500 + // description (4 + 500)
        4 + 200 + // image_uri (4 + 200)
        4 + 200 + // external_url (4 + 200)
        2 + // seller_fee_basis_points
        4 + // max_supply
        8 + // mint_price
        32 + // fee_wallet
        1 + // is_public
        4 + (32 * 100) + // whitelist (4 + 32 * 100)
        4 + // total_minted
        1; // bump
}

impl Nft {
    pub const LEN: usize = 8 + // discriminator
        32 + // collection
        32 + // mint
        32 + // asset
        32 + // owner
        4 + // token_id
        4 + 200 + // metadata_uri (4 + 200)
        1; // bump
}
