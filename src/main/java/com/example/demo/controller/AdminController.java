package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
// import jakarta.servlet.http.HttpSession; // <-- This line was removed

@Controller
@RequestMapping("/admin")
public class AdminController {
	
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Admin Dashboard");
        return "admin/dashboard"; 
    }

    @GetMapping("/category")
    public String category(Model model) {
        model.addAttribute("pageTitle", "Manage Categories");
        return "admin/category"; 
    }

    @GetMapping("/add-location")
    public String addLocation(Model model) {
        model.addAttribute("pageTitle", "Add Location");
        return "admin/add-location"; 
    }

    @GetMapping
    public String redirectToDashboard() {
        return "redirect:/admin/dashboard";
    }
    
    @GetMapping("/admin-map")
    public String adminMap(Model model) {
        model.addAttribute("pageTitle", "Admin Map");
        return "admin/admin-map"; 
    }

}