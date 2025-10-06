package com.example.demo.controller;

import com.example.demo.entity.Place;
import com.example.demo.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "*")
public class PlaceController {

    @Autowired
    private PlaceRepository placeRepository;

    @GetMapping
    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    @GetMapping("/search")
    public List<Place> searchPlaces(@RequestParam String query) {
        return placeRepository.findByNameContainingIgnoreCaseOrTagsContainingIgnoreCase(query, query);
    }
}