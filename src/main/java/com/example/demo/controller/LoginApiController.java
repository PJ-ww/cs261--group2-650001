package com.example.demo.controller;

import com.example.demo.model.User;
// Delete the TuAuthService import, it's no longer needed here
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Map;
@RestController
@RequestMapping("/api")
public class LoginApiController {

    @Autowired
    private AuthenticationManager authenticationManager; 

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String studentId = credentials.get("Username");
        String citizenId = credentials.get("Password");

        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(studentId, citizenId);
        
        try {
            Authentication authentication = authenticationManager.authenticate(token);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = request.getSession(true); 
            session.setAttribute("SPRING_SECURITY_CONTEXT", context);
            
            User user = (User) authentication.getPrincipal();

            // ✅ แก้ไขตรงนี้: เพิ่ม "userId" เข้าไปใน Map
            return ResponseEntity.ok(Map.of(
                    "status", true,
                    "message", "Login successful",
                    "studentId", user.getStudentId(),
                    "role", user.getRole().name(),
                    "userId", user.getId() // <-- เพิ่มบรรทัดนี้
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", false, "message", "Invalid username or password"));
        }
    }
}