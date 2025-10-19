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
@CrossOrigin(origins = "*") // ✅ อนุญาตทุก origin
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // ✅ ดึงข้อมูลหมวดหมู่ทั้งหมด (GET /api/categories)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // ✅ ดึงข้อมูลหมวดหมู่ตาม ID (GET /api/categories/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ เพิ่มหมวดหมู่ใหม่ (POST /api/categories)
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // ✅ แก้ไขหมวดหมู่ (PUT /api/categories/{id})
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category categoryDetails) {

        return categoryRepository.findById(id)
                .map(category -> {
                    category.setCategory(categoryDetails.getCategory()); // 👈 ใช้ฟิลด์ category แทน name
                    Category updatedCategory = categoryRepository.save(category);
                    return ResponseEntity.ok(updatedCategory);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ ลบหมวดหมู่ (DELETE /api/categories/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
