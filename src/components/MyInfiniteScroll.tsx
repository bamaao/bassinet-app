import React from 'react';
import { useInView } from 'react-intersection-observer';
const InfiniteScroll = ({ loadMore, hasMore}:{loadMore: ()=>void, hasMore: boolean}) => {

    const [ref, inView] = useInView({
        triggerOnce: true,
    });

    React.useEffect(() => {
        if (inView && hasMore) {
            loadMore();
        }
    }, [inView, hasMore, loadMore]);

    return <div ref={ref} />;
};

export default InfiniteScroll;