package com.example.demo.service;

import com.example.demo.model.Place;
import com.example.demo.repository.PlaceRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlaceService {

    private final PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    public List<Place> searchPlaces(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return placeRepository.findAll();
        }
        return placeRepository.findByNameContainingIgnoreCase(keyword);
    }

    public Place addPlace(Place place) {
        return placeRepository.save(place);
    }
}
