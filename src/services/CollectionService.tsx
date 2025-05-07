'use client'
import { getAuthorization, isValidAuthorization } from "@/app/lib/token";
import { BASE_URL } from "@/app/lib/utils/url";
import { CollectionType, PageInfoType } from "@/types/collection";

export async function fetchItems(page : number, pageSize: number) {
    try {
        if (!isValidAuthorization()) {
            throw new Error('无效会话');
        }
        const authorization = getAuthorization();
        const response = await fetch(
            BASE_URL + `/my_collections?page=${page}&page_size=${pageSize}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json",
                    "Authorization": authorization
                }
            }
        );
    
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return {
            items: data.dtos as CollectionType[],
            error: null,
            pageInfo: data.page_info as PageInfoType
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        return {
            items: [],
            error: 'Failed to load items',
            pageInfo: {
                totalItems: 0,
                totalPages: 0
            }
        }
    }
    
};