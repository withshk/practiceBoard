# Spring Boot 연결 명세

기본 주소: `http://localhost:8080/api`

프론트가 사용하는 **정확한 경로와 필드명**입니다. 백엔드를 여기에 맞추거나
`src/lib/api.ts`에서 기존 백엔드 응답을 이 구조로 변환하면 됩니다.

## 공통 규칙

- 요청/응답: `application/json`, 필드명은 camelCase.
- 응답은 아래 JSON 객체를 직접 반환합니다. `{ "data": ... }`로 감싸지 않습니다.
- `id`는 양의 숫자입니다. Kotlin `Long`을 쓸 수 있으나 JavaScript 안전 정수 범위 이하로 유지하세요.
- 날짜: ISO-8601 + UTC `Z` 또는 timezone offset. 예: `2026-10-08T00:00:00Z`.
- 제목 1~100자, 본문 1~10,000자, 닉네임 2~20자. 양끝 공백 제거 후 빈 문자열은 거부.
- 비밀번호 8자 이상, UTF-8 기준 최대 72바이트. 비밀번호의 공백은 제거하지 않습니다.
- 닉네임은 로그인 ID입니다. 공백 제거·소문자 변환 후 고유성을 검사하세요(중복은 409).
- 모든 에러는 JSON으로 반환. 작성자 ID는 요청 body가 아니라 인증 정보에서 얻습니다.

## 엔드포인트 요약

| 기능 | 메서드 | 경로 | 인증 | 성공 |
|---|---|---|---|---|
| 회원가입 | POST | `/auth/signup` | 불필요 | 201 + User |
| 로그인 | POST | `/auth/login` | 불필요 | 200 + AuthResponse |
| 현재 사용자 | GET | `/auth/me` | 필요 | 200 + User |
| 게시글 목록 | GET | `/posts?page=0&size=6&keyword=&mine=false` | mine=true일 때 필요 | 200 + PageResult |
| 게시글 상세 | GET | `/posts/{id}` | 불필요 | 200 + Post |
| 게시글 작성 | POST | `/posts` | 필요 | 201 + Post |
| 게시글 수정 | PUT | `/posts/{id}` | 작성자만 | 200 + Post |
| 게시글 삭제 | DELETE | `/posts/{id}` | 작성자만 | 204, 본문 없음 |

프론트는 본문이 필요한 API에서 2xx 상태 + 아래 응답 구조를 기대합니다.
회원가입이 자동 로그인되지는 않습니다. 가입 완료 후 로그인 화면으로 이동합니다.

## 1. 회원가입

`POST /api/auth/signup`

```json
{
  "nickname": "현욱",
  "password": "example1234"
}
```

응답 `201 Created`:

```json
{
  "id": 1,
  "nickname": "현욱"
}
```

이 객체가 **User** 타입입니다. 응답에 비밀번호/비밀번호 해시를 절대 넣지 않습니다.
닉네임 중복은 409, 입력 오류는 400을 반환하세요.

## 2. 로그인

`POST /api/auth/login`

```json
{
  "nickname": "현욱",
  "password": "example1234"
}
```

응답 `200 OK` (**AuthResponse**):

```json
{
  "accessToken": "여기에_발급한_JWT_문자열",
  "user": {
    "id": 1,
    "nickname": "현욱"
  }
}
```

`accessToken`에는 `Bearer ` 접두사를 넣지 마세요. 프론트가 헤더에 붙입니다.
닉네임 또는 비밀번호가 틀린 경우 401을 반환하세요.

## 3. 현재 사용자

`GET /api/auth/me`

```http
Authorization: Bearer <accessToken>
```

응답: 위의 User 객체. 토큰이 유효하지 않거나 만료되었으면 401.
프론트는 새로고침 시 이 API를 호출해 사용자 정보를 복구합니다.

## 4. 게시글 객체

목록/상세/작성/수정에 동일한 **Post** 구조를 사용합니다.

```json
{
  "id": 12,
  "title": "첫 번째 게시글",
  "content": "첫 줄입니다.\n\n다음 문단입니다.",
  "author": {
    "id": 1,
    "nickname": "현욱"
  },
  "createdAt": "2026-10-08T00:00:00Z",
  "updatedAt": "2026-10-08T00:00:00Z"
}
```

작성 직후 `updatedAt = createdAt`. 수정하면 `updatedAt`만 갱신합니다.
프론트는 HTML이나 마크다운을 렌더링하지 않으며 일반 텍스트와 줄바꿈을 표시합니다.
목록에서도 미리보기용 `content`를 반환해야 합니다. `authorName`이 아니라
중첩 객체 `author.id`, `author.nickname`을 사용합니다.

## 5. 목록

`GET /api/posts?page=0&size=6&keyword=&mine=false`

- `page`: **0부터 시작**. 화면의 1페이지는 API의 page=0.
- `size`: 프론트 기본값 6. 서버에서 양수/최대 크기를 검증하세요.
- `keyword`: 제목 또는 본문에 포함된 문자열 검색. 빈 문자열이면 필터 없음.
- `mine`: false면 전체, true면 현재 인증 사용자가 작성한 글만.
- 정렬: `createdAt DESC, id DESC`. 정렬 파라미터는 따로 보내지 않습니다.
- 공개 목록(mine=false)과 상세 조회에는 Authorization 헤더를 보내지 않습니다.
- mine=true일 때 Bearer 헤더를 보냅니다. 인증 사용자 ID로 필터하세요.

응답 (**PageResult**):

