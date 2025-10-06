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
}
