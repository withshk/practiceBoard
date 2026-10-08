import type { LoginInput, PostInput, SignupInput } from '../types';
export const LIMITS = { title: 100, content: 10000, nickname: 20, password: 72 } as const;
export function validateLogin(input: LoginInput) {
  const errors: Record<string, string> = {};
  if (!input.nickname.trim()) errors.nickname = '닉네임을 입력해 주세요.';
  if (!input.password) errors.password = '비밀번호를 입력해 주세요.';
  return errors;
}
export function validateSignup(input: SignupInput) {
  const errors = validateLogin(input);
  if (input.nickname.trim().length < 2 || input.nickname.trim().length > LIMITS.nickname) errors.nickname = '닉네임은 2~20자로 입력해 주세요.';
  if (input.password.length < 8 || new TextEncoder().encode(input.password).length > LIMITS.password) errors.password = '비밀번호는 8자 이상, UTF-8 기준 72바이트 이하로 입력해 주세요.';
  return errors;
}
export function validatePost(input: PostInput) {
  const errors: Record<string, string> = {};
  if (!input.title.trim() || input.title.trim().length > LIMITS.title) errors.title = '제목은 1~100자로 입력해 주세요.';
  if (!input.content.trim() || input.content.trim().length > LIMITS.content) errors.content = '내용은 1~10,000자로 입력해 주세요.';
  return errors;
}
