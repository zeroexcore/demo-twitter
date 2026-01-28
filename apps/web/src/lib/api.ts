// In production, use the API URL from env; in dev, use the Vite proxy
const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred");
  }

  return data;
}

// Auth API
export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }) => api<{ user: User; token: string }>("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    api<{ user: User; token: string }>("/auth/login", { method: "POST", body: data }),
};

// Tweets API
export const tweetsApi = {
  get: (id: string) => api<{ tweet: Tweet }>(`/tweets/${id}`),

  create: (content: string, token: string) =>
    api<{ tweet: Tweet }>("/tweets", { method: "POST", body: { content }, token }),

  update: (id: string, content: string, token: string) =>
    api<{ tweet: Tweet }>(`/tweets/${id}`, { method: "PUT", body: { content }, token }),

  delete: (id: string, token: string) =>
    api<{ success: boolean }>(`/tweets/${id}`, { method: "DELETE", token }),

  like: (id: string, token: string) =>
    api<{ success: boolean }>(`/tweets/${id}/like`, { method: "POST", token }),

  unlike: (id: string, token: string) =>
    api<{ success: boolean }>(`/tweets/${id}/like`, { method: "DELETE", token }),

  retweet: (id: string, token: string) =>
    api<{ success: boolean }>(`/tweets/${id}/retweet`, { method: "POST", token }),

  unretweet: (id: string, token: string) =>
    api<{ success: boolean }>(`/tweets/${id}/retweet`, { method: "DELETE", token }),
};

// Users API
export const usersApi = {
  getProfile: (username: string) => api<{ user: UserProfile }>(`/users/${username}`),

  getTweets: (username: string, cursor?: string) =>
    api<{ tweets: Tweet[]; nextCursor: string | null }>(
      `/users/${username}/tweets${cursor ? `?cursor=${cursor}` : ""}`
    ),

  updateProfile: (
    data: { displayName?: string; bio?: string; avatarUrl?: string },
    token: string
  ) => api<{ user: User }>("/users/me", { method: "PUT", body: data, token }),

  follow: (username: string, token: string) =>
    api<{ success: boolean }>(`/users/${username}/follow`, { method: "POST", token }),

  unfollow: (username: string, token: string) =>
    api<{ success: boolean }>(`/users/${username}/follow`, { method: "DELETE", token }),
};

// Timeline API
export const timelineApi = {
  getPublic: (cursor?: string) =>
    api<{ tweets: Tweet[]; nextCursor: string | null }>(
      `/timeline/public${cursor ? `?cursor=${cursor}` : ""}`
    ),

  getHome: (token: string, cursor?: string) =>
    api<{ tweets: Tweet[]; nextCursor: string | null }>(
      `/timeline/home${cursor ? `?cursor=${cursor}` : ""}`,
      { token }
    ),
};

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  tweets_count: number;
}

export interface Tweet {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  username: string;
  display_name: string;
  avatar_url: string;
  like_count: number;
  retweet_count: number;
  liked_by_me?: boolean;
  retweeted_by_me?: boolean;
}
