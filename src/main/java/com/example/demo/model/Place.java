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
    @Column(nullable = false)
    private String name;

    private String description;
    
    @NotNull(message = "Latitude ต้องมีค่า")
    private Double latitude;
    
    @NotNull(message = "Longitude ต้องมีค่า")
    private Double longitude;

    public Place() {}

    public Place(String name, String description, Double latitude, Double longitude) {
        this.name = name;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // --- Getter / Setter ---
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
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Double getLatitude() {
		return latitude;
	}
	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}
	public Double getLongitude() {
		return longitude;
	}
	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}
}
