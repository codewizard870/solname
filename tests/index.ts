import assert from "assert";
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { Solname } from '../target/types/solname';
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface PDAParameters {
    escrowWalletKey: anchor.web3.PublicKey,
    stateKey: anchor.web3.PublicKey,
    escrowBump: number,
    stateBump: number,
    idx: anchor.BN,
}

describe('solname', () => {

    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Solname as Program<Solname>;

    let mintAddress: anchor.web3.PublicKey;
    let alice: anchor.web3.Keypair;
    let aliceWallet: anchor.web3.PublicKey;
    let bob: anchor.web3.Keypair;

    let pda: PDAParameters;

    beforeEach(async () => {
        alice = anchor.web3.Keypair.generate();

        const airdropCreator = await provider.connection.requestAirdrop(
          alice.publicKey,
          LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdropCreator);
    });

    it('register domain', async () => {
        let [domainPubKey, domainBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("domain")], program.programId,
        );

        await program.rpc.registerDomain("marko.mvx", {
            accounts: {
                domain: domainPubKey,
                signer: alice.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [alice]
        })
        const info = await provider.connection.getAccountInfo(domainPubKey);
        console.log(info);
    });

    // it('can initialize a safe payment by Alice', async () => {
    //     const [, aliceBalancePre] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalancePre, '1337000000');

    //     const amount = new anchor.BN(20000000);

    //     // Initialize mint account and fund the account
    //     const tx1 = await program.rpc.initializeNewGrant(pda.idx, pda.stateBump, pda.escrowBump, amount, {
    //         accounts: {
    //             applicationState: pda.stateKey,
    //             escrowWalletState: pda.escrowWalletKey,
    //             mintOfTokenBeingSent: mintAddress,
    //             userSending: alice.publicKey,
    //             userReceiving: bob.publicKey,
    //             walletToWithdrawFrom: aliceWallet,

    //             systemProgram: anchor.web3.SystemProgram.programId,
    //             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             tokenProgram: spl.TOKEN_PROGRAM_ID,
    //         },
    //         signers: [alice],
    //     });
    //     console.log(`Initialized a new Safe Pay instance. Alice will pay bob 20 tokens`);

    //     // Assert that 20 tokens were moved from Alice's account to the escrow.
    //     const [, aliceBalancePost] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalancePost, '1317000000');
    //     const [, escrowBalancePost] = await readAccount(pda.escrowWalletKey, provider);
    //     assert.equal(escrowBalancePost, '20000000');

    //     const state = await program.account.state.fetch(pda.stateKey);
    //     assert.equal(state.amountTokens.toString(), '20000000');
    //     assert.equal(state.stage.toString(), '1');
    // })

    // it('can send escrow funds to Bob', async () => {
    //     const [, aliceBalancePre] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalancePre, '1337000000');

    //     const amount = new anchor.BN(20000000);

    //     // Initialize mint account and fund the account
    //     const tx1 = await program.rpc.initializeNewGrant(pda.idx, pda.stateBump, pda.escrowBump, amount, {
    //         accounts: {
    //             applicationState: pda.stateKey,
    //             escrowWalletState: pda.escrowWalletKey,
    //             mintOfTokenBeingSent: mintAddress,
    //             userSending: alice.publicKey,
    //             userReceiving: bob.publicKey,
    //             walletToWithdrawFrom: aliceWallet,

    //             systemProgram: anchor.web3.SystemProgram.programId,
    //             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             tokenProgram: spl.TOKEN_PROGRAM_ID,
    //         },
    //         signers: [alice],
    //     });
    //     console.log(`Initialized a new Safe Pay instance. Alice will pay bob 20 tokens`);

    //     // Assert that 20 tokens were moved from Alice's account to the escrow.
    //     const [, aliceBalancePost] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalancePost, '1317000000');
    //     const [, escrowBalancePost] = await readAccount(pda.escrowWalletKey, provider);
    //     assert.equal(escrowBalancePost, '20000000');

    //     // Create a token account for Bob.
    //     const bobTokenAccount = await spl.Token.getAssociatedTokenAddress(
    //         spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    //         spl.TOKEN_PROGRAM_ID,
    //         mintAddress,
    //         bob.publicKey
    //     )
    //     const tx2 = await program.rpc.completeGrant(pda.idx, pda.stateBump, pda.escrowBump, {
    //         accounts: {
    //             applicationState: pda.stateKey,
    //             escrowWalletState: pda.escrowWalletKey,
    //             mintOfTokenBeingSent: mintAddress,
    //             userSending: alice.publicKey,
    //             userReceiving: bob.publicKey,
    //             walletToDepositTo: bobTokenAccount,

    //             systemProgram: anchor.web3.SystemProgram.programId,
    //             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             tokenProgram: spl.TOKEN_PROGRAM_ID,
    //             associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    //         },
    //         signers: [bob],
    //     });

    //     // Assert that 20 tokens were sent back.
    //     const [, bobBalance] = await readAccount(bobTokenAccount, provider);
    //     assert.equal(bobBalance, '20000000');

    //     // // Assert that escrow was correctly closed.
    //     try {
    //         await readAccount(pda.escrowWalletKey, provider);
    //         return assert.fail("Account should be closed");
    //     } catch (e) {
    //         assert.equal(e.message, "Cannot read properties of null (reading 'data')");
    //     }
    // })

    // it('can pull back funds once they are deposited', async () => {
    //     const [, aliceBalancePre] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalancePre, '1337000000');

    //     const amount = new anchor.BN(20000000);

    //     // Initialize mint account and fund the account
    //     const tx1 = await program.rpc.initializeNewGrant(pda.idx, pda.stateBump, pda.escrowBump, amount, {
    //         accounts: {
    //             applicationState: pda.stateKey,
    //             escrowWalletState: pda.escrowWalletKey,
    //             mintOfTokenBeingSent: mintAddress,
    //             userSending: alice.publicKey,
    //             userReceiving: bob.publicKey,
    //             walletToWithdrawFrom: aliceWallet,

    //             systemProgram: anchor.web3.SystemProgram.programId,
    //             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             tokenProgram: spl.TOKEN_PROGRAM_ID,
    //         },
    //         signers: [alice],
    //     });
    //     console.log(`Initialized a new Safe Pay instance. Alice will pay bob 20 tokens`);

    //     // Assert that 20 tokens were moved from Alice's account to the escrow.
    //     const [, aliceBalancePost] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalancePost, '1317000000');
    //     const [, escrowBalancePost] = await readAccount(pda.escrowWalletKey, provider);
    //     assert.equal(escrowBalancePost, '20000000');

    //     // Withdraw the funds back
    //     const tx2 = await program.rpc.pullBack(pda.idx, pda.stateBump, pda.escrowBump, {
    //         accounts: {
    //             applicationState: pda.stateKey,
    //             escrowWalletState: pda.escrowWalletKey,
    //             mintOfTokenBeingSent: mintAddress,
    //             userSending: alice.publicKey,
    //             userReceiving: bob.publicKey,
    //             refundWallet: aliceWallet,

    //             systemProgram: anchor.web3.SystemProgram.programId,
    //             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             tokenProgram: spl.TOKEN_PROGRAM_ID,
    //         },
    //         signers: [alice],
    //     });

    //     // Assert that 20 tokens were sent back.
    //     const [, aliceBalanceRefund] = await readAccount(aliceWallet, provider);
    //     assert.equal(aliceBalanceRefund, '1337000000');

    //     // Assert that escrow was correctly closed.
    //     try {
    //         await readAccount(pda.escrowWalletKey, provider);
    //         return assert.fail("Account should be closed");
    //     } catch (e) {
    //         assert.equal(e.message, "Cannot read properties of null (reading 'data')");
    //     }

    //     const state = await program.account.state.fetch(pda.stateKey);
    //     assert.equal(state.amountTokens.toString(), '20000000');
    //     assert.equal(state.stage.toString(), '3');

    // })

});