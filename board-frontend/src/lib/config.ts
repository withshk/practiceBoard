export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
// 데모 토큰과 실제 API 토큰은 서로 섞이지 않습니다.
const TOKEN_KEY = USE_MOCK ? 'board.demo.token.v1' : `board.api.token:${API_BASE_URL}`;
// 실제 토큰은 탭을 닫으면 지워지는 sessionStorage에만 보관합니다.
const tokenStorage = () => USE_MOCK ? localStorage : sessionStorage;
export const getToken = () => tokenStorage().getItem(TOKEN_KEY);
export const setToken = (token: string) => tokenStorage().setItem(TOKEN_KEY, token);
export const clearToken = () => tokenStorage().removeItem(TOKEN_KEY);
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;
  constructor(message: string, status = 0, fieldErrors?: Record<string, string>) {
    super(message); this.name = 'ApiError'; this.status = status; this.fieldErrors = fieldErrors;
  }
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : '문제가 발생했어요. 다시 시도해 주세요.';
