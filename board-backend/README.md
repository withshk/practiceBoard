# practiceBoard Backend

Kotlin + Spring Boot로 회원 인증과 게시글 CRUD를 연습하는 게시판 백엔드입니다.

> 현재 프로젝트 구조, 의존성, MySQL 연결 설정만 준비되어 있습니다. 아래 API와 인증 기능은 구현 예정이며, 서버 실행 및 통합 테스트는 아직 검증하지 않았습니다.

## 기술 스택

- Kotlin 2.3.21 / Spring Boot 4.1.1
- JDK 17 / Gradle Wrapper 9.7.1
- Spring Web MVC / Spring Data JPA / MySQL
- Spring Security / JJWT 0.12.6 / Bean Validation

## 구현할 기능

- [ ] 회원가입: 로그인 ID(닉네임) 중복 확인, 닉네임·비밀번호 검증
- [ ] 로그인: 로그인 ID(닉네임)·비밀번호 인증 및 JWT 발급
- [ ] 글 작성: 로그인한 회원의 게시글 등록
- [ ] 글 조회: 비회원도 목록·상세 조회 가능
- [ ] 글 수정: 작성자만 제목·내용 수정
- [ ] 글 삭제: 작성자만 삭제

- 보조 기능: 현재 사용자 조회, 검색, 내 글 필터, 페이지 이동
- 목록 정렬: 최신 작성순 / 페이지당 6개 / API 페이지 번호는 0부터 시작
- 제외 범위: 댓글, 파일 첨부, 관리자, 비밀번호 찾기, 토큰 갱신

## API 명세 · 구현 예정

기본 주소: `http://localhost:8080/api`

- `POST /auth/signup`: 회원가입
- `POST /auth/login`: 로그인
- `GET /auth/me`: 현재 로그인 사용자 조회
- `GET /posts?page=0&size=6&keyword=&mine=false`: 목록 조회
- `GET /posts/{id}`: 상세 조회
- `POST /posts`: 글 작성
- `PUT /posts/{id}`: 글 수정
- `DELETE /posts/{id}`: 글 삭제

보호된 API는 `Authorization: Bearer <accessToken>` 헤더를 사용합니다.
수정·삭제 권한은 서버에서 인증 사용자 ID와 작성자 ID를 비교해 검증합니다.
요청·응답 필드와 상태 코드는 [프론트엔드 API 명세](../board-frontend/API.md)를 기준으로 구현합니다.

## 로컬 실행 준비

JDK 17과 MySQL을 준비한 뒤 저장소를 내려받습니다.

```bash
git clone https://github.com/withshk/practiceBoard.git
cd practiceBoard/board-backend
```

MySQL에서 사용할 데이터베이스를 생성합니다.

```sql
CREATE DATABASE board CHARACTER SET utf8mb4;
```

`board-backend/.env`를 생성하고 본인의 DB 접속 정보를 입력합니다.

```properties
DB_URL=jdbc:mysql://localhost:3306/board?serverTimezone=UTC&characterEncoding=UTF-8
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
```

`.env`는 Git에서 제외됩니다. 실제 비밀번호나 JWT 비밀키는 커밋하지 않습니다.

```bash
chmod +x gradlew
./gradlew bootRun
```

기본 포트는 8080입니다. 현재 게시글 API와 JWT 인증 설정은 구현되지 않았습니다.
테스트 명령은 `./gradlew test`이며, 현재는 애플리케이션 컨텍스트 로딩 테스트만 있습니다.

## 관련 문서

- [기능 명세서](https://www.notion.so/064b6a09002d4a9bab9cf490cf32a865)
- [프론트엔드 실행 안내](../board-frontend/README.md)
