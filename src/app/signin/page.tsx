'use client';
import React, { useState } from 'react';
import * as ed from '@noble/ed25519';
import {sha512} from '@noble/hashes/sha2';
import localforage from 'localforage';
import { privateKeyDecrypt } from '../lib/account';
import { useGlobal } from '@/components/context/GlobalProvider';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '../lib/utils/url';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export default function SignInPage() {
    // const [textData, setTextData] = useState<string>();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const {isLogin, setIsLogin} = useGlobal();
    
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

    const signin = async() => {
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
        const request_id = await request_id_response.text();
        // console.log(request_id);
        const privateKeyStr = privateKeyDecrypt(store, password);
        const signature = ed.sign(Buffer.from(request_id, 'utf-8').toString('hex'), ed.etc.hexToBytes(privateKeyStr));
        // 登录
        const parameters: object = {
            "pub_key": store.pubkey,
            "request_id": request_id,
            "sig": ed.etc.bytesToHex(signature)
        };
        const response = await fetch(BASE_URL + '/signin', {
            method: 'POST',
            body: JSON.stringify(parameters),
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
           setErrorMessage("Failed to sign in. Please try again");
           setIsLoading(false);
           return;
        }
        const data = await response.json();
        // console.log(data);
        setIsLoading(false);
        const token = data.token_type + ' ' + data.access_token;
        // localforage.setItem<string>("access_token", token);
        localStorage.setItem("access_token", token);
        setIsLogin(true);
    }

    if (isLogin) {
        setTimeout(() => {
            router.push('/');
        }, 1000);
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
        <button onClick={signin} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign In</button>
        </div>
    );
}