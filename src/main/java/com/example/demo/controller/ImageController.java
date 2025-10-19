package com.example.project.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // อนุญาตให้ frontend (localhost หรืออื่นๆ) เรียกได้
public class ImageController {

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads/" + filename);
            Resource resource = new FileSystemResource(file);

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // ✅ ตรวจสอบชนิดไฟล์จากนามสกุล
            MediaType mediaType = getMediaTypeFromFilename(filename);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
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
