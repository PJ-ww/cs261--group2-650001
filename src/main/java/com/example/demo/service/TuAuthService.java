package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TuAuthService implements AuthenticationProvider { // <-- IMPLEMENT THIS

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate; // Make sure this is @Bean in AppConfig.java

    @Value("${tu.api.application-key}")
    private String applicationKey;

    private static final String TU_VERIFY_API_URL = "http://restapi.tu.ac.th/api/v1/auth/Ad/verify";

    /**
     * This is the new method Spring Security will call.
     */
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String studentId = authentication.getName();
        String password = authentication.getCredentials().toString();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Application-Key", applicationKey);

            Map<String, String> body = Map.of("UserName", studentId, "PassWord", password);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    TU_VERIFY_API_URL, HttpMethod.POST, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK &&
                    Boolean.TRUE.equals(response.getBody().get("status"))) {
                
                // Auth successful with TU API. Now load/create our local user.
                User user = userRepository.findByStudentId(studentId)
                        .orElseGet(() -> {
                            User newUser = new User();
                            newUser.setStudentId(studentId);
                            newUser.setRole(isAdminStudent(studentId)
                                    ? User.Role.ROLE_ADMIN
                                    : User.Role.ROLE_USER);
                            return userRepository.save(newUser);
                        });

                // Return a *fully authenticated* token.
                // The Principal is now the User object itself.
                return new UsernamePasswordAuthenticationToken(
                        user, // The User object
                        password, // Credentials
                        user.getAuthorities() // Authorities
                );
            } else {
                // TU API rejected the login
                throw new BadCredentialsException("Invalid credentials from TU API");
            }
        } catch (Exception e) {
            System.err.println("❌ TU API error: " + e.getMessage());
            throw new BadCredentialsException("Error during TU authentication", e);
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        // Tells Spring this provider supports the standard Username/Password token
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    // You can DELETE the old "authenticateAndLogin" method, as it's now handled by the "authenticate" method above.

    private boolean isAdminStudent(String studentId) {
        List<String> adminList = List.of(
           "6709650664", 
            "6709650029", "6709650565", "6709650375",
            "6709650193", "6709650367","6709650631"
        );
        return adminList.contains(studentId);
    }
}