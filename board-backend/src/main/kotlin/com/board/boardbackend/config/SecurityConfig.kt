package com.board.boardbackend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { } // 아래 corsConfigurationSource 빈 사용
            .csrf { it.disable() }
            .formLogin { it.disable() } // 로그인 화면은 프론트가 담당, 기본 폼 로그인 끔
            .httpBasic { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) } // JWT 방식이라 세션 안 씀
            .authorizeHttpRequests {
                // context-path(/api)는 빼고 매칭
                it.requestMatchers(HttpMethod.GET, "/posts", "/posts/**").permitAll()
                it.requestMatchers("/error").permitAll() // 404 등 에러 응답이 /error로 포워드될 때 403으로 덮이지 않게
                it.anyRequest().authenticated()
            }
        return http.build()
    }

    // 프론트(Vite dev 서버)에서 오는 요청 허용
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOrigins = listOf("http://localhost:5173")
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("Authorization", "Content-Type")
        }
        return UrlBasedCorsConfigurationSource().apply { registerCorsConfiguration("/**", config) }
    }
}
