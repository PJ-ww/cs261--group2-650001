package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ บังคับใช้ NVARCHAR เพื่อเก็บภาษาไทยได้
    @Column(name = "name", columnDefinition = "NVARCHAR(255)")
    private String name;      

    @Column(name = "category", columnDefinition = "NVARCHAR(255)")
    private String category;  

    public Category() {}

    public Category(Long id, String category) {
        this.id = id;
        this.category = category;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
