package com.board.boardbackend.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "posts")
class Post ( //유저가 입력하는것

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @Column(unique = false, nullable = false)
    var author: User, // 유저 엔티티에 있는 유저 아이디를 참조

    @Column(unique = false, nullable = false, length = 100)
    var title: String,

    @Column(unique = false, nullable = false, columnDefinition = "TEXT")
    var content: String,

) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(unique = false, nullable = false, updatable = false)
    var createdAt: Instant = Instant.now() // 조회 시 now() 값은 DB 값으로 덮어써지고, updatable=false라 수정 시 UPDATE에서 빠진다.

    @Column(unique = false, nullable = false)
    var updatedAt: Instant = createdAt // 둘의 실행 시점은 다르기 때문에 now를 쓰지 않고 createdAt을 넣는다. 생성시간은 불변이지만 수정시간은 아니다.
}