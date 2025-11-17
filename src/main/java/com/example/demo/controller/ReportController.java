package com.example.demo.controller;

import com.example.demo.model.Report;
import com.example.demo.model.User;
import com.example.demo.service.ReportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    //  ส่งเรื่อง Report
    @PostMapping("/submit")
    public ResponseEntity<?> submitReport(
            @RequestBody Report report,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body(Map.of("error", "กรุณาเข้าสู่ระบบก่อนส่งเรื่อง"));
        }

        User user = (User) authentication.getPrincipal();
        report.setUserId(user.getId());

        Report saved = reportService.submitReport(report);

        return ResponseEntity.ok(Map.of(
            "message", "ส่งเรื่องสำเร็จ",
            "reportId", saved.getId()
        ));
    }

    // User ดูเรื่องที่ตัวเองเคยส่ง
    @GetMapping("/my")
    public ResponseEntity<?> getMyReports(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body(Map.of("error", "กรุณาเข้าสู่ระบบ"));
        }

        User user = (User) authentication.getPrincipal();
        List<Report> reports = reportService.getUserReports(user.getId());

        return ResponseEntity.ok(reports);
    }

    //  Admin ดูเรื่องทั้งหมด
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllReports(Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        if (user.getRole() != User.Role.ROLE_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "เฉพาะ Admin เท่านั้น"));
        }

        return ResponseEntity.ok(reportService.getAllReports());
    }

    //  Admin เปลี่ยนสถานะเรื่อง
    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        if (user.getRole() != User.Role.ROLE_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "เฉพาะ Admin เท่านั้น"));
        }

        Report updated = reportService.updateStatus(id, status);

        return ResponseEntity.ok(updated);
    }
}
