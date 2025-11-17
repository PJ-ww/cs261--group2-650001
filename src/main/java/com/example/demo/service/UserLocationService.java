package com.example.demo.service;

import com.example.demo.model.UserLocation;
import com.example.demo.repository.UserLocationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class UserLocationService {

    private final UserLocationRepository userLocationRepository;

    public UserLocationService(UserLocationRepository userLocationRepository) {
        this.userLocationRepository = userLocationRepository;
    }

    public UserLocation saveLocation(Long userId, Double latitude, Double longitude) {
        UserLocation loc = new UserLocation(userId, latitude, longitude);
        return userLocationRepository.save(loc);
    }
    
    @Scheduled(fixedRate = 60_000)
    public void cleanupOldLocations() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        userLocationRepository.deleteByTimestampBefore(cutoff);
    }
}