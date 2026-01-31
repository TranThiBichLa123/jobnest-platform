"use client";

import { Post } from "@/shared/types/communitypost";
import Link from "next/link";

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6 flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.author?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold">{post.author?.name || "Unknown"}</div>
          <div className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="font-bold text-lg mb-1">{post.title}</div>
      <div className="text-gray-700 mb-2 line-clamp-3">{post.content}</div>
      <div className="flex gap-6 text-sm text-gray-500">
        <span>👍 {post.likes || 0}</span>
        <span>💬 {post.comments?.length || 0}</span>
      </div>
    </div>
  );
}
