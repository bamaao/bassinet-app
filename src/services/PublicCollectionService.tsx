'use client'
import { BASE_URL } from "@/app/lib/utils/constants";
import { CollectionType, PageInfoType } from "@/types/collection";

export async function fetchCollections(page : number, pageSize: number, keyword: string) {
    try {
        const response = await fetch(
            BASE_URL + `/collections?page=${page}&page_size=${pageSize}&keyword=${keyword}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json"
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

export async function getAuthorCollections(page : number, pageSize: number, author: string) {
    try {
        const response = await fetch(
            BASE_URL + `/author/${author}/collections?page=${page}&page_size=${pageSize}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json"
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