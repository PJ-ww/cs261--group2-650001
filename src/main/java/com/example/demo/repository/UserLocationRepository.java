package com.example.demo.repository;

import com.example.demo.model.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {

    List<UserLocation> findByTimestampAfter(LocalDateTime cutoff);

    void deleteByTimestampBefore(LocalDateTime cutoff);
}