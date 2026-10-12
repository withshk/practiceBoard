package com.board.boardbackend.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class User (
    @Column(unique = false, nullable = false, length = 20)
    var nickname: String,

    @Column(unique = true, nullable = false, length = 20)
    var nicknameKey: String,

    @Column(unique = false, nullable = false, length = 100)
    var passwordHash: String,
) {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

}