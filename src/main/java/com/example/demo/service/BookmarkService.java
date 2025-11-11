package com.example.demo.service;

import com.example.demo.model.Bookmark;
import com.example.demo.repository.BookmarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    public Bookmark addBookmark(Bookmark bookmark) {
        boolean exists = bookmarkRepository
                .findByUserIdAndTargetIdAndTargetType(
                        bookmark.getUserId(),
                        bookmark.getTargetId(),
                        bookmark.getTargetType())
                .isPresent();

        if (exists) {
            throw new RuntimeException("Bookmark นี้เคยถูกบันทึกแล้ว");
        }

        return bookmarkRepository.save(bookmark);
    }
    
    public List<Bookmark> getBookmarksByUser(Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }
    
    public void deleteBookmark(Long userId, Long targetId, String targetType) {
        Bookmark bookmark = bookmarkRepository
                .findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Bookmark ที่ต้องการลบ"));

        bookmarkRepository.delete(bookmark);
    }
}