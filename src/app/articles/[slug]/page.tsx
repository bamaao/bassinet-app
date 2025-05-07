'use client'

import Markdown from 'react-markdown';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BASE_URL } from "@/app/lib/utils/url";
import { ArticleType } from "@/types/collection";

export default function ArticlePage() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [article, setArticle] = useState<ArticleType>({} as ArticleType);
  const params = useParams();
  const article_id = params["slug"];
  // console.log("article_id:" + article_id);

  const fetchData = async () => {
    const response =  await fetch(BASE_URL + "/articles/" + article_id, {
      method: 'GET',
      headers: {
          "Content-Type": "application/json;charset=utf-8",
          "Accept": "application/json"
      }
    });
    if (!response.ok) {
      setErrorMessage(`Error: ${response.status}`);
    }else {
      const data = await response.json();
      setErrorMessage(errorMessage == null ? "" : errorMessage);
      setArticle(data);
    }
}

useEffect(()=>{
    fetchData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  return <>
    <div className='m-auto container'>
    <p className="mt-2 text-sm text-red-600 dark:text-red-500"><span className="font-medium">{errorMessage}</span></p>
    <article className="m-auto min-w-md format lg:format-lg">
    <Markdown>{article.content}</Markdown>
    </article> 
    </div>
    </>
}