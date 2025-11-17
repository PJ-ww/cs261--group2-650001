package com.example.demo.model;



import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp; 
import java.time.LocalDateTime; 

@Entity
@Table(name = "reports") 

public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;

    @Column(nullable = false)
    private String title; 

    @Column(columnDefinition = "TEXT")
    private String message; 

    @Column(name = "place_name")
    private String placeName; 

    @Enumerated(EnumType.STRING) 
    @Column(nullable = false)
    private ReportStatus status; 

    @CreationTimestamp 
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; 
}
