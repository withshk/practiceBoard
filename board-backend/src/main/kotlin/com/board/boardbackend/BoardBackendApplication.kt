package com.board.boardbackend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BoardBackendApplication

fun main(args: Array<String>) {
    runApplication<BoardBackendApplication>(*args)
}
