// User types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
}

// Tweet types
export interface Tweet {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  likeCount: number;
  retweetCount: number;
  likedByMe?: boolean;
  retweetedByMe?: boolean;
}

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

// API Request types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateTweetRequest {
  content: string;
}

export interface UpdateTweetRequest {
  content: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}
