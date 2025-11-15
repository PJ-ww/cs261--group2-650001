package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
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
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginApiController {

    @Autowired
    private AuthenticationManager authenticationManager; // Inject Spring's manager

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String studentId = credentials.get("Username");
        String citizenId = credentials.get("Password");

        // 1. Create the *unauthenticated* token
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(studentId, citizenId);
        
        try {
            // 2. Give it to the AuthenticationManager.
            // This will find our TuAuthService (from Step 2) and call its authenticate() method.
            Authentication authentication = authenticationManager.authenticate(token);

            // 3. If successful, set it in the SecurityContext.
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // 4. THIS IS THE KEY: Manually create the session.
            // Spring Security will see this and send the JSESSIONID cookie.
            HttpSession session = request.getSession(true); // true = create new session
            session.setAttribute("SPRING_SECURITY_CONTEXT", context);
            
            // 5. Get the user object from the authenticated principal
            User user = (User) authentication.getPrincipal();

            // 6. Return success (this is what login.js expects)
            return ResponseEntity.ok(Map.of(
                    "status", true,
                    "message", "Login successful",
                    "studentId", user.getStudentId(),
                    "role", user.getRole().name()
            ));

        } catch (Exception e) {
            // This catches BadCredentialsException from TuAuthService
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", false, "message", "Invalid username or password"));
        }
    }
}