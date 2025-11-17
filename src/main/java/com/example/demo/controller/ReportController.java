package com.example.demo.controller;

import com.example.demo.model.Report;
import com.example.demo.model.User;
import com.example.demo.service.ReportService;
// ✅ 1. เพิ่ม import นี้
import com.example.demo.repository.UserRepository;

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

    // ✅ 2. Inject UserRepository เข้ามา
    @Autowired
    private UserRepository userRepository;

    // ส่งเรื่อง Report 
    @PostMapping("/submit")
    public ResponseEntity<?> submitReport(
            @RequestBody Report report,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body(Map.of("error", "กรุณาเข้าสู่ระบบก่อนส่งเรื่อง"));
        }

        // 3. ดึง User ที่ "Detached" (ลอยๆ) ออกมาจาก Security
        User detachedUser = (User) authentication.getPrincipal();
        
        // ✅ 4. ใช้ ID จาก User นั้น ค้นหา User ตัวจริงที่ "Managed" (เชื่อมกับ DB)
        //    นี่คือการยืนยันว่า User นี้มีอยู่จริงในตาราง users
        User managedUser = userRepository.findById(detachedUser.getId())
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้ใช้ในระบบ"));

        // ✅ 5. สั่ง setUser โดยใช้ User ที่ "Managed"
        report.setUser(managedUser);

        Report saved = reportService.submitReport(report);

        return ResponseEntity.ok(Map.of(
                "message", "ส่งเรื่องสำเร็จ",
                "reportId", saved.getId()
        ));
    }

    //  User ดูเรื่องที่ตัวเองเคยส่ง
    @GetMapping("/my")
    public ResponseEntity<?> getMyReports(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body(Map.of("error", "กรุณาเข้าสู่ระบบ"));
        }

        User user = (User) authentication.getPrincipal();
        List<Report> reports = reportService.getUserReports(user.getId());

        return ResponseEntity.ok(reports);
    }

    // Admin ดูเรื่องทั้งหมด 
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

        try {
            Report updated = reportService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}