package com.example.demo.repository;

import com.example.demo.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

//update all
@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    // ค้นหาจากชื่อแบบ partial (ไม่สนตัวพิมพ์)
    List<Place> findByNameContainingIgnoreCase(String name);

    // filter ตาม category อย่างเดียว
    List<Place> findByCategory_Id(Long categoryId);

    // ค้นหาจากชื่อ + filter category พร้อมกัน
    List<Place> findByNameContainingIgnoreCaseAndCategory_Id(String name, Long categoryId);
}
