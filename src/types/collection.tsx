export interface CollectionType {
    id: string,
    title: string,
    description: string,
    is_public: boolean,
    listing: boolean,
    created_time: bigint,
    icon_url: string,
    nft: NftInfo,
    // articles: ArticleType[]
    items: CollectionItem[]
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

export interface CollectionItem {
    id: string,
    title: string,
    collection_id: string,
    description: string,
    content: string,
    category: string,
    url_path: string,
    content_type: string,
    created_time: bigint
}

export interface NftInfo {
    id: string,
    package_id: string,
    collection_url: string,
    limit: number,
    minting_price: number,
    rewards_quantity: number,
    mint_id: string,
    policy_id: string,
    policy_cap_id: string,
    coin_id: string,
    coin_package_id: string,
    coin_treasury_lock_id: string,
    coin_admin_cap_id: string
}