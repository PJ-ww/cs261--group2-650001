package com.example.demo.controller;

import com.example.demo.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller; // <-- เปลี่ยนจาก RestController
import org.springframework.ui.Model; // <-- import Model
import org.springframework.web.bind.annotation.GetMapping;


@Controller // <-- *** เปลี่ยนจาก @RestController เป็น @Controller ***
public class UserController {

    // แก้ไขเมธอดนี้
    @GetMapping("/user/profile")
    public String getUserProfile(@AuthenticationPrincipal User user, Model model) {
        // @AuthenticationPrincipal User user จะดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่มาให้
        // ซึ่งเป็น User object จาก Database ของเรา

        // เพิ่มข้อมูลที่จะส่งไปให้หน้า HTML
        model.addAttribute("name", user.getName());
        model.addAttribute("email", user.getEmail());
        model.addAttribute("role", user.getRole().name());

        // return ชื่อไฟล์ HTML (ไม่ต้องใส่นามสกุล .html)
        return "profile";
    }

    @GetMapping("/admin/dashboard")
    public String getAdminDashboard() {
        // เราอาจจะสร้างหน้า dashboard.html สำหรับ Admin ต่อไป
        return "admin_dashboard"; // สมมติว่ามีไฟล์ admin_dashboard.html
    }

    @GetMapping("/")
    public String getHomePage() {
        return "home"; // สมมติว่ามีไฟล์ home.html
    }
}