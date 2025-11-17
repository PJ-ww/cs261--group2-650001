package com.example.demo.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore 
    private User user;

    // ✅ 1. แก้ไข title
    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    // ✅ 2. แก้ไข message (ใช้ NVARCHAR(MAX) แทน TEXT เพื่อรองรับ Unicode)
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String message;

    // ✅ 3. แก้ไข placeName
    @Column(name = "place_name", columnDefinition = "NVARCHAR(255)")
    private String placeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.NEW;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ... (ส่วน Getter/Setter/อื่นๆ เหมือนเดิม) ...
    public Report() {
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPlaceName() { return placeName; }
    public void setPlaceName(String placeName) { this.placeName = placeName; }
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @JsonProperty("userId")
    public Long getUserId() {
        if (user != null) {
            return user.getId();
        }
        return null;
    }
}