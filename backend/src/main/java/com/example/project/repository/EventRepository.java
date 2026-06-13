package com.example.project.repository;

import com.example.project.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByHashtags(String hashtag);
    List<Event> findByScheduledDateAfterOrderByScheduledDateAsc(LocalDateTime dateTime);
    List<Event> findByScheduledDateBeforeAndCompletedFalse(LocalDateTime dateTime);
    List<Event> findByCreatedByUsername(String username);
}