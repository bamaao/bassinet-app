'use client'

import { getAuthorCollections } from '@/services/PublicCollectionService';
import InfiniteScroll from '@/components/InfiniteScroll';
import {use, useEffect, useState} from 'react';
import { CollectionType, PageInfoType } from '@/types/collection';
import { useParams } from 'next/navigation';
import PublicCollection from '@/components/PublicCollectionCard';

type Props = {
    searchParams: Promise<{ [key: string]: string}>;
  };

const DEFAULT_LIMIT = 100;
export default function AuthorPage({searchParams}:Props) {
    const params = useParams();
    const author_id = params["slug"];
    const  currSearchParams = use(searchParams) ;
    const search_page = currSearchParams.page;
    const search_limit = currSearchParams.limit;
    const page = parseInt(search_page || '1');
    const page_size = parseInt(search_limit || String(DEFAULT_LIMIT));

    const [items, setItems] = useState<CollectionType[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [pageInfo, setPageInfo] = useState<PageInfoType>({} as PageInfoType);

    const fetchData = async () => {
        const { items, error: errorMessage, pageInfo} = await getAuthorCollections(1, 1000, "" + author_id);
        // console.log("length:" + items.length);
        setItems(items);
        setErrorMessage(errorMessage == null ? "" : errorMessage);
        setPageInfo(pageInfo);
    }

    useEffect(()=>{
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Collection Catalog</h1>
        
        {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
        ) : items && items.length > 0 ? (
            <div className="mb-48 w-full">
            <InfiniteScroll 
                initialItems={items}
                initialPage={page}
                limit={page_size}
                totalItems={pageInfo.totalItems}
                renderItem={(item) => (
                <div key={item.id} className="h-full">
                    <PublicCollection collection={item} />
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