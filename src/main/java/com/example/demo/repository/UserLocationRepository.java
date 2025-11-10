package com.example.demo.repository;

import com.example.demo.model.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;

// Interface สามารถ save(), findById(), findAll() ข้อมูลตำแหน่งได้ kim
public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {
}
