"use client"; // In Next.js, this is required to prevent the component from being rendered on the server.

import Image from "next/image";
import {
  addressEllipsis,
  ConnectButton,
  ErrorCode,
  formatSUI,
  SuiChainId,
  useAccountBalance,
//   useChain,
  useSuiClient,
  useWallet,
} from "@suiet/wallet-kit";
import { useMemo } from "react";
import { Transaction } from "@mysten/sui/transactions";
// 问题是找不到 "@mysten/wallet-standard" 模块或其类型声明，需要安装该模块
// 可以在项目根目录下执行以下命令进行安装
// npm install @mysten/wallet-standard
// 或者
// yarn add @mysten/wallet-standard
// 安装完成后，此导入语句应该可以正常工作
import { SuiSignAndExecuteTransactionOutput } from "@mysten/wallet-standard";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { Buffer } from "buffer";

const sampleNft = new Map([
  [
    "sui:devnet",
    "0xe146dbd6d33d7227700328a9421c58ed34546f998acdc42a1d05b4818b49faa2::nft::mint",
  ],
  [
    "sui:testnet",
    "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
  ],
  [
    "sui:mainnet",
    "0x5b45da03d42b064f5e051741b6fed3b29eb817c7923b83b92f37a1d2abf4fbab::nft::mint",
  ],
]);

