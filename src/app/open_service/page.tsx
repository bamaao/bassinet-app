'use client';
import React, { useState } from 'react';
import * as ed from '@noble/ed25519';
import {sha512} from '@noble/hashes/sha2';
import { BASE_URL } from '../lib/utils/url';
import { useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';
import { getAuthorization } from '../lib/token';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export default function BindingWalletPage() {
    const [errorMessage, setErrorMessage] = useState('');
    // const [isLoading, setIsLoading] = useState(false);
    const wallet = useWallet();
    let intervalId: number | undefined;
    let icon_url: string | null = null;

    async function getAccountInfo() {
        const authorization = getAuthorization();
        const account_response = await fetch(BASE_URL + '/account_info', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json",
                "Authorization": authorization
            }
        });
        if (!account_response.ok) {
            throw new Error("Invalid Account");
        }
        const account_info = await account_response.json();
        console.log(account_info);
        if (account_info.wallet_address != null) {
            localStorage.setItem("account_info", JSON.stringify(account_info));
            // setIsLoading(false);
            clearInterval(intervalId);
        }
    }

    async function handleOpeningServiceTransaction() {
        if (!wallet.connected) return
        setErrorMessage("");
        // if (errorMessage) {
        //     return;
        // }
        const symbolElement = document.getElementById("symbol") as HTMLInputElement;
        const symbol = symbolElement.value;
        if (symbol == null || symbol.length == 0) {
            setErrorMessage("Symbol must");
            return;
        }

        const nameElement = document.getElementById("name") as HTMLInputElement;
        const name = nameElement.value;
        if (name == null || name.length == 0) {
            setErrorMessage("Name must");
            return;
        }

        const descriptionElement = document.getElementById("description") as HTMLInputElement;
        const description = descriptionElement.value;
        if (description == null || description.length == 0) {
            setErrorMessage("Description must");
            return;
        }

        if (icon_url == null || icon_url.length == 0) {
            setErrorMessage("Please Upload Icon");
            return;
        }

        const tx = new Transaction();
        const packageId = '0x84bc9a33e66a8e86b1d39a72cf1e7ef39ccc9ac18210b56ea52e29f123481ac9';
        const [payment_coin] = tx.splitCoins(tx.gas, [tx.pure.u64(10000000)]);
        // tx.transferObjects([payment_coin], tx.pure.address(wallet_address));
        tx.moveCall({
            target: `${packageId}::digital_service::open_digital_service`,
            arguments:[
                tx.object('0x93f6eb144998f48cd991171096001d0d94f8a1a2a02bb739c154435da477be1f'), 
                tx.pure.string(symbol), 
                tx.pure.string(name), 
                tx.pure.string(description),
                tx.pure.string(icon_url),
                payment_coin
            ]
        });
        const wallet_address = "" + wallet.address;
        tx.transferObjects([payment_coin], wallet_address);
        tx.setGasBudget(500000000);
        const resData = await wallet.signAndExecuteTransaction({
            transaction: tx,
        });
        console.log('开通服务返回信息:', resData);
        localStorage.removeItem("account_info");
        intervalId = window.setInterval(getAccountInfo, 10000);
        setTimeout(() => {
            clearInterval(intervalId);
        }, 60000);
    }
        
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        const authorization = getAuthorization();
        console.log("authorization:" + authorization);
        const response = await fetch(BASE_URL + '/upload_icon', {
            method: 'post',
            body: formData,
            headers: {
                "Authorization": authorization
            }
        });

        if (!response.ok) {
            const error = await response.json();
            setErrorMessage(error.error);
            return;
        }
        const response_content = await response.json();
        console.log("返回内容:" + response_content);
        icon_url = response_content.url;
        console.log("icon_url:", icon_url);
    }

    return (
        <div style={{ padding:'20px', maxWidth:'800px', margin:'0 auto' }}>
        <h1 style={{marginBottom: '20px' }}>
            开通数字服务(Demo环境,请用英文填写)
        </h1>
        { errorMessage && <div style={{color:'red', marginBottom:'10px' }}>
            { errorMessage }</div> 
        }
        <div>
            <label htmlFor="symbol" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Symbol</label>
            <input type="text" id="symbol" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="bassinet" required />
        </div>
        <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
            <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Bassinet" required />
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="multiple_files">Upload icon file</label>
            <input onChange={handleFileUpload} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="multiple_files" type="file" multiple={false} />
        </div>
        <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
            <input type="text" id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Description" required />
        </div>  
        <button onClick={handleOpeningServiceTransaction} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Opening</button>
        </div>
    );
}