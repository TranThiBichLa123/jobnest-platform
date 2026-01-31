"use client";

import React, { useState } from "react";
import { postApi } from "@/shared/api/communitypost";
import { Post } from "@/shared/types/communitypost";

export default function CreatePostModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (post: Post) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(""); // Thêm state cho category
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const post = await postApi.createPost({ title, content, category }); // Thêm category
    setLoading(false);
    setTitle("");
    setContent("");
    setCategory("");
    onCreated(post);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold mb-2">Tạo bài viết mới</h2>
        <input
          className="border rounded px-3 py-2"
          placeholder="Tiêu đề"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Chuyên mục"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        />
        <textarea
          className="border rounded px-3 py-2 min-h-[100px]"
          placeholder="Nội dung"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
            disabled={loading}
          >
            {loading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </form>
    </div>
  );
}

