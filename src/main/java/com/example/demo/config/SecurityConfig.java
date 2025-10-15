package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ❌ ปิด CSRF ชั่วคราว
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

            .authorizeHttpRequests(auth -> auth
            		.requestMatchers("/**").permitAll()
                    .requestMatchers("/admin/**").hasRole("ADMIN")
                    .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                    .anyRequest().authenticated()
                )

            // ❌ ปิดฟอร์ม login ของ Spring เอง
            .formLogin(form -> form.disable());

        return http.build();
    }
}
