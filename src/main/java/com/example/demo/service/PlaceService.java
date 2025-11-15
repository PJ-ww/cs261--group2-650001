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
        
        // 1. ตรวจสอบว่ามีคำค้นหาหรือไม่
        if (search != null && !search.trim().isEmpty()) {
            
            // 2. ถ้ามี categoryId ด้วย ให้ค้นหาแบบจำกัดหมวดหมู่
            if (categoryId != null) {
                return placeRepository.findByNameContainingIgnoreCaseAndCategory_Id(search, categoryId);
            } 
            
            // 3. ถ้าไม่มี categoryId ให้ค้นหาจากชื่ออย่างเดียว
            return placeRepository.findByNameContainingIgnoreCase(search);

        } else if (categoryId != null) {
            // 4. ถ้าไม่มีคำค้นหา แต่มี categoryId ให้ค้นหาตามหมวดหมู่
            // (คุณอาจต้องเพิ่ม findByCategoryId ใน Repository)
            // return placeRepository.findByCategoryId(categoryId); 
        }
        
        // 5. กรณีไม่มีทั้ง search และ categoryId ให้คืนค่าทั้งหมด
        return placeRepository.findAll();
    }
    //update
}
