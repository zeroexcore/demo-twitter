export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface Variables {
  user: AuthUser;
}
