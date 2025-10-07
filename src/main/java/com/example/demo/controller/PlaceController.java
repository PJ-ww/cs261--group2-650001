package com.example.demo.controller;

import com.example.demo.model.Place;
import com.example.demo.service.PlaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    
    //api  เพิ่ม
    @SuppressWarnings("null")
	@PostMapping
    public ResponseEntity<Place> addPlace(@RequestBody Place place) {
        PlaceService placeService = null;
		Place newPlace = placeService.addPlace(place);
        return ResponseEntity.ok(newPlace);
    }
    
    //api แก้ไข
    @PutMapping("/{id}")
    public ResponseEntity<Place> updatePlace(@PathVariable Long id, @RequestBody Place place) {
        PlaceService placeService = null;
		@SuppressWarnings("null")
		Place updated = placeService.updatePlace(id, place);
        return ResponseEntity.ok(updated);
    }
    
   
    //api ลบ
    @SuppressWarnings("null")
	@DeleteMapping("/{id}")
    public ResponseEntity<String> deletePlace(@PathVariable Long id) {
        PlaceService placeService = null;
		placeService.deletePlace(id);
        return ResponseEntity.ok("Place deleted successfully");
    }
}