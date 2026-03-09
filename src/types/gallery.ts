export interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  uploaderId: string;
  uploaderName: string | null;
  createdAt: string;
}

export interface PhotoDetail {
  id: string;
  albumId: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string | null;
  uploaderId: string;
  uploaderName: string | null;
  createdAt: string;
  commentCount: number;
}

export interface PhotoComment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  authorId: string;
  authorName: string | null;
  authorAvatar: string | null;
}
