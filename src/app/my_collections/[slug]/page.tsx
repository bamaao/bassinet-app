'use client'

import { getAuthorization } from "@/app/lib/token";
import { BASE_URL } from "@/app/lib/utils/constants";
import { CollectionType } from "@/types/collection";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from 'next/image';
import CollectionItemCard from "@/components/CollectionItemCard";
import moment from "moment";

export default function CollectionInfoPage() {
    const params = useParams();
    const collection_id = params["slug"];
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [collectionInfo, setCollectionInfo] = useState<CollectionType>({} as CollectionType);

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
                <dd className="text-lg font-semibold">{moment.unix(Number(collectionInfo.created_time)).format('YYYY-MM-DD HH:mm:ss')}</dd>
            </div>
        </dl>
        <div className="mb-5"></div>
        {collectionInfo && collectionInfo.items && collectionInfo.items.length > 0 ? (
            collectionInfo.items.map((item) => (
                <div key={item.id} className="h-[310px]">
                    <CollectionItemCard item={item} />
                </div>
                ))
        ): (
                <p>No items available</p>
            )
        }
    </div>
    </>
}