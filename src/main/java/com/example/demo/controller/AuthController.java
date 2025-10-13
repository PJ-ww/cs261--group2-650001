package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

    @GetMapping("/login")
    public String loginPage() {
        // ให้ forward ไปที่ไฟล์ login.html ที่อยู่ใน /static
        return "forward:/login.html";
    }
}
