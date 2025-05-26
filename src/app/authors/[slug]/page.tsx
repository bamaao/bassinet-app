'use client'

import { getAuthorCollections } from '@/services/PublicCollectionService';
import {useEffect, useMemo, useState} from 'react';
import { CollectionType } from '@/types/collection';
import { useParams } from 'next/navigation';
import PublicCollection from '@/components/PublicCollectionCard';
import MyInfiniteScroll from '@/components/MyInfiniteScroll';
import { PAGE_SIZE } from '@/app/lib/utils/constants';

export default function AuthorCollectionsPage() {
    const params = useParams();
    const author_id = params["slug"];
    const [items, setItems] = useState<CollectionType[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState("");
    const collectionIds = useMemo(()=> new Set(), []);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const data = await getAuthorCollections(page, PAGE_SIZE, "" + author_id); // Fetch 2 items per page
            if (data.items.length === 0) {
                setHasMore(false); // No more items to load
            } else {
                const collectionDatas = data.items.filter(item => !collectionIds.has(item.id));
                collectionDatas.forEach(item => collectionIds.add(item.id));
                setItems([...items, ...collectionDatas]);
                setPage(page + 1);
            }
        } catch (error) {
            let errMsg;
            if (error instanceof Error) {
                errMsg = error.message;
            }else {
                errMsg = String(error);
            }
            // console.error('Error loading more items:', error);
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMore();
    }, []);

    return (
    <>
        <div className="post-list [counter-reset: post-index]">
        {items?.map((collection) => (
            <PublicCollection key={collection.id} collection={collection} />
        ))}
        </div>
        <div className="text-center text-slate-600 mt-5">
        {error && <p>Error: {error}</p>}
        {!loading && hasMore && <MyInfiniteScroll loadMore={loadMore} hasMore={hasMore} />}
        {!loading && !hasMore && <p className="text-slate-600">No more items to load.</p>}
        </div>
    </>
    );
}