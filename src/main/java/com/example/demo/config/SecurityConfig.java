package com.example.demo.config;

import com.example.demo.service.TuAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private TuAuthService tuAuthService; // Inject our custom provider

    // Spring requires a PasswordEncoder bean, even if our provider does the auth.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // This bean registers our TuAuthService as an official authentication provider
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.authenticationProvider(tuAuthService);
        return authBuilder.build();
    }

    // This bean configures all security rules
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disable CSRF for a simpler SPA setup
            .authorizeHttpRequests(authz -> authz
                // --- Admin Endpoints (Most specific rules first) ---
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/locations").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/locations/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/locations/**").hasRole("ADMIN")
                
                // --- User Endpoints ---
                // === MODIFICATION: Added /favorites.html and its CSS to this rule ===
                .requestMatchers("/user/**", "/api/bookmarks/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/users/position/**").hasAnyRole("USER", "ADMIN")

                // --- Public Endpoints ---
                .requestMatchers("/", "/loading.html", "/favorites.html", "/favorites-style.css", "/style.css", "/script.js", "/authGuard.js").permitAll()
                .requestMatchers("/map.html", "/map-script.js", "/map-style.css").permitAll()
                .requestMatchers("/detail.html", "/detail-style.css").permitAll()
                .requestMatchers("/login", "/login.html", "/login.js", "/login_style.css").permitAll() 
                .requestMatchers(HttpMethod.POST, "/api/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/locations/**").permitAll() 
                .requestMatchers("/images/**", "/image/**", "/api/images/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/user/location").permitAll()
                
                // All other requests must be authenticated
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // We use a REST controller, not a form
            .httpBasic(basic -> basic.disable())
            
            // --- LOGOUT BLOCK ---
            .logout(logout -> logout
                .logoutUrl("/api/logout") // Defines the URL to trigger logout
                .invalidateHttpSession(true) // Destroys the server-side session
                .deleteCookies("JSESSIONID") // Tells the browser to delete the cookie
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK); // Sends a 200 OK
                })
            );
            // --- END OF BLOCK ---

        return http.build();
    }

    // This fixes Root Cause #2 (CORS)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests from your frontend.
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true); // <-- This is the key to allow cookies
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}