"use client";

import { useEffect, useState } from "react";
import { postApi } from "@/shared/api/communitypost";
import PostCard from "@/features/community/components/PostCard";
import CreatePostModal from "@/features/community/components/CreatePostModal";
import Nav from "@/shared/components/Navbar/Nav";

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postApi.getPosts();
      setPosts(data);
    } catch (err: any) {
      setError("Không thể tải bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[12vh] min-h-screen bg-gray-100">
      <Nav openNav={() => {}} />

      <div className="max-w-6xl mx-auto px-4 pt-6 flex gap-6">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-64">
          <div className="bg-white rounded-xl shadow p-4 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-2">
              Cộng đồng JobNest
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nơi chia sẻ kinh nghiệm phỏng vấn, tìm việc và kết nối.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Tạo bài viết
            </button>
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 max-w-2xl mx-auto space-y-4">
          {/* Create Post Box */}
          <div
            onClick={() => setOpen(true)}
            className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-gray-50 transition"
          >
            <p className="text-gray-500">
              Bạn đang nghĩ gì? Chia sẻ với cộng đồng…
            </p>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="text-center text-blue-500 mt-10">
              Đang tải bài viết...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-10">{error}</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              Chưa có bài viết nào.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-72">
          <div className="bg-white rounded-xl shadow p-4 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-3">
              Gợi ý cho bạn
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>🔥 Kinh nghiệm phỏng vấn</li>
              <li>💼 Review công ty</li>
              <li>📌 Câu hỏi thường gặp</li>
            </ul>
          </div>
        </aside>
      </div>

      <CreatePostModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          fetchPosts();
        }}
      />
    </div>
  );
}

