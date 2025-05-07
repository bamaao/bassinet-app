'use client';
import { useEffect, useRef, useState } from 'react';
import { CollectionType } from '@/types/collection';
import { fetchItems } from '@/services/CollectionService';
interface InfiniteScrollProps {
  initialItems: CollectionType[];
  initialPage: number;
  limit: number;
  totalItems: number;
  renderItem: (item: CollectionType) => React.ReactNode;
}

export default function InfiniteScroll({ 
  initialItems, 
  initialPage, 
  limit, 
  totalItems,
  renderItem
}: InfiniteScrollProps) {
  const [items, setItems] = useState<CollectionType[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalItems > initialItems.length);
  const [error, setError] = useState('');
  
  // The observer will be attached to this element
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / limit);
  // Fetch more items function
  const loadMoreItems = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const result = await fetchItems(nextPage, limit);
      
      if (result.error) {
        setError(result.error);
      } else if (result.items && result.items.length > 0) {
        setItems(prevItems => [...prevItems, ...result.items]);
        setPage(nextPage);
        
        // Check if we've reached the end
        if (nextPage >= totalPages || result.items.length < limit) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError('Failed to load more items. Please try again later.');
      console.error('Error in client component:', err);
    } finally {
      setLoading(false);
    }
  };
  // Setup the intersection observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(observerTarget.current);
    
    // Cleanup observer on unmount
    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);//hasMore, loading
  return (
    <div className="infinite-scroll-container w-full">
      {/* Error message if any */}
      {error && <p className="text-red-500 text-center my-4">{error}</p>}
      
      {/* Items list */}
      <div className="infinite-scroll-items">
        {items.map(item => renderItem(item))}
      </div>
      
      {/* Loading indicator and observer target */}
      <div 
        ref={observerTarget} 
        className="infinite-scroll-trigger h-20 flex items-center justify-center mt-8"
      >
        {loading && (
          <div className="loading-spinner animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        )}
      </div>
      
      {/* End message */}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-gray-500 my-4">You have reached the end</p>
      )}
    </div>
  );
}