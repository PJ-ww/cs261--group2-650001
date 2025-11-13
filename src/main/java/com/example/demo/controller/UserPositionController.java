package com.example.demo.controller;

import com.example.demo.model.UserPosition;
import com.example.demo.service.UserPositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/position")
@CrossOrigin(origins = "*")
public class UserPositionController {

    @Autowired
    private UserPositionService userPositionService;

    // 🛰️ อัปเดตตำแหน่งของผู้ใช้
    @PostMapping
    public ResponseEntity<?> updatePosition(@RequestBody UserPosition pos) {
        if (pos.getUserId() == null || pos.getLatitude() == null || pos.getLongitude() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ข้อมูลไม่ครบถ้วน"));
        }

        UserPosition saved = userPositionService.updatePosition(pos.getUserId(), pos.getLatitude(), pos.getLongitude());
        return ResponseEntity.ok(Map.of(
                "message", "อัปเดตตำแหน่งสำเร็จ",
                "timestamp", saved.getLastUpdate()
        ));
    }

    // 👥 ดึงจำนวนผู้ใช้ใกล้สถานที่ (radius เป็นเมตร)
    @GetMapping("/density")
    public ResponseEntity<?> getDensity(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "100") double radius) {

        int count = userPositionService.countUsersNear(lat, lng, radius);
        return ResponseEntity.ok(Map.of(
                "latitude", lat,
                "longitude", lng,
                "radius_meters", radius,
                "active_users", count
        ));
    }

    // 🧾 ดึงผู้ใช้ที่ active ล่าสุด (เพื่อ debug)
    @GetMapping("/active")
    public ResponseEntity<List<UserPosition>> getActiveUsers() {
        return ResponseEntity.ok(userPositionService.getRecentPositions());
    }
}
