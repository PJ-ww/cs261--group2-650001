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
    private final DensityService densityService;

    public PlaceService(PlaceRepository placeRepository,
            DensityService densityService) {
    	this.placeRepository = placeRepository;
    	this.densityService = densityService;
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

        List<Place> places;

        if (hasSearch && hasCategory) {
            places = placeRepository.findByNameContainingIgnoreCaseAndCategory_Id(search, categoryId);
        } else if (hasSearch) {
            places = placeRepository.findByNameContainingIgnoreCase(search);
        } else if (hasCategory) {
            places = placeRepository.findByCategory_Id(categoryId);
        } else {
            places = placeRepository.findAll();
        }

        // 🔥 เติม density ให้ทุก place
        places.forEach(densityService::applyDensity);
        return places;
    }
    
    public Place getPlaceById(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบสถานที่"));
        densityService.applyDensity(place);
        return place;
    }
    //update
}
