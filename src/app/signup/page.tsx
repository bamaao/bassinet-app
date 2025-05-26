'use client'

import { useGlobal } from "@/components/context/GlobalProvider";
import { useRouter } from 'next/navigation';
import { Button } from "flowbite-react";
import * as ed from '@noble/ed25519';
import { FormEvent, useState } from "react";
import {saveAs} from 'file-saver';
// import localforage from 'localforage';
import {sha512} from '@noble/hashes/sha2';
import { keystore } from "../lib/account";
import { BASE_URL } from "../lib/utils/constants";
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export default function SignUpPage() {
    const [error, setError] = useState<string|null>(null);
    const router = useRouter();
    const {isLogin, setIsLogin} = useGlobal();

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const request_id_response = await fetch(BASE_URL + '/request_id');
        const request_id = await request_id_response.text();
        console.log(request_id);
        try {
            const form = document.getElementById("signupForm");
            if (form == null) {
                throw new Error("No form");
            }
            const formData = new FormData(form as HTMLFormElement);

            // 生成keystore
            const password = formData.get("password");
            if (password == null) {
                throw new Error("Password must");
            }
            const newPrivateKey = ed.utils.randomPrivateKey();
            const privateKeyStr = ed.etc.bytesToHex(newPrivateKey);
            const keystoreObj = keystore('' + password, privateKeyStr);
            const keystoreStr = JSON.stringify(keystoreObj);
            console.log(keystoreStr);
            // 保存keystore
            const blob = new Blob([keystoreStr], {
                type: "text/plain;charset=utf-8"
            });
            const pubKey = ed.getPublicKey(newPrivateKey);
            const pubKeyStr = ed.etc.bytesToHex(pubKey);
            
            // 提交注册
            const signature = ed.sign(Buffer.from(request_id, 'utf-8').toString('hex'), newPrivateKey);
            const parameters: object = {
                "nick_name": formData.get("nickName"),
                "pub_key": pubKeyStr,
                "request_id": request_id,
                "sig": ed.etc.bytesToHex(signature)
            };
            const response = await fetch(BASE_URL + '/signup', {
                method: 'POST',
                body: JSON.stringify(parameters),
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error("Failed to submit the data. Please try again");
            }
            const data = await response.json();
            console.log(data);
            const token = data.token_type + ' ' + data.access_token;
            // localforage.setItem<string>("access_token", token);
            localStorage.setItem("access_token", token);
            // const payload = getPayloadFrom(data.access_token);
            // console.log(JSON.stringify(payload));
            //保存钱包信息
            saveAs(blob, pubKeyStr + ".txt");
            setIsLogin(true);
            // router.push('/');
        }catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }else {
                setError("Unexpected error");
            }
        }
    }

    if (isLogin) {
        setTimeout(() => {
            router.push('/');
        }, 1000);
    }

    return <>
        <div className="m-auto w-5xl">
            {error && <div style={{color: 'red'}}>{error}</div>}
            <form id="signupForm" onSubmit={onSubmit} >
                <div className="mb-6">
                    <label htmlFor="nickName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nickname</label>
                    <input type="text" name="nickName" id="nickName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="bassinet" required />
                </div> 
                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="•••••••••" required />
                </div> 
                {/* <div className="mb-6">
                    <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                    <input type="password" name="confirm_password" id="confirm_password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="•••••••••" required />
                </div> */}
                <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                    <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</a>.</label>
                </div>
                <Button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create your account</Button>
            </form>
        </div>
    </>
}