# BOARD · 작은 게시판

Kotlin + Spring Boot CRUD 연습에 연결할 수 있는 **React + TypeScript 프론트엔드**입니다.
실제 백엔드는 포함하지 않습니다. 기본값은 백엔드 없이 실행되는 로컬 데모입니다.

## 1. 실행

Node.js **22.12 이상** 권장 (Vite 7 지원 버전: 20.19 이상 또는 22.12 이상).
압축을 풀고 `board-frontend` 폴더에서 실행하세요.

```bash
npm ci
cp .env.example .env
npm run dev
```

접속: <http://127.0.0.1:5173>

- `npm run build`: TypeScript 검사 + 배포 빌드 (`dist/` 생성)
- `npm run typecheck`: TypeScript 검사
- `npm run preview`: 빌드 결과 미리보기
- 포트 5173이 이미 사용 중이면 해당 서버를 종료하거나 `vite.config.ts`의 port를 변경하세요.
- Google Fonts가 차단된 환경에서는 시스템 한글 폰트로 표시됩니다. 기능은 그대로 동작합니다.

## 2. 구현된 기능

- 닉네임/비밀번호 회원가입(닉네임이 로그인 ID), 비밀번호 확인 및 입력 검증
- 로그인, 로그아웃, 새로고침 시 로그인 확인
- 게시글 목록/상세 조회, 최신 작성순, 페이지 이동
- 제목·내용 검색, 내가 쓴 글 필터
- 로그인 사용자 글 작성, 작성자만 글 수정·삭제
- 삭제 확인창, 미저장 글 페이지 이동·탭 닫기 경고
- 로딩, 서버 오류, 빈 목록, 검색 결과 없음, 잘못된 주소 처리
- 모바일·태블릿·데스크톱 반응형 UI

## 3. 데모 모드

`.env`에 `VITE_USE_MOCK=true`를 설정합니다. 샘플 글 5개가 제공됩니다.
로그인 화면에서 **데모 계정 채우기**를 눌러 바로 체험하거나 새 계정을 만드세요.

- 공개 체험용 닉네임: `보드지기`
- 공개 체험용 비밀번호: `board1234`
- 데모 회원·글은 현재 브라우저의 localStorage에 저장됩니다.
- 데모는 로컬 기능 시뮬레이션이며 실제 서버 보안이나 다중 사용자 서비스가 아닙니다.
- 데모에는 실제 사용 중인 비밀번호를 넣지 마세요. 로컬 해시는 학습용일 뿐입니다.
- 데모 초기화: 개발자 도구 → Application → Local Storage에서
  `board.demo.database.v1`, `board.demo.token.v1` 두 키만 삭제한 뒤 새로고침하세요.
  다른 사이트 데이터는 삭제하지 마세요.

## 4. Spring Boot 연결

`.env`를 아래와 같이 바꾸고 실행 중인 Vite를 **재시작**하세요.
배포 빌드도 환경변수 변경 후 다시 해야 합니다.

```dotenv
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
```

백엔드에서 구현할 경로와 JSON 필드는 **[API.md](./API.md)**에 정리되어 있습니다.
프론트엔드는 `Authorization: Bearer <accessToken>` 방식으로 인증합니다.
실제 API 토큰은 sessionStorage에 보관하며, 데모 토큰과 분리됩니다.

기존 백엔드 명칭이 다르면:

1. **경로/HTTP 메서드/응답 변환**: `src/lib/api.ts`의 `realApi`
2. **타입/필드명**: `src/types.ts` 및 응답 변환
3. **검증 제한**: `src/lib/validation.ts`

세 곳을 중심으로 맞추면 됩니다. `src/lib/mock.ts`는 데모 전용입니다.

### 연결 전 체크리스트

- [ ] Spring Boot가 8080 포트에서 실행 중인지 확인
- [ ] API.md의 응답 형식을 맞추기 (추가 `{ data: ... }` 래퍼 없이 직접 반환)
- [ ] 프론트 origin `http://127.0.0.1:5173`, `http://localhost:5173` CORS 허용
- [ ] `OPTIONS` preflight, `Authorization`, `Content-Type` 헤더 허용
- [ ] 공개 조회와 회원가입·로그인은 Spring Security에서 permitAll
- [ ] `/auth/me`, 글 작성·수정·삭제, 내 글 조회는 인증 확인
- [ ] 수정·삭제 권한은 서버에서 현재 사용자 ID와 작성자 ID 비교
- [ ] 인증 실패도 HTML/리다이렉트 대신 JSON + 401/403 응답
- [ ] 실서비스 비밀번호는 BCrypt/Argon2 등 서버 전용 비밀번호 해시 사용

## 5. 폴더 구조

```text
src/
  components/   헤더·푸터, 알림, 확인창, 로딩/오류
  lib/
    api.ts       실제 API 호출 + 모드 선택
    auth.tsx     로그인 상태 관리
    config.ts    환경변수, 토큰 저장, 공통 오류
    mock.ts      localStorage 기반 데모
    validation.ts / format.ts
  pages/
    BoardPage.tsx   목록·검색·페이지 이동
    AuthPage.tsx    로그인·회원가입
    PostPage.tsx    상세·삭제
    EditorPage.tsx  작성·수정
  types.ts      백엔드 연결 타입
  styles.css    전체 반응형 스타일
```

## 6. 확인된 범위와 주의사항

TypeScript 검사와 production build, 데스크톱/390px 모바일 화면, 데모 모드 회원가입 → 로그인 → 작성 → 상세 → 수정 → 삭제 흐름을 확인했습니다.
검색·페이지 이동·작성자 권한 등 데모 자동 테스트 12개, 가짜 HTTP 서버를 이용한 실제 API 어댑터 테스트 25개도 통과했습니다.
실제 Kotlin 서버는 제공되지 않아 **사용자의 Spring Boot와의 최종 통합은 별도로 확인해야 합니다.**

학습용으로 기능을 작게 유지했습니다. 비밀번호 찾기, 이메일 인증, 리프레시 토큰,
파일 첨부, 댓글, 관리자 기능은 포함하지 않았습니다. JWT 만료 시 다시 로그인합니다.
로그아웃은 프론트 토큰 삭제 방식입니다. 발급된 JWT의 서버 측 폐기 기능은 별도 구현이 필요합니다.
토큰 저장 방식은 간단한 연습용 선택이며, 운영 시에는 XSS 대응과 HttpOnly 쿠키/CSRF 설계를 검토하세요.

Vite SPA를 배포할 때 `/posts/1` 같은 직접 접근도 `index.html`로 연결되도록
호스팅 서버의 SPA fallback 설정을 켜 주세요.
