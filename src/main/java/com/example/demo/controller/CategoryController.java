//*kim
package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*") // เพิ่ม CrossOrigin ให้เหมือน Controller อื่น
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // API สำหรับดึงข้อมูลหมวดหมู่ทั้งหมด (GET /api/categories)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // API สำหรับดึงข้อมูลหมวดหมู่ตาม ID (GET /api/categories/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok) // ถ้าเจอ -> ส่ง 200 OK พร้อมข้อมูล
                .orElse(ResponseEntity.notFound().build()); // ถ้าไม่เจอ -> ส่ง 404 Not Found
    }

    // API สำหรับสร้างหมวดหมู่ใหม่ (POST /api/categories)
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // API สำหรับอัปเดตข้อมูลหมวดหมู่ (PUT /api/categories/{id})
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(categoryDetails.getName()); // อัปเดตชื่อ
                    Category updatedCategory = categoryRepository.save(category);
                    return ResponseEntity.ok(updatedCategory); // ส่ง 200 OK พร้อมข้อมูลที่อัปเดตแล้ว
                })
                .orElse(ResponseEntity.notFound().build()); // ถ้าไม่เจอ -> ส่ง 404 Not Found
    }

    // API สำหรับลบหมวดหมู่ (DELETE /api/categories/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok().build(); // ส่ง 200 OK เพื่อยืนยันว่าลบสำเร็จ
                })
                .orElse(ResponseEntity.notFound().build()); // ถ้าไม่เจอ -> ส่ง 404 Not Found
    }
}
