export interface User { id: number; nickname: string; }
export interface Post { id: number; title: string; content: string; author: Pick<User, 'id' | 'nickname'>; createdAt: string; updatedAt: string; }
export interface PageResult<T> { content: T[]; number: number; size: number; totalElements: number; totalPages: number; }
export interface LoginInput { nickname: string; password: string; }
export type SignupInput = LoginInput;
export interface AuthResponse { accessToken: string; user: User; }
export interface PostInput { title: string; content: string; }
export interface PostQuery { page: number; size: number; keyword: string; mine: boolean; }
