package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.dto.JwtResponse;
import com.example.demo.model.dto.LoginRequest;
import com.example.demo.service.JwtService;

//Example in AuthController.java
@RestController
@RequestMapping("/api")
public class AuthController {

 @Autowired
 private AuthenticationManager authenticationManager;

 @Autowired
 private JwtService jwtService;

 @PostMapping("/login")
 public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
     // 1. Authenticate the user credentials
     Authentication authentication = authenticationManager.authenticate(
         new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
     );
     
     // 2. Load the authenticated user details
     UserDetails userDetails = (UserDetails) authentication.getPrincipal();
     
     // 3. Generate the JWT
     String token = jwtService.generateToken(userDetails);
     
     // 4. Return the Token
     return ResponseEntity.ok(new JwtResponse(token)); 
 }
}
//You'll need to define LoginRequest (username, password) and JwtResponse (token) classes.