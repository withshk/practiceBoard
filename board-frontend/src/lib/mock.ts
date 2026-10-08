// 학습용 로컬 어댑터입니다. 실제 인증/권한 검증은 반드시 백엔드에서 구현하세요.
import type { AuthResponse, LoginInput, PageResult, Post, PostInput, PostQuery, SignupInput, User } from '../types';
import { ApiError, getToken } from './config';
import { validatePost, validateSignup } from './validation';
interface StoredUser extends User { salt: string; passwordHash: string; }
interface Database { version: 1; users: StoredUser[]; posts: Post[]; sessions: Record<string, number>; nextUserId: number; nextPostId: number; }
const DB_KEY = 'board.demo.database.v1';
let initPromise: Promise<void> | undefined;
const hash = async (password: string, salt: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`)))).map(v => v.toString(16).padStart(2, '0')).join('');
function read(): Database {
  try { const db = JSON.parse(localStorage.getItem(DB_KEY) || 'null') as Database | null; if (db?.version === 1 && Array.isArray(db.posts) && Array.isArray(db.users) && db.sessions) return db; } catch { /* 저장 데이터 손상 */ }
  throw new ApiError('데모 데이터가 손상됐어요. README의 데모 초기화 방법을 확인해 주세요.');
}
function write(db: Database) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function publicUser(user: StoredUser): User { return { id: user.id, nickname: user.nickname }; }
function requireUser(db: Database): StoredUser {
  const id = db.sessions[getToken() || '']; const user = db.users.find(u => u.id === id);
  if (!user) throw new ApiError('로그인이 필요해요.', 401);
  return user;
}
function assertValid(errors: Record<string, string>) { if (Object.keys(errors).length) throw new ApiError('입력 내용을 확인해 주세요.', 400, errors); }
async function initialize() {
  if (localStorage.getItem(DB_KEY)) return;
  const salt = crypto.randomUUID();
  const demo: StoredUser = { id: 1, nickname: '보드지기', salt, passwordHash: await hash('board1234', salt) };
  // 고정된 과거 날짜로 제공되는 샘플 게시글입니다.
  const items = [
    ['작은 기록부터 시작해 볼까요?', '거창한 이야기가 아니어도 괜찮아요.\n\n오늘 새로 알게 된 것, 해결한 문제, 문득 떠오른 생각을 자유롭게 남겨 주세요. 작은 기록이 쌓이면 나만의 이야기가 됩니다.\n\n이 게시판에서는 글을 쓰고, 읽고, 수정하고, 삭제할 수 있어요. 오른쪽 위의 로그인 버튼으로 시작해 보세요.'],
    ['처음 만든 API가 연결되던 순간', '컨트롤러에 요청이 들어오고, 서비스가 실행되고, 데이터베이스에 값이 저장됐어요.\n\n짧은 코드였지만 브라우저에서 결과를 확인하니 꽤 뿌듯했습니다. 다음 목표는 예외 처리와 권한 검증을 차근차근 붙여 보는 거예요.'],
    ['CRUD 연습, 이렇게 진행해 보세요', '1. 회원가입과 로그인 API를 먼저 연결해요.\n2. 게시글 목록과 상세 조회를 구현해요.\n3. 로그인한 사용자가 글을 작성하도록 해요.\n4. 본인의 글만 수정하고 삭제하도록 권한을 확인해요.\n\n프론트엔드에서 버튼을 숨겨도, 서버에서 작성자 확인은 꼭 해야 합니다.'],
    ['읽기 좋은 코드에 대한 메모', '변수 이름을 명확하게 짓고, 한 함수가 한 가지 일을 하도록 나눠 보려고 해요.\n\n나중에 다시 읽는 나도 코드를 처음 보는 사람일 수 있으니까요. 동작하는 코드에서 한 걸음 더 나아가 읽기 좋은 코드를 만드는 연습을 해 봅시다.'],
    ['새로운 프로젝트를 시작하는 마음', '처음부터 완벽하게 만들기보다, 작은 기능 하나를 끝까지 연결하는 것이 목표예요.\n\n이번 프로젝트는 회원가입, 로그인, 그리고 게시글 CRUD. 기능은 단순하지만 프론트엔드부터 데이터베이스까지 한 바퀴 돌아볼 수 있는 좋은 시작입니다.']
  ];
  const posts: Post[] = items.map(([title, content], index) => ({ id: 5-index, title, content, author: { id: 1, nickname: demo.nickname }, createdAt: new Date(`2026-09-${String(28-index).padStart(2,'0')}T10:00:00+09:00`).toISOString(), updatedAt: new Date(`2026-09-${String(28-index).padStart(2,'0')}T10:00:00+09:00`).toISOString() }));
  if (!localStorage.getItem(DB_KEY)) write({ version: 1, users: [demo], posts, sessions: {}, nextUserId: 2, nextPostId: 6 });
}
async function ready() { initPromise ??= initialize().catch(error => { initPromise = undefined; throw error; }); await initPromise; }
export const mockApi = {
  async signup(input: SignupInput): Promise<User> {
    await ready(); assertValid(validateSignup(input)); const db = read(); const nickname = input.nickname.trim(); const key = nickname.toLowerCase();
    if (db.users.some(u => u.nickname.toLowerCase() === key)) throw new ApiError('이미 사용 중인 닉네임이에요.', 409, { nickname: '이미 사용 중인 닉네임이에요.' });
    const salt = crypto.randomUUID(); const passwordHash = await hash(input.password, salt);
    // 해시 생성 동안 다른 요청이 저장했을 수 있으므로 최신 상태를 읽습니다.
    const latest = read(); if (latest.users.some(u => u.nickname.toLowerCase() === key)) throw new ApiError('이미 사용 중인 닉네임이에요.', 409, { nickname: '이미 사용 중인 닉네임이에요.' });
    const user: StoredUser = { id: latest.nextUserId++, nickname, salt, passwordHash };
    latest.users.push(user); write(latest); return publicUser(user);
  },
  async login(input: LoginInput): Promise<AuthResponse> {
    await ready(); const db = read(); const user = db.users.find(u => u.nickname.toLowerCase() === input.nickname.trim().toLowerCase());
    if (!user || await hash(input.password, user.salt) !== user.passwordHash) throw new ApiError('닉네임 또는 비밀번호가 맞지 않아요.', 401);
    const latest = read(); const accessToken = crypto.randomUUID(); latest.sessions[accessToken] = user.id; write(latest);
    return { accessToken, user: publicUser(user) };
  },
  async me(): Promise<User> { await ready(); return publicUser(requireUser(read())); },
  async listPosts(query: PostQuery): Promise<PageResult<Post>> {
    await ready(); const db = read(); const userId = query.mine ? requireUser(db).id : undefined; const keyword = query.keyword.toLowerCase();
    const filtered = db.posts.filter(p => (!query.mine || p.author.id === userId) && (!keyword || `${p.title}\n${p.content}`.toLowerCase().includes(keyword))).sort((a,b) => b.id-a.id);
    return { content: filtered.slice(query.page*query.size,(query.page+1)*query.size), number: query.page, size: query.size, totalElements: filtered.length, totalPages: Math.ceil(filtered.length/query.size) };
  },
  async getPost(id: number): Promise<Post> { await ready(); const post = read().posts.find(p => p.id === id); if (!post) throw new ApiError('글을 찾을 수 없어요. 삭제되었거나 주소가 잘못됐어요.', 404); return post; },
  async createPost(input: PostInput): Promise<Post> {
    await ready(); assertValid(validatePost(input)); const db = read(); const user = requireUser(db); const now = new Date().toISOString();
    const post: Post = { id: db.nextPostId++, title: input.title.trim(), content: input.content.trim(), author: { id: user.id, nickname: user.nickname }, createdAt: now, updatedAt: now };
    db.posts.push(post); write(db); return post;
  },
  async updatePost(id: number, input: PostInput): Promise<Post> {
    await ready(); assertValid(validatePost(input)); const db = read(); const user = requireUser(db); const post = db.posts.find(p => p.id === id);
    if (!post) throw new ApiError('글을 찾을 수 없어요.', 404);
    if (post.author.id !== user.id) throw new ApiError('본인이 작성한 글만 수정할 수 있어요.', 403);
    Object.assign(post, { title: input.title.trim(), content: input.content.trim(), updatedAt: new Date().toISOString() }); write(db); return post;
  },
  async deletePost(id: number): Promise<void> {
    await ready(); const db = read(); const user = requireUser(db); const post = db.posts.find(p => p.id === id);
    if (!post) throw new ApiError('이미 삭제되었거나 존재하지 않는 글이에요.', 404);
    if (post.author.id !== user.id) throw new ApiError('본인이 작성한 글만 삭제할 수 있어요.', 403);
    db.posts = db.posts.filter(p => p.id !== id); write(db);
  }
};
