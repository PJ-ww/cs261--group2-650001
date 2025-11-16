package com.example.demo.service;

import com.example.demo.model.Place;
import com.example.demo.repository.PlaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
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
    
    public Place updatePlace(Long id, Place updatedPlace) {
    	 Place existing = placeRepository.findById(id)
    		.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบสถานที่ ID: " + id));

        existing.setName(updatedPlace.getName());
        existing.setDescription(updatedPlace.getDescription());
        existing.setLatitude(updatedPlace.getLatitude());
        existing.setLongitude(updatedPlace.getLongitude());

        return placeRepository.save(existing);
    }
    
    public void deletePlace(Long id) {
        if (!placeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบสถานที่ ID: " + id);
        }
        placeRepository.deleteById(id);
    }
    //update
    public List<Place> getPlaces(String search, Long categoryId) {
        boolean hasSearch = (search != null && !search.isBlank());
        boolean hasCategory = (categoryId != null);

        // 1) ทั้ง search + category
        if (hasSearch && hasCategory) {
            return placeRepository
                    .findByNameContainingIgnoreCaseAndCategory_Id(search, categoryId);
        }

        // 2) เฉพาะ search
        if (hasSearch) {
            return placeRepository.findByNameContainingIgnoreCase(search);
        }

        // 3) เฉพาะ category
        if (hasCategory) {
            return placeRepository.findByCategory_Id(categoryId);
        }

        // 4) ไม่ส่งอะไรมาเลย
        return placeRepository.findAll();
    }
    //update
}
