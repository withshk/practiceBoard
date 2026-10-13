package com.board.boardbackend.repository

import com.board.boardbackend.entity.Post
import org.springframework.data.jpa.repository.JpaRepository

interface PostRepository : JpaRepository<Post, Long> {
}