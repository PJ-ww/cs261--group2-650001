package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PlaceSeeder implements CommandLineRunner {

    private final DataSeeder dataSeeder;

    // ✅ ใช้ Constructor Injection
    public PlaceSeeder(DataSeeder dataSeeder) {
        this.dataSeeder = dataSeeder;
    }

    @Override
    public void run(String... args) {
        System.out.println("⚙️ เรียกใช้ DataSeeder ผ่าน PlaceSeeder...");
        dataSeeder.seedAllData();
        System.out.println("🏁 PlaceSeeder ทำงานเสร็จเรียบร้อย!");
    }
}
