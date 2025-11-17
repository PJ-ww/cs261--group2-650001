package com.example.demo.repository;

import com.example.demo.model.Report;
import com.example.demo.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    // ✅ แก้ไขตรงนี้
    // ใช้ findByUser_Id เพื่อบอก JPA ว่า ให้ไปหา field 'user' 
    // แล้วดู 'id' ที่อยู่ข้างใน field 'user' อีกที
    List<Report> findByUser_Id(Long userId); 
    
    List<Report> findByStatus(ReportStatus status);
}