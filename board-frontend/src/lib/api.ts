import type { AuthResponse, LoginInput, PageResult, Post, PostInput, PostQuery, SignupInput, User } from '../types';
import { API_BASE_URL, ApiError, clearToken, getToken, USE_MOCK } from './config';
import { mockApi } from './mock';
async function request<T>(endpoint: string, options: RequestInit = {}, auth = false): Promise<T> {
  const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), 12000);
  try {
    const headers = new Headers(options.headers); headers.set('Accept', 'application/json');
    if (options.body) headers.set('Content-Type', 'application/json');
    const token = getToken(); if (auth && token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
    const text = await response.text(); let body: unknown;
    try { body = text ? JSON.parse(text) : undefined; } catch { throw new ApiError('서버 응답이 JSON이 아니에요. API 주소와 응답 형식을 확인해 주세요.', response.status); }
    if (!response.ok) {
      if (response.status === 401 && auth && token) { clearToken(); window.dispatchEvent(new Event('board:session-expired')); }
      const data = body as { message?: string; fieldErrors?: Record<string, string> } | undefined;
      throw new ApiError(data?.message || ({ 401: '로그인이 필요해요.', 403: '이 작업을 수행할 권한이 없어요.', 404: '요청한 내용을 찾을 수 없어요.', 409: '이미 사용 중인 정보예요.' }[response.status] || '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'), response.status, data?.fieldErrors);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.');
    throw new ApiError('서버에 연결할 수 없어요. Spring Boot 실행 상태, API 주소와 CORS 설정을 확인해 주세요.');
  } finally { window.clearTimeout(timer); }
}
const realApi: typeof mockApi = {
  signup: (input: SignupInput) => request<User>('/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: LoginInput) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  me: () => request<User>('/auth/me', {}, true),
  listPosts: (query: PostQuery) => {
    const params = new URLSearchParams({ page: String(query.page), size: String(query.size), keyword: query.keyword, mine: String(query.mine) });
    return request<PageResult<Post>>(`/posts?${params}`, {}, query.mine);
  },
  getPost: (id: number) => request<Post>(`/posts/${id}`),
  createPost: (input: PostInput) => request<Post>('/posts', { method: 'POST', body: JSON.stringify(input) }, true),
  updatePost: (id: number, input: PostInput) => request<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(input) }, true),
  deletePost: (id: number) => request<void>(`/posts/${id}`, { method: 'DELETE' }, true),
};
// API 경로 또는 DTO가 다르면 위 realApi와 src/types.ts만 변경하면 됩니다.
export const api = USE_MOCK ? mockApi : realApi;
