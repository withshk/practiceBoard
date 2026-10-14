package com.board.boardbackend.service

import com.board.boardbackend.dto.PostResponse
import com.board.boardbackend.repository.PostRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class PostService(private val postRepository: PostRepository) {

    @Transactional(readOnly = true)
    fun getPost(id: Long): PostResponse {
        val post = postRepository.findByIdOrNull(id)
            //TODO: 나중에 커스텀익셉션 만들어서 연결하기
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없어요.")
        return PostResponse.from(post)
    }

}