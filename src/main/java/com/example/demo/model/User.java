package com.example.demo.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
public class User implements UserDetails { // <-- เพิ่ม implements UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String password;

    @Column(unique = true, nullable = false)
    private String username;

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }

    // Getters and Setters (เหมือนเดิม)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    @Override // Override getUsername from UserDetails
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }


    // --- vvvvv เมธอดที่เพิ่มเข้ามาจาก UserDetails vvvvv ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // เมธอดนี้สำคัญที่สุด ใช้สำหรับส่ง Role ของเราให้ Spring Security
        return Collections.singletonList(new SimpleGrantedAuthority(this.role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // บัญชีไม่หมดอายุ
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // บัญชีไม่ถูกล็อก
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // รหัสผ่านไม่หมดอายุ
    }

    @Override
    public boolean isEnabled() {
        return true; // บัญชีเปิดใช้งาน
    }
}