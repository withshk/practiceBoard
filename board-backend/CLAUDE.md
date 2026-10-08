# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Early scaffold: only `BoardBackendApplication.kt`, `application.yaml`, and a context-load test exist. Auth, posts, JWT, and security config described in `README.md` are **not implemented yet** — check the code before assuming any feature exists. README is written in Korean.

This is the backend half of a monorepo (`../board-frontend` is the React/Vite client). The request/response fields and status codes are defined by `../board-frontend/API.md` — treat it as the contract when implementing endpoints.

## Commands

```bash
./gradlew bootRun                                        # run on :8080 (needs MySQL + .env)
./gradlew build                                          # compile + test
./gradlew test                                           # all tests (JUnit 5)
./gradlew test --tests 'com.board.boardbackend.SomeTest' # single test class
./gradlew test --tests '*SomeTest.methodName'            # single test method
```

No lint/format task is configured.

## Environment

- JDK 17 toolchain, Kotlin 2.3.21, Spring Boot 4.1.1 (note: Boot 4 / Jackson 3 — Jackson packages are `tools.jackson.*`, and test starters are the split `spring-boot-starter-*-test` artifacts).
- DB config comes from `board-backend/.env` (gitignored), loaded via `spring.config.import: optional:file:.env[.properties]` in `application.yaml`. Required keys: `DB_USERNAME`, `DB_PASSWORD`; `DB_URL` is optional (defaults to local MySQL db `board`). The database `board` must already exist (`CREATE DATABASE board CHARACTER SET utf8mb4;`).
- `ddl-auto: update` — Hibernate manages the schema; there are no migrations. Hibernate JDBC time zone is UTC.
- The context-load test (`BoardBackendApplicationTests`) boots the full context, so it needs a reachable MySQL and the `.env` values.

## Architecture notes

- Root package `com.board.boardbackend`.
- `build.gradle` applies the Kotlin `spring` and `jpa` plugins plus an `allOpen` block for `@Entity`/`@MappedSuperclass`/`@Embeddable`, so JPA entities can be plain Kotlin classes (no manual `open`, no-arg ctor generated).
- Compiler flags: `-Xjsr305=strict` (Spring nullability annotations are enforced as Kotlin types) and `-Xannotation-default-target=param-property` (validation annotations on constructor params apply to both param and property).
- Planned stack: Spring Security + JJWT 0.12.6 (stateless Bearer JWT, no refresh tokens), Bean Validation, Spring Data JPA.

## Planned API conventions (from README, not yet implemented)

- Base path `/api` — no `server.servlet.context-path` or controller prefix is configured yet.
- Protected endpoints use `Authorization: Bearer <accessToken>`; guests may read post list/detail.
- Edit/delete authorization is enforced server-side by comparing the authenticated user ID to the post author ID.
- Post list: newest first, page size 6, 0-based `page`, supports `keyword` search and `mine` filter.
- Out of scope: comments, file attachments, admin, password reset, token refresh.
