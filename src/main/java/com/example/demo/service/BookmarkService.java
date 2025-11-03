package com.example.demo.service;

import com.example.demo.model.Bookmark;
import com.example.demo.repository.BookmarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}