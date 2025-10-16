package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;      // เช่น "อาหารและเครื่องดื่ม"
    private String category;  // เช่น "คณะและอาคารเรียน"

    // Constructor เปล่าที่ JPA ต้องใช้
    public Category() {}

    // Constructor ที่คุณใช้สร้าง category เองได้
    public Category(Long id, String category) {
        this.id = id;
        this.category = category;
    }

    // Getter & Setter ทั้งหมด
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
