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

import java.util.Optional;
import java.util.Map;

@Service
public class TuAuthService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Value("${tu.api.application-key}")
    private String applicationKey;

    private final String TU_VERIFY_API_URL = "https://restapi.tu.ac.th/api/v1/auth/Ad/verify";

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
            System.err.println("!!!!!!!!!! TU API ERROR !!!!!!!!!");
            System.err.println("STATUS CODE: " + e.getStatusCode());
            System.err.println("RESPONSE BODY: " + e.getResponseBodyAsString());
            System.err.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            return false;
        }
        return false;
    }

    private void createSpringSecuritySession(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setName(email);
            user.setRole(User.Role.ROLE_USER);
            user.setPassword("DUMMY_PASSWORD_FOR_TU_USER");
            user.setUsername(email);
            userRepository.save(user);
        }

        // --- แก้ไขการสร้าง authToken ตรงนี้ ---
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            user, // Principal (ตอนนี้เป็น UserDetails แล้ว)
            null, // Credentials
            user.getAuthorities() // ดึง Authorities จากเมธอด getAuthorities() โดยตรง
        );
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}