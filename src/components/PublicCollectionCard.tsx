'use client';

import { CollectionType } from '@/types/collection';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from '@suiet/wallet-kit';
import Image from 'next/image';
interface CollectionProps {
  collection: CollectionType;
}
export default function PublicCollection({ collection }: CollectionProps) {
    const wallet = useWallet();

    async function minting_nft() {
      if (!wallet.connected) return

      const tx = new Transaction();
      const packageId = collection.nft.package_id;
      const [payment_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(10000000)]);
      // tx.transferObjects([payment_coin], tx.pure.address(wallet_address));
      tx.moveCall({
          target: `${packageId}::bassinet::mint`,
          arguments:[
              tx.object(collection.nft.mint_id),
              tx.object(collection.nft.coin_treasury_lock_id),
              payment_coin,
              tx.pure.string(collection.title),
          ]
      });
      const wallet_address = "" + wallet.address;
      tx.transferObjects([payment_coin], wallet_address);
      tx.setGasBudget(500000000);
      const resData = await wallet.signAndExecuteTransaction({
          transaction: tx,
      });
      console.log("Minting NFT返回:", resData);
  }

  if (collection == null)
    return <></>

  // 已发布的Nft
  if (collection.nft != null) {
    return <>
      <div className="m-auto min-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-center">
        <Image width={200} height={200} src={collection.icon_url} alt={''}/>
        <button onClick={minting_nft} className="h-12 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Minting</button>
      </div>
      <div className="p-5">
          <a href={"/collections/" + collection.id}>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{collection.title}</h5>
          </a>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{collection.created_time}</p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{collection.description}</p>
          <a href={"/collections/" + collection.id} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Read more
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
          </a>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Minting Price: {collection.nft.minting_price} MIST</p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Limit: {collection.nft.limit}</p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">First 20% Minting Rewards: {collection.nft.rewards_quantity} Bassinet Coin MIST</p>
      </div>
    </div>
    </>
  }
  return <>
    <div className="m-auto min-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-row items-center justify-center">
        <Image width={200} height={200} src={collection.icon_url} alt={''}/>
      </div>
      <div className="p-5">
          <a href={"/collections/" + collection.id}>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{collection.title}</h5>
          </a>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{collection.created_time}</p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{collection.description}</p>
          <a href={"/collections/" + collection.id} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Read more
              <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
          </a>
      </div>
    </div>
  </>
}