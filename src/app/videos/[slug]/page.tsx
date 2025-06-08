'use client'

import { BASE_URL } from "@/app/lib/utils/constants";
import React from "react";
import { useParams } from "next/navigation";
import Player from 'next-video/player';
import { useEffect, useState } from "react";
import { CollectionItem } from "@/types/collection";
import { getAuthorization } from "@/app/lib/token";
export default function VideoPage() {
    const params = useParams();
    const video_id = params["slug"];
    console.log(video_id);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [collectionItem, setCollectionItem] = useState<CollectionItem>({} as CollectionItem);

    const fetchData = async () => {
        const authorization = getAuthorization();
        const response = await fetch(BASE_URL + '/videos/' + video_id, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json",
                "Authorization": authorization
            }
        });
        if (!response.ok) {
            setErrorMessage(`Error: ${response.text}`);
            return;
        }
        const data = await response.json();
        setErrorMessage(errorMessage == null ? "" : errorMessage);
        setCollectionItem(data);
    }

    useEffect(()=>{
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <>
    <div className="m-auto container">
        <p className="text-red-500">{errorMessage}</p>
        <p className="text-3xl font-semibold">{collectionItem.title}</p>
        <p className="mb-1 text-gray-500 md:text-xl dark:text-gray-400">{collectionItem.description}</p>
        <Player src={collectionItem.url_path} />
    </div>
    </>
}