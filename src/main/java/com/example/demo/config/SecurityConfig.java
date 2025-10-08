package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import com.example.demo.filter.JwtAuthFilter;

import jakarta.servlet.Filter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

 @Autowired
 private JwtAuthFilter jwtAuthFilter;

    // ... other components (PasswordEncoder, UserDetailsService)

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
     http
         .csrf(AbstractHttpConfigurer::disable)
         .authorizeHttpRequests(auth -> auth
             .requestMatchers("/api/login").permitAll() // Public access for login
             .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") // Admin access required
             .anyRequest().authenticated() // All other requests need to be authenticated
         )
         .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Use stateless sessions for JWT
         .addFilterAt((Filter) jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Add the JWT filter

     return http.build();
 }
 
 // ... define AuthenticationManager and UserDetailsService beans
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
} 