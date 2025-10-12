package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

    // 🧭 ใช้แสดงหน้า login เท่านั้น
    @GetMapping("/login")
    public String loginPage() {
        // จะไปหาไฟล์ login.html ใน /resources/templates/
        return "login";
    }
}
