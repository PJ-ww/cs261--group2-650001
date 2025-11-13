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

    // ✅ บังคับให้ส่ง JSON UTF-8 (แก้ปัญหา ???????)
    @GetMapping(produces = "application/json; charset=UTF-8")
    public List<Place> getAllPlaces(@RequestParam(required = false) String search) {
        return placeService.searchPlaces(search);
    }
    
    //update
    @GetMapping
    public List<Place> getPlaces(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) Long categoryId
    ) {
        return placeService.getPlaces(search, categoryId);
    }
    //update

    @PostMapping(produces = "application/json; charset=UTF-8")
    public Place addPlace(@Valid @RequestBody Place place) {
        return placeService.addPlace(place);
    }

    @PutMapping(value = "/{id}", produces = "application/json; charset=UTF-8")
    public Place updatePlace(@PathVariable Long id, @RequestBody Place place) {
        return placeService.updatePlace(id, place);
    }

    @DeleteMapping("/{id}")
    public String deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return "ลบสถานที่เรียบร้อยแล้ว";
    }
    
  
}
