import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnalosNftLauncher } from "../target/types/analos_nft_launcher";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("analos-nft-launcher", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnalosNftLauncher as Program<AnalosNftLauncher>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test accounts
  let collectionKeypair: Keypair;
  let mintKeypair: Keypair;
  let nftKeypair: Keypair;
  let nftMintKeypair: Keypair;

  before(async () => {
    // Initialize test keypairs
    collectionKeypair = Keypair.generate();
    mintKeypair = Keypair.generate();
    nftKeypair = Keypair.generate();
    nftMintKeypair = Keypair.generate();
  });

  it("Creates a collection", async () => {
    const [collectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection"), Buffer.from("Test Collection")],
      program.programId
    );

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const tx = await program.methods
      .createCollection({
        name: "Test Collection",
        symbol: "TEST",
        description: "A test NFT collection",
        imageUri: "https://example.com/image.png",
        externalUrl: "https://example.com",
        metadataUri: "https://example.com/metadata.json",
        sellerFeeBasisPoints: 250, // 2.5%
        maxSupply: new anchor.BN(1000),
        mintPrice: new anchor.BN(1000000000), // 1 SOL in lamports
        feeWallet: wallet.publicKey,
        isPublic: true,
      })
      .accounts({
        collection: collectionPDA,
        mint: mintKeypair.publicKey,
        metadata: metadataPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .signers([mintKeypair])
      .rpc();

    console.log("Collection creation transaction signature:", tx);

    // Verify collection was created
    const collection = await program.account.collection.fetch(collectionPDA);
    expect(collection.name).to.equal("Test Collection");
    expect(collection.symbol).to.equal("TEST");
    expect(collection.maxSupply.toNumber()).to.equal(1000);
    expect(collection.mintPrice.toNumber()).to.equal(1000000000);
  });

  it("Mints an NFT", async () => {
    const [collectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection"), Buffer.from("Test Collection")],
      program.programId
    );

    const [nftPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("nft"),
        collectionPDA.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 4),
      ],
      program.programId
    );

    const [nftAssetPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("asset"),
        program.programId.toBuffer(),
        nftMintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4GZgV9t") // Core program ID
    );

    // Create associated token account for payment
    const paymentTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: wallet.publicKey,
    });

    const feeTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: wallet.publicKey, // Using same wallet for simplicity
    });

    const tx = await program.methods
      .mintNft({
        name: "Test NFT #1",
        symbol: "TEST",
        uri: "https://example.com/nft/1.json",
      })
      .accounts({
        collection: collectionPDA,
        nft: nftPDA,
        nftMint: nftMintKeypair.publicKey,
        nftAsset: nftAssetPDA,
        minter: wallet.publicKey,
        collectionAuthority: wallet.publicKey,
        paymentTokenAccount: paymentTokenAccount,
        feeTokenAccount: feeTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        coreProgram: new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4GZgV9t"),
      })
      .signers([nftMintKeypair])
      .rpc();

    console.log("NFT mint transaction signature:", tx);

    // Verify NFT was minted
    const nft = await program.account.nft.fetch(nftPDA);
    expect(nft.collection.toString()).to.equal(collectionPDA.toString());
    expect(nft.owner.toString()).to.equal(wallet.publicKey.toString());
    expect(nft.tokenId.toNumber()).to.equal(0);
  });

  it("Updates collection metadata", async () => {
    const [collectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection"), Buffer.from("Test Collection")],
      program.programId
    );

    const tx = await program.methods
      .updateCollection({
        name: "Updated Test Collection",
        description: "An updated test NFT collection",
        imageUri: "https://example.com/updated-image.png",
        externalUrl: "https://example.com/updated",
        sellerFeeBasisPoints: 500, // 5%
        isPublic: false,
      })
      .accounts({
        collection: collectionPDA,
        authority: wallet.publicKey,
      })
      .rpc();

    console.log("Collection update transaction signature:", tx);

    // Verify collection was updated
    const collection = await program.account.collection.fetch(collectionPDA);
    expect(collection.name).to.equal("Updated Test Collection");
    expect(collection.description).to.equal("An updated test NFT collection");
    expect(collection.sellerFeeBasisPoints).to.equal(500);
    expect(collection.isPublic).to.be.false;
  });

  it("Adds addresses to whitelist", async () => {
    const [collectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection"), Buffer.from("Test Collection")],
      program.programId
    );

    const testAddresses = [Keypair.generate().publicKey, Keypair.generate().publicKey];

    const tx = await program.methods
      .addToWhitelist(testAddresses)
      .accounts({
        collection: collectionPDA,
        authority: wallet.publicKey,
      })
      .rpc();

    console.log("Whitelist update transaction signature:", tx);

    // Verify addresses were added
    const collection = await program.account.collection.fetch(collectionPDA);
    expect(collection.whitelist.length).to.be.greaterThan(0);
  });

  it("Burns an NFT", async () => {
    const [collectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection"), Buffer.from("Test Collection")],
      program.programId
    );

    const [nftPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("nft"),
        collectionPDA.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 4),
      ],
      program.programId
    );

    const [nftAssetPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("asset"),
        program.programId.toBuffer(),
        nftMintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4GZgV9t")
    );

    const tx = await program.methods
      .burnNft()
      .accounts({
        nft: nftPDA,
        nftAsset: nftAssetPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        coreProgram: new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4GZgV9t"),
      })
      .rpc();

    console.log("NFT burn transaction signature:", tx);

    // Verify NFT was burned (account should be closed)
    try {
      await program.account.nft.fetch(nftPDA);
      expect.fail("NFT account should be closed after burn");
    } catch (error) {
      // Expected error - account doesn't exist
      expect(error.message).to.include("Account does not exist");
    }
  });
});