export default function Home() {
  const wallet = useWallet();
  const suiClient = useSuiClient();

  const { balance } = useAccountBalance();
  const nftContractAddr = useMemo(() => {
    if (!wallet.chain) return "";
    return sampleNft.get(wallet.chain.id) ?? "";
  }, [wallet]);
//   const chain = useChain(SuiChainId.MAIN_NET);

//   function uint8arrayToHex(value: Uint8Array | undefined) {
//     if (!value) return "";
//     // @ts-ignore
//     return value.toString("hex");
//   }

  async function handleExecuteMoveCall(target: string | undefined) {
    if (!target) return;

    try {
      const tx = new Transaction();
      tx.moveCall({
        // 移除 `as any` 类型断言，假设 `target` 是 `string` 类型
        target: target,
        arguments: [
          tx.pure.string("Suiet NFT"),
          tx.pure.string("Suiet Sample NFT"),
          tx.pure.string(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });
      // const resData = await wallet.signAndExecuteTransactionBlock({
      //   transactionBlock: tx,
      //   options: {
      //     showObjectChanges: true,
      //   },
      // });

      const resData = await wallet.signAndExecuteTransaction<
        SuiSignAndExecuteTransactionOutput & SuiTransactionBlockResponse
      >(
        {
          transaction: tx,
        },
        {
          execute: ({ bytes, signature }) => {
            return suiClient.executeTransactionBlock({
              transactionBlock: bytes,
              signature,
              options: {
                showRawEffects: true,
                showObjectChanges: true,
              },
            });
          },
        }
      );
      console.log("executeMoveCall success", resData);
      alert("executeMoveCall succeeded (see response in the console)");
    } catch (e) {
      console.error("executeMoveCall failed", e);
      alert("executeMoveCall failed (see response in the console)");
    }
  }

  async function handleSignMsg() {
    if (!wallet.account) return;
    try {
      const msg = "Hello world!";
      const msgBytes = new TextEncoder().encode(msg);
      const result = await wallet.signPersonalMessage({
        message: msgBytes,
      });
      console.log("signMessage reslt:", result);
      const verifyResult = await wallet.verifySignedMessage(
        result,
        // 由于 `wallet.account.publicKey` 是 `ReadonlyUint8Array` 类型，而需要的是 `Uint8Array` 类型，
        // 可以通过创建一个新的 `Uint8Array` 实例来解决类型不匹配问题。
        new Uint8Array(wallet.account.publicKey)
      );
      console.log("verify signedMessage", verifyResult);
      if (!verifyResult) {
        alert(`signMessage succeed, but verify signedMessage failed`);
      } else {
        alert(`signMessage succeed, and verify signedMessage succeed!`);
      }
    } catch (e) {
      console.error("signMessage failed", e);
      alert("signMessage failed (see response in the console)");
    }
  }

  const handleSignTxnAndVerifySignature = async (contractAddress: string) => {
    const txn = new Transaction();
    txn.moveCall({
      // 移除 `as any` 类型断言，直接使用 `contractAddress`，假设 `contractAddress` 是 `string` 类型
      target: contractAddress,
      arguments: [
        txn.pure.string("Suiet NFT"),
        txn.pure.string("Suiet Sample NFT"),
        txn.pure.string(
          "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
        ),
      ],
    });
    txn.setSender(wallet.account?.address as string);

    try {
      const signedTxn = await wallet.signTransaction({
        transaction: txn,
      });

      console.log(`Sign and verify txn:`);
      console.log("--wallet: ", wallet.adapter?.name);
      console.log("--account: ", wallet.account?.address);
      const publicKey = wallet.account?.publicKey;
      if (!publicKey) {
        console.error("no public key provided by wallet");
        return;
      }
      console.log("-- publicKey: ", publicKey);
      const pubKey = new Ed25519PublicKey(publicKey);
      console.log("-- signed txnBytes: ", signedTxn.bytes);
      console.log("-- signed signature: ", signedTxn.signature);
      const txnBytes = new Uint8Array(Buffer.from(signedTxn.bytes, "base64"));
      const isValid = await pubKey.verifyTransaction(txnBytes, signedTxn.signature);
      console.log("-- use pubKey to verify transaction: ", isValid);
      if (!isValid) {
        alert(`signTransaction succeed, but verify transaction failed`);
      } else {
        alert(`signTransaction succeed, and verify transaction succeed!`);
      }
    } catch (e) {
      console.error("signTransaction failed", e);
      alert("signTransaction failed (see response in the console)");
    }
  };

  const chainName = (chainId: string | undefined) => {
    switch (chainId) {
      case SuiChainId.MAIN_NET:
        return "Mainnet";
      case SuiChainId.TEST_NET:
        return "Testnet";
      case SuiChainId.DEV_NET:
        return "Devnet";
      default:
        return "Unknown";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative flex flex-col place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="logo relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert mb-8"
          src="/suiet-logo.svg"
          alt="Suiet Logo"
          width={180}
          height={37}
          priority
          onClick={() => {
            window.open("https://github.com/suiet/wallet-kit", "_blank");
          }}
        />

        <ConnectButton
          onConnectError={(error) => {
            if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
              console.warn(
                "user rejected the connection to " + error.details?.wallet
              );
            } else {
              console.warn("unknown connect error: ", error);
            }
          }}
        />

        {!wallet.connected ? (
          <p className={"my-8"}>Connect DApp with Suiet wallet from now!</p>
        ) : (
          <div className={"my-8"}>
            <div>
              <p>current wallet: {wallet.adapter?.name}</p>
              <p>
                wallet status:{" "}
                {wallet.connecting
                  ? "connecting"
                  : wallet.connected
                  ? "connected"
                  : "disconnected"}
              </p>
              <p>
                wallet address: {addressEllipsis(wallet.account?.address ?? "")}
              </p>
              <p>current network: {wallet.chain?.name}</p>
              <p>
                wallet balance:{" "}
                {formatSUI(balance ?? 0, {
                  withAbbr: false,
                })}{" "}
                SUI
              </p>
            </div>
            <div className={"flex flex-col my-8"}>
              {nftContractAddr && (
                <button type="button" onClick={() => handleExecuteMoveCall(nftContractAddr)} className="justify-center items-center w-44 py-2 px-4 inline-flex bg-blue-500 text-white transition ease-in duration-200 text-center text-2xl font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full">
                <svg width="20" height="30" className="w-4 mr-2" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h427q21 56 70.5 92t110.5 36h256q61 0 110.5-36t70.5-92h427q40 0 68 28t28 68zm-325-648q-17 40-59 40h-256v448q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-448h-256q-42 0-59-40-17-39 14-69l448-448q18-19 45-19t45 19l448 448q31 30 14 69z">
                    </path>
                </svg>
                <span>Mint {chainName(wallet.chain?.id)} NFT</span>
              </button>
              )}
              <button type="button" onClick={handleSignMsg} className="justify-center items-center w-44 py-2 px-4 inline-flex bg-blue-500 text-white transition ease-in duration-200 text-center text-2xl font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full">
                <svg width="20" height="30" className="w-4 mr-2" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h427q21 56 70.5 92t110.5 36h256q61 0 110.5-36t70.5-92h427q40 0 68 28t28 68zm-325-648q-17 40-59 40h-256v448q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-448h-256q-42 0-59-40-17-39 14-69l448-448q18-19 45-19t45 19l448 448q31 30 14 69z">
                    </path>
                </svg>
                <span>signMessage</span>
              </button>
              {nftContractAddr && (
                <button type="button" onClick={() => handleSignTxnAndVerifySignature(nftContractAddr)} className="justify-center items-center w-44 py-2 px-4 inline-flex bg-blue-500 text-white transition ease-in duration-200 text-center text-2xl font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full">
                <svg width="20" height="30" className="w-4 mr-2" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h427q21 56 70.5 92t110.5 36h256q61 0 110.5-36t70.5-92h427q40 0 68 28t28 68zm-325-648q-17 40-59 40h-256v448q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-448h-256q-42 0-59-40-17-39 14-69l448-448q18-19 45-19t45 19l448 448q31 30 14 69z">
                    </path>
                </svg>
                <span>Sign & Verify Transaction</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div></div>
    </main>
  );
}