package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., "อาหารและเครื่องดื่ม", "คณะและอาคารเรียน"
    private String category;

    // ✅ constructor ที่คุณเรียกใช้ใน seeder
    public Category(Long id, String category) {
        this.id = id;
        this.setCategory(category);
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
