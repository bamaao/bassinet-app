'use client'
import React from "react";

export default function FileUpload() {
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const files = event.target.files;
        const formData = new FormData();
        for (const file of Array.from(files)) {
            formData.append('files', file);
        }
        // formData.append("file", file);
        const response = await fetch('http://192.168.0.102:6142/upload', {
            method: 'post',
            body: formData,
            // headers: {
            //     'Content-Type': file.type
            // }
        });

        console.log("response:" + response);

        // if (!response.ok) {
        //     // setMesssage('Network response was not ok');
        //     throw new Error('Network response was not ok');
        // }

        // const response_content = await response.text();
        // console.log("返回内容:" + response_content);
    }
    // bg-blue-700
    return <>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="multiple_files">Upload multiple files</label>
        <input onChange={handleFileUpload} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="multiple_files" type="file" multiple={true} />
        </>
}