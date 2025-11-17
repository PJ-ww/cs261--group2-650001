package com.example.demo.controller;

import com.example.demo.dto.UserLocationRequest;
import com.example.demo.model.UserLocation;
import com.example.demo.service.UserLocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/user/location")
@CrossOrigin(origins = "*")
public class UserLocationController {

    private final UserLocationService userLocationService;

    public UserLocationController(UserLocationService userLocationService) {
        this.userLocationService = userLocationService;
    }

    @PostMapping
    public ResponseEntity<?> updateLocation(@Valid @RequestBody UserLocationRequest request) {
        UserLocation saved = userLocationService.saveLocation(
                request.getUserId(),
                request.getLatitude(),
                request.getLongitude()
        );

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "id", saved.getId()
        ));
    }
}