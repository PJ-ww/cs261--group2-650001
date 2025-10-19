package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // เผื่อไว้ — ให้ static resource ปกติยังทำงานอยู่
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
    
    

    /**
     * ✅ Controller สำหรับโหลดไฟล์ภาษาไทยโดยเฉพาะ
     * ตัวนี้จะจับ path /images/** แล้ว decode path ก่อนอ่านไฟล์จริง
     */
    @RestController
    public static class ImageController {

        @GetMapping("/images/{fileName:.+}")
        public ResponseEntity<Resource> serveImage(@PathVariable String fileName) throws IOException {
            // ถอดรหัสชื่อไฟล์ (เผื่อมี %E0%B8%...)
            String decodedName = URLDecoder.decode(fileName, StandardCharsets.UTF_8.name());
            Resource resource = new ClassPathResource("/static/images/" + decodedName);

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .body(resource);
            } else {
                // fallback ถ้าภาพไม่เจอ
                Resource fallback = new ClassPathResource("/static/images/default.png");
                return ResponseEntity.status(404).body(fallback);
            }
        }
    }
}
