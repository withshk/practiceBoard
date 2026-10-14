package com.board.boardbackend.controller

import com.board.boardbackend.dto.PostResponse
import com.board.boardbackend.service.PostService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/posts")
class PostController(private val postService: PostService) {

    @GetMapping("/{id}")
    fun getPost(@PathVariable id: Long): PostResponse {
        return postService.getPost(id)
    }

}