package com.example.demo.service;

import com.example.demo.model.Place;
import com.example.demo.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlaceService {

    @Autowired
    private PlaceRepository repo;

    public List<Place> getAllPlaces() {
        return repo.findAll();
    }

    public List<Place> searchPlaces(String keyword) {
        return repo.findByNameContainingIgnoreCaseOrTagsContainingIgnoreCase(keyword, keyword);
    }
    
    //เพิ่มสถานที่
    public Place addPlace(Place place) {
        return repo.save(place);
    }
    
    //แก้ไขสถานที่
    public Place updatePlace(Long id, Place updatedPlace) {
        Place existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่เพบสถานที่ " + id));

        existing.setName(updatedPlace.getName());
        existing.setDescription(updatedPlace.getDescription());
        existing.setTags(updatedPlace.getTags());
        existing.setLatitude(updatedPlace.getLatitude());
        existing.setLongitude(updatedPlace.getLongitude());

        return repo.save(existing);
    }
    
    //ลบสถานที่
    public void deletePlace(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("ไม่เจอid สภานที่ " + id);
        }
        repo.deleteById(id);
    }
}
