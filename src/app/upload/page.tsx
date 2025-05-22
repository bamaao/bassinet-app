'use client'
import React, { useState } from "react";
import { BASE_URL } from "../lib/utils/url";
import { getAuthorization } from "../lib/token";

export default function FileUpload() {
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        const authorization = getAuthorization();
        console.log("authorization:" + authorization);
        const response = await fetch(BASE_URL + '/upload', {
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
        setErrorMessage("");
    }
    // bg-blue-700
    return <>
        <div className="m-auto container">
            <p className="mt-2 text-sm text-red-600 dark:text-red-500"><span className="font-medium">{errorMessage}</span></p>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="multiple_files">Upload multiple files</label>
            <input onChange={handleFileUpload} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="multiple_files" type="file" multiple={false} />
        </div>
        </>
}