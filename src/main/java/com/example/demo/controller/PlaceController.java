package com.example.demo.controller;

import com.example.demo.model.Place;
import com.example.demo.service.PlaceService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping
    public List<Place> getAllPlaces(@RequestParam(required = false) String search) {
        return placeService.searchPlaces(search);
    }

    @PostMapping
    public Place addPlace(@Valid @RequestBody Place place) {
        return placeService.addPlace(place);
    }
    
    @PutMapping("/{id}")
    public Place updatePlace(@PathVariable Long id, @RequestBody Place place) {
        return placeService.updatePlace(id, place);
    }
    
    @DeleteMapping("/{id}")
    public String deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return "ลบสถานที่เรียบร้อยแล้ว";
    }

}