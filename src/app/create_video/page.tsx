'use client'

import { Button } from "flowbite-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import SparkMd5 from 'spark-md5';
import { getAuthorization, isValidAuthorization } from "../lib/token";
import { BASE_URL } from "../lib/utils/constants";

interface ChunkListDTO {
    file_hash: string,
    chunk_number: number,
    chunk_size: number,
    file_name: string,
    total_chunks: number
}

interface CollectionSimple {
    id: string,
    title: string
}

export default function CreateVideoPage() {
    const [error, setError] = useState<string|null>(null);
    const router = useRouter();
    let video_path: string | null = null;
    let file_hash: string | null = null;
    // const [uploadChunks, setUploadChunks] = useState<number[]>([]);
    const [collections, setCollections] = useState<Array<CollectionSimple>>(new Array<CollectionSimple>());

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

        if (video_path == null || video_path.length == 0 || file_hash == null || file_hash.length != 32) {
            setError("请上传视频文件");
            return;
        }

        const request_id_response = await fetch(BASE_URL + '/request_id');
        const request_id = await request_id_response.text();
        // console.log(request_id);
        try {
            const form = document.getElementById("createVideoForm");
            if (form == null) {
                throw new Error("No form");
            }
            const formData = new FormData(form as HTMLFormElement);

            const authorization = getAuthorization();
            console.log("authorization:" + authorization);
            console.log("is_public:" + formData.get("is_public"));
            const is_public = formData.get("is_public") == null ? 0 : 1;
            
            // 创建视频
            const parameters: object = {
                "request_id": request_id,
                "title": formData.get("name"),
                "description": formData.get("description"),
                "is_public": is_public,
                "video_path": video_path,
                "collection_id": formData.get("collection_id"),
                "file_hash": file_hash,
            };
            console.log(JSON.stringify(parameters));
            const response = await fetch(BASE_URL + '/videos', {
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

    const checkFile = async(md5: string) => {
        const authorization = getAuthorization();
        console.log("authorization:" + authorization);
        const parameters: object = {
            "file_hash": md5
        };
        const response = await fetch(BASE_URL + '/check_chunks', {
            method: 'POST',
            body: JSON.stringify(parameters),
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json",
                "Authorization": authorization
            }
        });
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        const chunks = data as ChunkListDTO[];
        if (chunks.length == 0) {
            return [];
        }
        const allChunkStatusList = new Array(Number(chunks[0].total_chunks)).fill(0);
        const chunkNumberArr = chunks.map(item => item.chunk_number);
        chunkNumberArr.forEach((item) => {
            allChunkStatusList[item] = 1;
        });
        return allChunkStatusList;
    }

    // 获取文件md5
    const getFileMd5 = async(file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                if (e.target && e.target.result instanceof ArrayBuffer) {
                    resolve(SparkMd5.ArrayBuffer.hash(e.target.result));
                }else {
                    reject('读取文件失败')
                }
            }
            fileReader.onerror = () => {
                reject('读取文件失败')
            }
            fileReader.readAsArrayBuffer(file);
        });
    }

    // 合并文件
    const mergeFile = async(md5: string) => {
        const authorization = getAuthorization();
        console.log("authorization:" + authorization);
        const parameters: object = {
            "file_hash": md5
        };
        const response = await fetch(BASE_URL + '/merge_chunks', {
            method: 'POST',
            body: JSON.stringify(parameters),
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json",
                "Authorization": authorization
            }
        });
        if (!response.ok) {
            const error = await response.json();
            setError(error.error);
            return;
        }
        video_path = await response.text();
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        const md5 = await getFileMd5(file);
        file_hash = md5;

        const chunkSize = 1024 * 1024;
        const chunks = [];
        let startPos = 0;
        while (startPos < file.size) {
            chunks.push(file.slice(startPos, startPos + chunkSize));
            startPos += chunkSize;
        }

        // 检查文件是否已存在或部分上传
        const uploadChunks = await checkFile(md5);
        // 获取已上传的块信息，用于实现断点续传
        //创建上传任务列表，仅上传未完成的块
        const tasks = chunks.map(async (chunk, index) => {
            if (uploadChunks.length > index && uploadChunks[index] != 0) {
                return;
            }
            const formData = new FormData();
            formData.set("fileName", file.name);
            formData.set("totalChunks", "" + chunks.length);
            formData.set("chunkNumber", "" + index);
            formData.set("chunkSize", "1048576");
            formData.set("md5", md5);
            formData.append("chunk", chunk);
            const authorization = getAuthorization();
            // console.log("authorization:" + authorization);
            const response = await fetch(BASE_URL + '/upload_media_chunks', {
                method: 'POST',
                body: formData,
                headers: {
                    "Authorization": authorization
                }
            });

            if (!response.ok) {
                const error = await response.json();
                setError(error.error);
                return;
            }
        });
        //并发执行所有上传任务
        await Promise.all(tasks);

        //请求合并所有的块
        await mergeFile(md5);
    }

    return <>
        <div className="m-auto w-5xl">
            {error && <div style={{color: 'red'}}>{error}</div>}
            <form id="createVideoForm" onSubmit={onSubmit} >
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
                <div className="mb-6">
                    <label htmlFor="collection_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">视频名称</label>
                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="专辑名称" required />
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
                <div className="flex items-start mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="multiple_files">Upload media file</label>
                    <input onChange={handleFileUpload} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="multiple_files" type="file" multiple={false} />
                </div>

                <Button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">创建</Button>
            </form>
        </div>
    </>
}
