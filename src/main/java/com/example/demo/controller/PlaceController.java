package com.example.demo.controller;

import com.example.demo.model.Place;
import com.example.demo.service.PlaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class PlaceController {

    @Autowired
    private PlaceService service;

    @ResponseBody
    @GetMapping("/api/places")
    public List<Place> getAllPlaces() {
        return service.getAllPlaces();
    }

    @ResponseBody
    @GetMapping("/api/places/search")
    public List<Place> searchPlaces(@RequestParam String query) {
        return service.searchPlaces(query);
    }
}