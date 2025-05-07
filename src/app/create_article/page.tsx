'use client'

import '@mdxeditor/editor/style.css';

import { Button } from "flowbite-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getAuthorization, isValidAuthorization } from "../lib/token";
import { BASE_URL } from "../lib/utils/url";
import { ALL_PLUGINS } from '@/components/plugins';

import { ForwardRefEditor  } from '@/components/ForwardRefEditor';

export default function CreateArticlePage() {
    const [error, setError] = useState<string|null>(null);
    const [markdown, setMarkdown] = useState<string>("请开始你的表演");
    const [collections, setCollections] = useState<Array<CollectionSimple>>(new Array<CollectionSimple>());

    interface CollectionSimple {
        id: string,
        title: string
    }
    const router = useRouter();

    const fetchData = async () => {
        if (!isValidAuthorization()) {
            router.push('/');
            return;
        }
        try {
            const authorization = getAuthorization();
            const response = await fetch(BASE_URL + '/simple_collections', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json",
                    "Authorization": authorization
                }
            });
            const data = await response.json();
            setCollections(data.collections);
        } catch(error) {
            setError("Error fetching data:" + error);
        }
    }

    useEffect(()=>{
        fetchData();
    }, []);// Empty dependency array ensures the effect runs once on mount

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        try {
            const form = document.getElementById("createArticleForm");
            if (form == null) {
                throw new Error("No form");
            }
            const formData = new FormData(form as HTMLFormElement);

            if (!isValidAuthorization()) {
                router.push('/');
                return;
            }
            const authorization = getAuthorization();
            
            console.log("authorization:" + authorization);
            // console.log("is_public:" + formData.get("is_public"));
            // const is_public = formData.get("is_public") == null ? 0 : 1;

            const request_id_response = await fetch(BASE_URL + '/request_id');
            const request_id = await request_id_response.text();
            // console.log(request_id);
            
            // 创建文章
            const parameters: object = {
                "request_id": request_id,
                "title": formData.get("article_name"),
                "description": formData.get("description"),
                "collection_id": formData.get("collection_id"),
                "content": markdown,
                "content_type": "markdown",
                // "is_public": is_public
            };
            console.log(JSON.stringify(parameters));
            const response = await fetch(BASE_URL + '/articles', {
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
            setMarkdown("请开始你的表演");
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
            <form id="createArticleForm" onSubmit={onSubmit} >
                <div className="mb-6">
                    <label htmlFor="article_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">标题</label>
                    <input type="text" name="article_name" id="article_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="标题" required />
                </div> 
                <div className="mb-6">
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">描述</label>
                    <input type="textarea" name="description" id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="描述" />
                </div> 
                {/* <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                    <input id="is_public" name="is_public" type="checkbox" value="1" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="is_public" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">是否公开</label>
                </div> */}
                <div className='mb-6'>
                    <label htmlFor="collection_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">所属专辑</label>
                    <select id="collection_id" name='collection_id' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" defaultValue={collections.length == 0 ? "" : collections[0].id}>
                        {/* <option selected>选择一个专辑</option> */}
                        {collections.map(item => {
                            return (
                                <option key={item.id} value={item.id}>{item.title}</option>
                            )
                        }
                        )}
                        {/* <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option> */}
                    </select>
                </div>
                <div className="container border bg-gray-50">
                     {/* <MDXEditor
                        className='min-h-96'
                        markdown={markdown}
                        onChange={(md) => {
                            console.log('change', { md });
                            setMarkdown(md);
                        }}
                        // plugins={(() => {
                        //     ALL_PLUGINS.push(diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }));
                        //     return ALL_PLUGINS;
                        // })()}
                        plugins={ALL_PLUGINS}
                    /> */}
                        <ForwardRefEditor
                            className='min-h-96'
                            markdown={markdown}
                            onChange={(md) => {
                                // console.log('change', { md });
                                setMarkdown(md);
                            } }
                            // plugins={(() => {
                            //     ALL_PLUGINS.push(diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }));
                            //     return ALL_PLUGINS;
                            // })()}
                            plugins={ALL_PLUGINS}
                        />
                </div>
                <div className='min-h-10'></div>
                <Button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">创建</Button>
            </form>
        </div>

    </>

}
