package com.example.demo.service;

import com.example.demo.model.Place;
import com.example.demo.model.UserLocation;
import com.example.demo.repository.UserLocationRepository;
import com.example.demo.util.GeoUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DensityService {

    private final UserLocationRepository userLocationRepository;

    // ปรับได้ตามที่ทีมตกลง (เมตร)
    private static final double RADIUS_METERS = 150.0;

    public DensityService(UserLocationRepository userLocationRepository) {
        this.userLocationRepository = userLocationRepository;
    }

    public void applyDensity(Place place) {
        if (place.getLatitude() == null || place.getLongitude() == null) {
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        List<UserLocation> recent = userLocationRepository.findByTimestampAfter(cutoff);

        long count = recent.stream()
                .filter(loc -> loc.getLatitude() != null && loc.getLongitude() != null)
                .filter(loc -> GeoUtils.distanceInMeters(
                        place.getLatitude(), place.getLongitude(),
                        loc.getLatitude(), loc.getLongitude()
                ) <= RADIUS_METERS)
                .map(UserLocation::getUserId)
                .distinct()
                .count();

        place.setDensityScore((int) count);
        place.setDensityLevel(mapToLevel(count));
        place.setDensityComputedAt(LocalDateTime.now());
    }

    private String mapToLevel(long count) {
        // TODO: ปรับ threshold ตามโจทย์จริง
        if (count == 0) return "LOW";
        if (count <= 5) return "LOW";
        if (count <= 15) return "MEDIUM";
        return "HIGH";
    }
}