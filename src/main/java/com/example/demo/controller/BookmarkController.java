package com.example.demo.controller;

import com.example.demo.model.Bookmark;
import com.example.demo.service.BookmarkService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "*")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @PostMapping
    public ResponseEntity<?> createBookmark(@RequestBody Bookmark bookmark,Authentication authentication) {
    	if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "กรุณาเข้าสู่ระบบก่อนเพิ่ม Bookmark"
            ));
        }
    	/*User user = (User) authentication.getPrincipal();
        if (user.getRole() == User.Role.ROLE_GUEST) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "คุณไม่มีสิทธิ์เพิ่ม Bookmark"
            ));
        }*/
        
        if (bookmark.getTargetId() == null || bookmark.getTargetType() == null || bookmark.getTargetType().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "ข้อมูลไม่ครบถ้วน (ต้องระบุ userId, targetId และ targetType)"
            ));
        }
        
        try {
            Bookmark saved = bookmarkService.addBookmark(bookmark);
            return ResponseEntity.status(201).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", "เกิดข้อผิดพลาดในระบบ"));
        }
    }
}