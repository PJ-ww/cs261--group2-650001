package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.List;

@Service
public class TuAuthService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Value("${tu.api.application-key}")
    private String applicationKey;

    private static final String TU_VERIFY_API_URL = "https://restapi.tu.ac.th/api/v1/auth/Ad/verify";

    // ✅ ใช้ username (Student ID) และ password ในการตรวจสอบ
    public boolean authenticateAndLogin(String username, String password) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Application-Key", applicationKey);

        Map<String, String> body = Map.of(
            "UserName", username,
            "PassWord", password
        );

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(TU_VERIFY_API_URL, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                createSpringSecuritySession(username);
                return true;
            }
        } catch (HttpClientErrorException e) {
            System.err.println("TU Auth failed: " + e.getStatusCode());
            return false;
        }

        return false;
    }

    // ✅ สร้าง session ใน Spring Security
    private void createSpringSecuritySession(String studentIdOrEmail) {
        // 🔧 แก้จาก username → studentIdOrEmail
    	Optional<User> userOptional = userRepository.findByStudentId(studentIdOrEmail);
        User user = userOptional.orElseGet(() -> {
            User newUser = new User();
            newUser.setStudentId(studentIdOrEmail);
            // 🔥 assign role อัตโนมัติ ถ้าเป็น admin id ที่ระบุ
            newUser.setRole(isAdminStudent(studentIdOrEmail)
                    ? User.Role.ROLE_ADMIN
                    : User.Role.ROLE_USER);
            return userRepository.save(newUser);
        });

        // ✅ สร้าง token และตั้งค่าลงใน context
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    // ✅ ระบุ student id ที่จะเป็น admin
    private boolean isAdminStudent(String studentId) {
        List<String> adminList = List.of("6709650631");
        return adminList.contains(studentId);
    }
}
