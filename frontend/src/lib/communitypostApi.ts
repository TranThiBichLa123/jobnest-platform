"use client";
import api from "./axios";
import { Post } from "@/types/communitypost";

export const postApi = {
  getPosts: async (): Promise<Post[]> => {
    const res = await api.get("/posts");
    return res.data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },

  createPost: async (data: {
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
  }): Promise<Post> => {
    const res = await api.post("/posts", data);
    return res.data;
  },

  deletePost: async (id: number) => {
    return api.delete(`/posts/${id}`);
  },
};
