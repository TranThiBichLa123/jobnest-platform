"use client";

import { useEffect, useState } from "react";
import { postApi } from "@/shared/api/communitypost";
import { Post } from "@/shared/types/communitypost";

export default function PostDetail({ params }: any) {
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    postApi.getPostById(Number(params.id)).then(setPost);
  }, [params.id]);

  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-6 whitespace-pre-line">
        {post.content}
      </div>
    </div>
  );
}
