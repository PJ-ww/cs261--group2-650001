package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "places")
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "ชื่อสถานที่ห้ามว่าง")
    @Column(name = "name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    // เวลาเปิด/ปิด ใช้ NVARCHAR รองรับภาษาไทยได้ เช่น "ปิดถาวร" หรือ "N/A"
    @Column(name = "open_time", columnDefinition = "NVARCHAR(50)")
    private String openTime;

    @Column(name = "close_time", columnDefinition = "NVARCHAR(50)")
    private String closeTime;

    @Column(name = "tags", columnDefinition = "NVARCHAR(255)")
    private String tags;

    @Column(name = "image_url", columnDefinition = "NVARCHAR(500)")
    private String imageUrl;

    // ✅ แก้ตรงนี้ — บังคับใช้ NVARCHAR
    @Column(name = "description", columnDefinition = "NVARCHAR(510)")
    private String description;

    @NotNull(message = "Latitude ต้องมีค่า")
    private Double latitude;

    @NotNull(message = "Longitude ต้องมีค่า")
    private Double longitude;

    // เชื่อมกับ Category (foreign key: category_id)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    // --- Constructors ---
    public Place() {}

    public Place(Long id, String name, String description,
                 String openTime, String closeTime, String tags,
                 Double latitude, Double longitude, String imageUrl,
                 Category category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.tags = tags;
        this.latitude = latitude;
        this.longitude = longitude;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    // --- Getter / Setter ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }

    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}
