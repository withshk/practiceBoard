package com.board.boardbackend.dto

import com.board.boardbackend.entity.Post
import java.time.Instant

data class PostResponse (
    val id: Long,
    val title: String,
    val content: String,
    val author: UserResponse,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(post: Post): PostResponse {
            return PostResponse( // from 함수로 포스트 엔티티를 받으면 그 값으로 새 PostResponse 객체 생성
                id = post.id!!,
                title = post.title,
                content = post.content,
                author = UserResponse(post.author.id!!, post.author.nickname),
                createdAt = post.createdAt,
                updatedAt = post.updatedAt,
            )
        }
    }
}