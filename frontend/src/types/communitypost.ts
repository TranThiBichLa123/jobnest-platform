export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  status: string;

  authorId: number;
  authorName: string;

  likeCount: number;
  commentCount: number;
  createdAt: string;
}
