package com.example.demo.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookmarks")

public class Bookmark {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private Long userId;       
	    private Long targetId;    
	    private String targetType; 
	    
	    private LocalDateTime createdAt = LocalDateTime.now();

	    public Bookmark() {}

	    public Bookmark(Long userId, Long targetId, String targetType) {
	        this.userId = userId;
	        this.targetId = targetId;
	        this.targetType = targetType;
	        this.createdAt = LocalDateTime.now();
	    }

	    
	    public Long getId() { return id; }
	    public void setId(Long id) { this.id = id; }

	    public Long getUserId() { return userId; }
	    public void setUserId(Long userId) { this.userId = userId; }

	    public Long getTargetId() { return targetId; }
	    public void setTargetId(Long targetId) { this.targetId = targetId; }

	    public String getTargetType() { return targetType; }
	    public void setTargetType(String targetType) { this.targetType = targetType; }
	    
	    public LocalDateTime getCreatedAt() { return createdAt; }
	    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
	}
