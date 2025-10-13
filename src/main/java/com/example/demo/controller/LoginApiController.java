package com.example.demo.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class LoginApiController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("Username");
        String password = credentials.get("Password");

        String tuApiUrl = "https://restapi.tu.ac.th/api/v1/auth/Ad/verify";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Application-Key",
                "TU7ba945dfd7eab36cb292085fe2193cf101b2cb94388c2721d105e34eb6df0a7378f327eddfbee7820e251535fbb12593");

        Map<String, String> body = new HashMap<>();
        body.put("UserName", username);
        body.put("PassWord", password); 

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    tuApiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            System.out.println("TU API response: " + response.getBody()); // ✅ debug log

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("status", false, "message", "Login failed or TU API error"));
        }
    }
}
