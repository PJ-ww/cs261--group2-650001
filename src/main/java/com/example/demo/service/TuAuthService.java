package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TuAuthService {

    @Autowired
    private UserRepository userRepository;

    @Value("${tu.api.application-key}")
    private String applicationKey;

    private static final String TU_VERIFY_API_URL = "https://restapi.tu.ac.th/api/v1/auth/Ad/verify";

    public boolean authenticateAndLogin(String username, String password) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Application-Key", applicationKey);

            Map<String, String> body = Map.of("UserName", username, "PassWord", password);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    TU_VERIFY_API_URL,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK &&
                    Boolean.TRUE.equals(response.getBody().get("status"))) {

                Optional<User> userOptional = userRepository.findByStudentId(username);
                User user = userOptional.orElseGet(() -> {
                    User newUser = new User();
                    newUser.setStudentId(username);
                    newUser.setRole(isAdminStudent(username)
                            ? User.Role.ROLE_ADMIN
                            : User.Role.ROLE_USER);
                    return userRepository.save(newUser);
                });

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);

                return true;
            }
        } catch (Exception e) {
            System.err.println("❌ TU API error: " + e.getMessage());
        }
        return false;
    }

    private boolean isAdminStudent(String studentId) {
        List<String> adminList = List.of(
            "6709650631", "6709650664", "6709650532",
            "6709650029", "6709650565", "6709650375",
            "6709650193", "6709650367"
        );
        return adminList.contains(studentId);
    }
}
