package com.example.demo.controller;

import com.example.demo.model.Bookmark;
import com.example.demo.service.BookmarkService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication; // ยังเก็บไว้เผื่อใช้ในอนาคต

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "*")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @PostMapping
    // ลบ 'Authentication authentication' ออกชั่วคราว หรือไม่ใช้
    public ResponseEntity<?> createBookmark(@RequestBody Bookmark bookmark) { 
    	
    	// *** การจัดการ userId สำหรับการทดสอบชั่วคราว ***
        // หากต้องการบังคับใช้ userId จาก Frontend ให้ใช้:
        Long userId = bookmark.getUserId(); // อนุญาตให้ frontend ส่งมา
        
    	/*
    	// ถ้ามีการใช้ Security จริง ให้ใช้โค้ดนี้:
    	if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "กรุณาเข้าสู่ระบบก่อนเพิ่ม Bookmark"
            ));
        }
    	User user = (User) authentication.getPrincipal();
    	Long userId = user.getId();
    	*/
    	
        if (userId == null || bookmark.getTargetId() == null || bookmark.getTargetType() == null || bookmark.getTargetType().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "ข้อมูลไม่ครบถ้วน (ต้องระบุ userId, targetId และ targetType)"
            ));
        }
        
        bookmark.setUserId(userId); // ตั้งค่า userId ที่ใช้จริง
        
        try {
            Bookmark saved = bookmarkService.addBookmark(bookmark);
            return ResponseEntity.status(201).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        catch (RuntimeException e) {
        	// ตรวจสอบข้อความ Error เพื่อส่ง Response ที่เหมาะสม
        	if (e.getMessage().contains("Bookmark นี้เคยถูกบันทึกแล้ว")) {
        		return ResponseEntity.status(409).body(Map.of("error", e.getMessage())); // 409 Conflict
        	}
            return ResponseEntity.status(500).body(Map.of("error", "เกิดข้อผิดพลาดในระบบ"));
        }
    }
}