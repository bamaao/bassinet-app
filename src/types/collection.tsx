export interface CollectionType {
    id: string,
    title: string,
    description: string,
    is_public: boolean,
    created_time: bigint,
    articles: ArticleType[]
}

export interface PageInfoType {
    totalItems: number;
    totalPages: number;
}

export interface ArticleType {
    id: string,
    title: string,
    collection_id: string,
    description: string,
    content: string,
    content_type: string,
    created_time: bigint
}