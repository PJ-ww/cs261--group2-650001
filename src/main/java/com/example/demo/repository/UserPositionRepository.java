package com.example.demo.repository;

import com.example.demo.model.UserPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface UserPositionRepository extends JpaRepository<UserPosition, Long> {
    List<UserPosition> findByLastUpdateAfter(LocalDateTime time);
}
