package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminController {
	
    // 🧭 Dashboard - ถ้าใช้ Thymeleaf จะ render จาก templates/admin/dashboard.html
    // ถ้าไม่มี template จะ fallback ไป static/admin/dashboard.html
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Admin Dashboard");
        return "admin/dashboard"; // ✅ templates/admin/dashboard.html
    }

    // 📂 Category Management
    @GetMapping("/category")
    public String category(Model model) {
        model.addAttribute("pageTitle", "Manage Categories");
        return "admin/category"; // ✅ templates/admin/category.html
    }

    // ➕ Add new location
    @GetMapping("/add-location")
    public String addLocation(Model model) {
        model.addAttribute("pageTitle", "Add Location");
        return "admin/add-location"; // ✅ templates/admin/add-location.html
    }

    // 🏠 Redirect /admin → /admin/dashboard
    @GetMapping
    public String redirectToDashboard() {
        return "redirect:/admin/dashboard";
    }
}
