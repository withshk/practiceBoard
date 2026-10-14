package com.board.boardbackend.repository

import com.board.boardbackend.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository: JpaRepository<User, Long> {

    fun existsByNicknameKey(nicknameKey: String): Boolean
    // 회원가입: 중복 확인

    fun findByNicknameKey(nicknameKey: String): User?
    // 로그인: 유저 조회 (없으면 null)
}