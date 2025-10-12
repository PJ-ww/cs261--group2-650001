package com.example.demo.config;

<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Autowired;
=======
import org.springframework.beans.factory.annotation.Value;
>>>>>>> 52a2a89 (login backend logic)
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
<<<<<<< HEAD
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
=======
import org.springframework.security.web.SecurityFilterChain;

//@Configuration
//@EnableWebSecurity
public class SecurityConfig {

    // ✅ ดึงค่าจาก application.properties
    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;
    
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 🔒 ปิด CSRF ชั่วคราว (ถ้ามีปัญหากับ form POST ค่อยเปิดทีหลัง)
            .csrf(csrf -> csrf.disable())

            // 🧭 การกำหนดสิทธิ์เข้าใช้ URL ต่าง ๆ
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/error", "/css/**", "/js/**").permitAll() // ให้เข้าถึง login/error ได้โดยไม่ต้องล็อกอิน
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()
            )

            // 🧑‍💻 เปิดใช้งานหน้า login แบบของ Spring
            .formLogin(form -> form
                .loginPage("/login")              // ใช้หน้า /login ของเราเอง (เช่น login.html)
                .loginProcessingUrl("/process-login") // URL ที่ form จะส่งข้อมูลไปตรวจสอบ
                .defaultSuccessUrl("/home", true) // หลังล็อกอินสำเร็จจะไปหน้าไหน
                .failureUrl("/login?error=true")  // ถ้าล็อกอินผิดจะไปไหน
                .permitAll()
            )

            // 🚪 ตั้งค่าการ logout
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        return http.build();
    }
}
>>>>>>> 52a2a89 (login backend logic)
