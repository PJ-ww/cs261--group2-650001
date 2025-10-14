package com.example.demo.controller;

import com.example.demo.service.TuAuthService;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginApiController {

    @Autowired
    private TuAuthService tuAuthService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String studentId = credentials.get("Username");  // ✅ TU API still sends "Username"
        String citizenId = credentials.get("Password");

        // ✅ Use TU API for authentication
        boolean success = tuAuthService.authenticateAndLogin(studentId, citizenId);

        if (success) {
            // ✅ Retrieve the user created or updated by TuAuthService
            Optional<User> userOpt = userRepository.findByStudentId(studentId);
            User user = userOpt.orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("status", false, "message", "User not found after login"));
            }

            // ✅ Send a clean JSON response to frontend
            return ResponseEntity.ok(Map.of(
                "status", true,
                "message", "Login successful",
                "studentId", user.getStudentId(),
                "role", user.getRole().name()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", false, "message", "Invalid username or password"));
        }
    }
}
