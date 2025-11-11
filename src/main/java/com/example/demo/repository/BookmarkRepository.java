package com.example.demo.repository;

import com.example.demo.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);
    List<Bookmark> findByUserId(Long userId);

}

