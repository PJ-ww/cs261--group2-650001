package com.example.demo.model;
/*kim */
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    public enum Role { ROLE_USER, ROLE_ADMIN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String studentId;

    @Enumerated(EnumType.STRING)
    private Role role;
    /*kim */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_bookmarks", // ชื่อตารางใหม่ที่จะสร้าง
        joinColumns = @JoinColumn(name = "user_id"), // คอลัมน์สำหรับ User
        inverseJoinColumns = @JoinColumn(name = "place_id") // คอลัมน์สำหรับ Place
    )
    private Set<Place> bookmarks = new HashSet<>();
    //ให้รับรู้ว่า User 1 คน สามารถมีประวัติตำแหน่ง (UserLocation) ได้หลายอัน kim
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserLocation> locations = new HashSet<>();

    public Long getId() { return id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override public String getPassword() { return null; }
    @Override public String getUsername() { return studentId; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
