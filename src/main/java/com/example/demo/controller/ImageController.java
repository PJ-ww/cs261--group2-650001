package com.example.demo.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.controller.DataSeeder;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // อนุญาตให้ frontend (localhost หรืออื่นๆ) เรียกได้
public class ImageController {

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        // ชี้ไปที่โฟลเดอร์ image (ที่อยู่ข้างนอก src)
        Path file = Paths.get("image/" + filename);
        Resource resource = new FileSystemResource(file);

        // ตรวจสอบประเภทไฟล์
        String contentType = "image/jpeg";
        if (filename.endsWith(".png")) {
            contentType = "image/png";
        } else if (filename.endsWith(".webp")) {
            contentType = "image/webp";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // 🔹 ฟังก์ชันตรวจ MIME type จากนามสกุลไฟล์
    private MediaType getMediaTypeFromFilename(String filename) {
        String lower = filename.toLowerCase();

        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;

        // Spring ไม่มี IMAGE_WEBP ในตัว, เราสร้าง MediaType เองได้
        if (lower.endsWith(".webp")) return MediaType.valueOf("image/webp");

        // fallback เผื่อกรณีอื่น ๆ
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
