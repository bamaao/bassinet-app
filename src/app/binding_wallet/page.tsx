'use client';
import React, { useState } from 'react';
import * as ed from '@noble/ed25519';
import {sha512} from '@noble/hashes/sha2';
import localforage from 'localforage';
import { privateKeyDecrypt, pubKey } from '../lib/account';
import { BASE_URL } from '../lib/utils/constants';
import { useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';
import { getAuthorization } from '../lib/token';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export default function BindingWalletPage() {
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const wallet = useWallet();
    let intervalId: number | undefined;

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
            setIsLoading(false);
            clearInterval(intervalId);
        }
    }

    async function handleBindingWalletTransaction() {
        if (!wallet.connected) return
        if (errorMessage) {
            return;
        }
        // 获取密码
        const inputElement = document.getElementById("password") as HTMLInputElement;
        const password = inputElement.value;
        if (password == null || password.length == 0) {
            setErrorMessage("Password must");
            return;
        }
        setIsLoading(true);

        // 解析文件，验证密码是否正确
        const account = await localforage.getItem<string>("bassinet_account");
        if (account == null){
            setErrorMessage('Invalid Account.');
            setIsLoading(false);
            return;
        }
        const store = JSON.parse(account);

        const request_id_response = await fetch(BASE_URL + '/request_id');
        const message = await request_id_response.text();
        const privateKeyStr = privateKeyDecrypt(store, password);
        const signature = ed.sign(Buffer.from(message, 'utf-8').toString('hex'), ed.etc.hexToBytes(privateKeyStr));
        const pubkey = pubKey(privateKeyStr);
        console.log("pubkey:", pubkey);
        const sign = ed.etc.bytesToHex(signature);
        console.log("signature:", sign);
        const msg = Buffer.from(message, 'utf-8').toString('hex');
        console.log("msg:", msg);
        const tx = new Transaction();
        const packageId = '0x84bc9a33e66a8e86b1d39a72cf1e7ef39ccc9ac18210b56ea52e29f123481ac9';
        tx.moveCall({
            target: `${packageId}::digital_service::bind_account`,
            arguments:[tx.object('0x93f6eb144998f48cd991171096001d0d94f8a1a2a02bb739c154435da477be1f'), tx.pure.string(sign), tx.pure.string(pubkey), tx.pure.string(msg)]
        })
        const resData = await wallet.signAndExecuteTransaction({
            transaction: tx,
        });
        console.log('绑定钱包返回信息:', resData);
        localStorage.removeItem("account_info");
        intervalId = window.setInterval(getAccountInfo, 10000);
        setTimeout(() => {
            clearInterval(intervalId);
        }, 60000);
    }
        
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file_target_files = event.target.files;
        if (file_target_files == null) {
            setErrorMessage('Please select a file.');
            return;
        }
        const file = file_target_files[0];
        if (!file) {
            setErrorMessage('Please select a file.');
            return;
        }
        if (!file.name.endsWith('.txt')) {
            setErrorMessage('Please upload a TXT file.');
            return;
        }
        setIsLoading(true);
        const reader = new FileReader();
        // onload事件回调
        reader.onload = async (e) => {
            const target = e.target;
            if (target == null) {
                throw new Error("File is null.");
            }
            const text  = target.result as string;
            if (text == null) {
                throw new Error("File is null.");
            }
            console.log("content:" + text);
            // localforage
            localforage.setItem("bassinet_account", text);
            setErrorMessage('');
            setIsLoading(false);
        };
        reader.readAsText(file);
    }

    return (
        <div style={{ padding:'20px', maxWidth:'800px', margin:'0 auto' }}>
        <h1 style={{marginBottom: '20px' }}>
            Private key login
        </h1>
        <div>
        <input type="file" onChange={(event)=>handleFileUpload(event)} 
                accept=".txt" style={{ marginBottom: '10px' }} 
        />
        { errorMessage && <div style={{color:'red', marginBottom:'10px' }}>
            { errorMessage }</div> 
        }
        { isLoading && 
            <div style={{ textAlign:'center', marginTop:'20px' }}>
                Loading...
            </div>
        }
        </div>
        <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="•••••••••" required />
        </div>
        <button onClick={handleBindingWalletTransaction} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Binding Wallet</button>
        </div>
    );
}