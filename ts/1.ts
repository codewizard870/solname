import fs from "fs";
import { BN, Wallet } from "@project-serum/anchor";
import { getAccount } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { Keypair, LAMPORTS_PER_SOL, Connection, Transaction } from "@solana/web3.js";

import { SignerWallet } from "@saberhq/solana-contrib";

import * as anchor from "@project-serum/anchor";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createMintNewEditionFromMasterEditionViaTokenInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, Metaplex, mockStorage } from "@metaplex-foundation/js";
import { Solname } from "../target/types/solname";

let provider;
const RECIPIENT_START_PAYMENT_AMOUNT = 1000;
const RENTAL_PAYMENT_AMONT = 10;
let connection = new Connection("http://localhost:8899", "confirmed");
//    const NETWORK = "https://api.devnet.solana.com";
//   const NETWORK = "http://localhost:8899";
//   const NETWORK = "https://api.mainnet-beta.solana.com"; 

const recipient = Keypair.generate();
const useAuthority = Keypair.generate();


let program;
let admin;
let recipientPaymentTokenAccountId: PublicKey;
let issuerTokenAccountId: PublicKey;
let paymentMint: PublicKey;
let rentalMint: PublicKey;
let editionMint: PublicKey;
let metaplex;

const init = async () => {
  const pk = Uint8Array.from(
    JSON.parse(
      fs.readFileSync(
        `/home/dev/.config/solana/id.json`
      ) as unknown as string
    )
  );
  admin = Keypair.fromSecretKey(pk);
  console.log("Admin address:", admin.publicKey.toBase58());

  provider = new SignerWallet(admin).createProvider(connection);
  anchor.setProvider(
    new anchor.AnchorProvider(
      connection,
      provider.wallet,
      anchor.AnchorProvider.defaultOptions()
    )
  );
  program = anchor.workspace.Solname as anchor.Program<Solname>;

  const airdropCreator = await provider.connection.requestAirdrop(
    admin.publicKey,
    LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(airdropCreator);

  const airdropRecipient = await provider.connection.requestAirdrop(
    recipient.publicKey,
    LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(airdropRecipient);
}

const registerDomain = async () => {
  let [domainPubKey, domainBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("domain")], program.programId,
  );

  await program.rpc.registerDomain("marko.mvx", {
    accounts: {
        domain: domainPubKey,
        signer: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
    },
      signers: [admin]
  });
  console.log(program.account);

  const parsed = await program.account.domain.fetch(domainPubKey);
  console.log(parsed);

  const info = await provider.connection.getAccountInfo(domainPubKey);
  console.log(info);
};

const main = async () => {
  console.log("init")
  await init();

  console.log("Register Doamin")
  await registerDomain();

}

main();