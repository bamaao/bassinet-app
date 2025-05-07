'use client'

import { Button } from "flowbite-react";
// import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getAuthorization } from "../lib/token";
import { BASE_URL } from "../lib/utils/url";

export default function CreateCollectionPage() {
    const [error, setError] = useState<string|null>(null);
    // const router = useRouter();

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const request_id_response = await fetch(BASE_URL + '/request_id');
        const request_id = await request_id_response.text();
        // console.log(request_id);
        try {
            const form = document.getElementById("createCollectionForm");
            if (form == null) {
                throw new Error("No form");
            }
            const formData = new FormData(form as HTMLFormElement);

            const authorization = getAuthorization();
            console.log("authorization:" + authorization);
            console.log("is_public:" + formData.get("is_public"));
            const is_public = formData.get("is_public") == null ? 0 : 1;
            
            // 创建专辑
            const parameters: object = {
                "request_id": request_id,
                "title": formData.get("collection_name"),
                "description": formData.get("description"),
                "is_public": is_public
            };
            console.log(JSON.stringify(parameters));
            const response = await fetch(BASE_URL + '/my_collections', {
                method: 'POST',
                body: JSON.stringify(parameters),
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json",
                    "Authorization": authorization
                }
            });
            if (!response.ok) {
                throw new Error("Failed to submit the data. Please try again");
            }
            const data = await response.text();
            console.log(data);
            const resetForm = form as HTMLFormElement;
            resetForm.reset();
            // router.push('/');
        }catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }else {
                setError("Unexpected error");
            }
        }
    }

    return <>
        <div className="m-auto w-5xl">
            {error && <div style={{color: 'red'}}>{error}</div>}
            <form id="createCollectionForm" onSubmit={onSubmit} >
                <div className="mb-6">
                    <label htmlFor="collection_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">专辑名称</label>
                    <input type="text" name="collection_name" id="collection_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="专辑名称" required />
                </div> 
                <div className="mb-6">
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">描述</label>
                    <input type="textarea" name="description" id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="描述" />
                </div> 
                <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                    <input id="is_public" name="is_public" type="checkbox" value="1" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="is_public" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">是否公开</label>
                </div>
                <Button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">创建</Button>
            </form>
        </div>
    </>
}