```json
{
  "content": [
    {
      "id": 12,
      "title": "첫 번째 게시글",
      "content": "첫 줄입니다.\n\n다음 문단입니다.",
      "author": { "id": 1, "nickname": "현욱" },
      "createdAt": "2026-10-08T00:00:00Z",
      "updatedAt": "2026-10-08T00:00:00Z"
    }
  ],
  "number": 0,
  "size": 6,
  "totalElements": 1,
  "totalPages": 1
}
```

`totalElements`는 현재 검색/내 글 필터를 적용한 전체 개수이며 현재 페이지 개수가 아닙니다.
빈 결과는 `content: []`, `totalElements: 0`, `totalPages: 0`입니다.
필터나 검색이 달라지면 프론트는 첫 페이지로 돌아갑니다.
Spring Data `Page`와 유사하지만 아래 DTO로 필요한 필드만 명확히 반환하는 방식을 권장합니다.

## 6. 작성·수정·삭제

### 작성

`POST /api/posts`, Bearer 인증 필요:

```json
{
  "title": "첫 번째 게시글",
  "content": "첫 줄입니다.\n\n다음 문단입니다."
}
```

응답: `201 Created` + 저장된 Post 전체 객체.
`id`, `author`, 날짜는 서버에서 만듭니다.

### 수정

`PUT /api/posts/12`, Bearer 인증 필요.
요청은 작성과 동일한 `title`, `content` 객체입니다. 두 필드 전체를 교체합니다.
응답: `200 OK` + 수정된 Post 전체 객체.

### 삭제

`DELETE /api/posts/12`, Bearer 인증 필요.
요청 body 없음. 응답: `204 No Content`, 응답 body 없음.

수정·삭제는 서버에서 **현재 로그인 사용자 ID == 게시글 작성자 ID**인지 반드시 확인하세요.
미인증은 401, 다른 작성자는 403, 존재하지 않는 글은 404를 반환합니다.
프론트에서 버튼을 숨기는 것은 보안 검증이 아닙니다.

## 7. 오류 형식

```json
{
  "message": "입력 내용을 확인해 주세요.",
  "fieldErrors": {
    "nickname": "이미 사용 중인 닉네임이에요."
  }
}
```

- `message`: 사용자에게 표시할 문자열.
- `fieldErrors`: 선택 사항. 필드명 → 오류 문자열의 객체 (배열 아님).
- 회원가입/로그인 필드: `nickname`, `password`.
- 작성/수정 필드: `title`, `content`.
- 비밀번호 확인 `confirm`은 프론트 전용이며 서버로 전송하지 않습니다.
- Spring Security의 AuthenticationEntryPoint/AccessDeniedHandler도 같은 JSON 규격을 사용하세요.
- 보호된 요청이 401이면 프론트가 토큰을 지우고 재로그인을 요구합니다.
- 로그아웃 API/refresh token API는 호출하지 않습니다.

## 8. Kotlin DTO 이름 예시

클래스명은 서버에서 자유롭게 바꿔도 됩니다. 중요한 것은 직렬화된 JSON 필드명입니다.
아래 DTO는 연결 구조 예시이며 컨트롤러·검증·서비스·JWT 구현은 포함하지 않습니다.

```kotlin
import java.time.Instant

data class SignupRequest(val nickname: String, val password: String)
data class LoginRequest(val nickname: String, val password: String)
data class UserResponse(val id: Long, val nickname: String)
data class LoginResponse(val accessToken: String, val user: UserResponse)
data class AuthorResponse(val id: Long, val nickname: String)
data class PostRequest(val title: String, val content: String)
data class PostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val author: AuthorResponse,
    val createdAt: Instant,
    val updatedAt: Instant
)
data class PageResponse<T>(
    val content: List<T>,
    val number: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
)
data class ErrorResponse(
    val message: String,
    val fieldErrors: Map<String, String>? = null
)
```

프론트의 `number`, `size`, `totalElements`, `totalPages`는 모두 JSON 숫자입니다.
날짜에 `Instant`를 쓰면 timezone 없는 문자열 문제를 피하기 쉽습니다.
비밀번호는 서버에서도 UTF-8 72바이트 제한을 검증하세요 (BCrypt 사용 시 특히 중요).

## 9. CORS / Spring Security

이 프론트는 쿠키가 아닌 Bearer 헤더를 사용하며 fetch에 credentials 옵션을 켜지 않습니다.
아래는 CORS Bean 예시입니다. 본인의 SecurityFilterChain에 `cors`를 활성화하고,
JWT 인증 필터와 경로별 인가 규칙을 별도로 설정해야 합니다.

```kotlin
import org.springframework.context.annotation.Bean
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Bean
fun corsConfigurationSource(): CorsConfigurationSource {
    val configuration = CorsConfiguration().apply {
        allowedOrigins = listOf("http://127.0.0.1:5173", "http://localhost:5173")
        allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        allowedHeaders = listOf("Authorization", "Content-Type", "Accept")
        allowCredentials = false
    }
    return UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/api/**", configuration)
    }
}
```

- POST `/api/auth/signup`, `/api/auth/login`: 공개.
- GET `/api/posts`, `/api/posts/{id}`: 공개. 단 `mine=true` 요청은 서비스에서 인증 요구.
- GET `/api/auth/me`, POST/PUT/DELETE 글 API: 인증 요구.
- OPTIONS preflight를 로그인 없이 통과시켜 주세요.
- 공개 API에서 잘못된 JWT가 없는 요청을 JWT 필터가 거부하지 않도록 설정하세요.
- 운영 배포 시 실제 프론트 origin을 allowedOrigins에 추가하고 HTTPS를 사용하세요.
