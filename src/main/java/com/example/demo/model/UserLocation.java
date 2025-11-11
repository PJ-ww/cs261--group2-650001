package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp; // import นี้สำหรับ timestamp อัตโนมัติ
import java.time.LocalDateTime; //import นี้สำหรับเก็บเวลา

@Entity
@Table(name = "user_locations") 
@NoArgsConstructor
public class UserLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;

    @Column(nullable = false)
    private Double latitude; 

    @Column(nullable = false)
    private Double longitude; 
    @CreationTimestamp 
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp; 

    // Constructor เผื่อไว้สำหรับสร้าง object
    public UserLocation(User user, Double latitude, Double longitude) {
        this.user = user;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}