package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.TuAuthService;
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
        String studentId = credentials.get("Username");
        String citizenId = credentials.get("Password");

        boolean success = tuAuthService.authenticateAndLogin(studentId, citizenId);

        if (success) {
            Optional<User> userOpt = userRepository.findByStudentId(studentId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("status", false, "message", "User not found after login"));
            }

            User user = userOpt.get();
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
