package com.example.demo.repository;

import com.example.demo.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

// save(), findById(), findAll() ข้อมูลรายงาน
public interface ReportRepository extends JpaRepository<Report, Long> {
}