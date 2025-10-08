package com.example.demo.model.dto;

public class JwtResponse {

    private String token;

    // Constructor
    public JwtResponse(String token) {this.token = token;}

    // Getter
    public String getToken() {return token;}

    // Setter (ถ้าจำเป็น)
    public void setToken(String token) {this.token = token;}
}
