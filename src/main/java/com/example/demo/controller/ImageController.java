package com.example.demo.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.config.DataSeeder;

// import com.example.demo.controller.DataSeeder; // ไม่จำเป็นต้องใช้ใน ImageController

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // อนุญาตให้ frontend (localhost หรืออื่นๆ) เรียกได้
public class ImageController {

    // 🌟 แก้ไขตรงนี้: เพิ่ม "/images" เพื่อให้ตรงกับที่ frontend เรียกใช้
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        // ชี้ไปที่โฟลเดอร์ image (ที่อยู่ข้างนอก src)
        Path file = Paths.get("image/" + filename);
        Resource resource = new FileSystemResource(file);

        // ตรวจสอบว่าไฟล์มีอยู่และอ่านได้หรือไม่
        if (!resource.exists() || !resource.isReadable()) {
            // คืนค่า 404 Not Found หากไม่พบไฟล์
            return ResponseEntity.notFound().build(); 
        }

        // ตรวจสอบประเภทไฟล์โดยใช้ฟังก์ชัน helper
        MediaType contentType = getMediaTypeFromFilename(filename);

        return ResponseEntity.ok()
                .contentType(contentType)
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