'use client'

import { getAuthorization } from "@/app/lib/token";
import { BASE_URL } from "@/app/lib/utils/constants";
import Article from "@/components/ArticleCard";
import { CollectionType } from "@/types/collection";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { useWallet } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function LaunchingNftPage() {
    const params = useParams();
    const collection_id = params["slug"];
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [collectionInfo, setCollectionInfo] = useState<CollectionType>({} as CollectionType);
    const wallet = useWallet();

    function isStringNumber(str: string): boolean {
        const num = parseInt(str, 10);
        return !isNaN(num);
    }

    async function launch_nft() {
        if (collectionInfo == null) return
        if (!wallet.connected) return
        setErrorMessage("");
        const limitElement = document.getElementById("limit") as HTMLInputElement;
        const limit = limitElement.value;
        if (limit == null || limit.length == 0) {
            setErrorMessage("Limit must");
            return;
        }
        if (!isStringNumber(limit)) {
            setErrorMessage("Invalid Limit");
            return;
        }

        const rewardsQuantityElement = document.getElementById("rewards_quantity") as HTMLInputElement;
        const rewards_quantity = rewardsQuantityElement.value;
        if (rewards_quantity == null || rewards_quantity.length == 0) {
            setErrorMessage("Rewards Quantity must");
            return;
        }
        if (!isStringNumber(rewards_quantity)) {
            setErrorMessage("Invalid Rewards Quantity");
            return;
        }

        const mintingPriceElement = document.getElementById("minting_price") as HTMLInputElement;
        const minting_price = mintingPriceElement.value;
        if (minting_price == null || minting_price.length == 0) {
            setErrorMessage("Minting Price must");
            return;
        }
        if (!isStringNumber(minting_price)) {
            setErrorMessage("Invalid Minting Price");
            return;
        }

        console.log("collection_id:", collectionInfo.id);
        console.log("limit:", limit);
        console.log("limit", parseInt(limit, 10));

        const tx = new Transaction();
        const packageId = '0x84bc9a33e66a8e86b1d39a72cf1e7ef39ccc9ac18210b56ea52e29f123481ac9';
        const [payment_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(10000000)]);
        // tx.transferObjects([payment_coin], tx.pure.address(wallet_address));
        tx.moveCall({
            target: `${packageId}::launch_service::launch`,
            arguments:[
                tx.object('0x4af29b406b2e606490a797267fd2eadf9149704666bafa35a08fd308d4f20e25'),
                tx.object('0x93f6eb144998f48cd991171096001d0d94f8a1a2a02bb739c154435da477be1f'),
                tx.pure.string(collectionInfo.id),
                tx.pure.option('u64', parseInt(limit, 10)),
                tx.pure.u64(parseInt(rewards_quantity, 10)),
                tx.pure.u64(parseInt(minting_price, 10)),
                payment_coin
            ]
        });
        const wallet_address = "" + wallet.address;
        tx.transferObjects([payment_coin], wallet_address);
        tx.setGasBudget(500000000);
        const resData = await wallet.signAndExecuteTransaction({
            transaction: tx,
        });
        console.log('发行NFT返回:', resData);
    }

    const fetchData = async () => {
        const authorization = getAuthorization();
        const response = await fetch(BASE_URL + '/my_collections/' + collection_id, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json",
                "Authorization": authorization
            }
        });
        if (!response.ok) {
            setErrorMessage(`Error: ${response.status}`);
            return;
        }
        const data = await response.json();
        setErrorMessage(errorMessage == null ? "" : errorMessage);
        setCollectionInfo(data);
    }

    useEffect(()=>{
        fetchData();
    }, []);

    if (collectionInfo == null || collectionInfo.id == null || collectionInfo.id.length == 0) {
        return <></>
    }

    return <>
    <div className="m-auto container">
    <p className="text-red-500">{errorMessage}</p>
    <div className="flex flex-row items-center justify-center">
        <Image width={200} height={200} src={collectionInfo.icon_url} alt={''}/>
      </div>
    <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
        <div className="flex flex-col pb-3">
            <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">标题</dt>
            <dd className="text-lg font-semibold">{collectionInfo.title}</dd>
        </div>
        <div className="flex flex-col py-3">
            <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">简介</dt>
            <dd className="text-lg font-semibold">{collectionInfo.description}</dd>
        </div>
        <div className="flex flex-col pt-3">
            <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">创作于</dt>
            <dd className="text-lg font-semibold">{collectionInfo.created_time}</dd>
        </div>
    </dl>
    <div className="mb-5"></div>
    <div className="mb-6">
        <label htmlFor="limit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Limit</label>
        <input type="text" name="limit" id="limit" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="10000" required />
    </div>
    <div className="mb-6">
        <label htmlFor="rewards_quantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rewards Quantity, Bassinet Coin MIST</label>
        <input type="text" name="rewards_quantity" id="rewards_quantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="100000000" required />
    </div>
    <div className="mb-6">
        <label htmlFor="minting_price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Minting Price, SUI MIST</label>
        <input type="text" name="minting_price" id="minting_price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1000000" required />
    </div>
    <button onClick={launch_nft} className="h-12 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">发行</button>
    {collectionInfo && collectionInfo.articles && collectionInfo.articles.length > 0 ? (
        collectionInfo.articles.map((item) => (
            <div key={item.id} className="h-[310px]">
                <Article article={item} />
            </div>
            ))
    ): (
            <p>No items available</p>
        )
    }
    </div>
    </>
}