'use client'

import { fetchItems } from '@/services/CollectionService';
import InfiniteScroll from '@/components/InfiniteScroll';
import Collection from '@/components/CollectionCard'; // Your item rendering component
import {use, useEffect, useState} from 'react';
import { CollectionType, PageInfoType } from '@/types/collection';

type Props = {
    searchParams: Promise<{ [key: string]: string}>;
  };

const DEFAULT_LIMIT = 100;
export default function HomePage({searchParams}:Props) {
    const  currSearchParams = use(searchParams) ;
    const search_page = currSearchParams.page;
    const search_limit = currSearchParams.limit;
    const page = parseInt(search_page || '1');
    const page_size = parseInt(search_limit || String(DEFAULT_LIMIT));

    const [items, setItems] = useState<CollectionType[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [pageInfo, setPageInfo] = useState<PageInfoType>({} as PageInfoType);

    const fetchData = async () => {
        const { items, error: errorMessage, pageInfo} = await fetchItems(page, page_size);
        // console.log("length:" + items.length);
        setItems(items);
        setErrorMessage(errorMessage == null ? "" : errorMessage);
        setPageInfo(pageInfo);
    }

    useEffect(()=>{
        fetchData();
    }, [])
    return (
        <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Collection Catalog</h1>
        
        {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
        ) : items && items.length > 0 ? (
            <div className="mb-36 w-full">
            <InfiniteScroll 
                initialItems={items}
                initialPage={page}
                limit={page_size}
                totalItems={pageInfo.totalItems}
                renderItem={(item) => (
                <div key={item.id} className="h-full">
                    <Collection collection={item} />
                </div>
                )}
            />
            </div>
        ) : (
            <p>No items available</p>
        )}
        </main>
    );
}