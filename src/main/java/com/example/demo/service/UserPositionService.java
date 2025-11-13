package com.example.demo.service;

import com.example.demo.model.UserPosition;
import com.example.demo.repository.UserPositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserPositionService {

    @Autowired
    private UserPositionRepository positionRepository;

    // บันทึกตำแหน่งล่าสุดของผู้ใช้
    public UserPosition updatePosition(Long userId, Double latitude, Double longitude) {
        UserPosition pos = new UserPosition(userId, latitude, longitude);
        pos.setLastUpdate(LocalDateTime.now());
        return positionRepository.save(pos);
    }

    // ดึงผู้ใช้ที่ active ในช่วง 5 นาทีล่าสุด
    public List<UserPosition> getRecentPositions() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        return positionRepository.findByLastUpdateAfter(threshold);
    }

    // นับจำนวนผู้ใช้ในรัศมีที่กำหนด
    public int countUsersNear(double lat, double lng, double radiusMeters) {
        double radius = radiusMeters / 111_000.0; // 1 degree ≈ 111 km
        List<UserPosition> recentUsers = getRecentPositions();

        return (int) recentUsers.stream()
                .filter(u -> distance(u.getLatitude(), u.getLongitude(), lat, lng) <= radius)
                .count();
    }

    // ฟังก์ชันคำนวณระยะทางระหว่าง 2 พิกัด
    private double distance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c) / 111.0; 
    }
}
