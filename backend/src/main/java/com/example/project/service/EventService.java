package com.example.project.service;

import com.example.project.model.Event;
import com.example.project.model.User;
import com.example.project.repository.EventRepository;
import com.example.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public List<Event> getAllEvents() {
        autoCompletePastEvents();
        return eventRepository.findAll();
    }

    @Transactional
    public List<Event> getApprovedEvents() {
        autoCompletePastEvents();
        return eventRepository.findAll().stream()
                .filter(this::isApproved)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<Event> getUpcomingEvents() {
        autoCompletePastEvents();
        return eventRepository.findByScheduledDateAfterOrderByScheduledDateAsc(LocalDateTime.now());
    }

    @Transactional
    public List<Event> getApprovedUpcomingEvents() {
        autoCompletePastEvents();
        return eventRepository.findByScheduledDateAfterOrderByScheduledDateAsc(LocalDateTime.now()).stream()
                .filter(this::isApproved)
                .collect(Collectors.toList());
    }

    @Transactional
    public Event getEventById(Long id) {
        autoCompletePastEvents();
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public List<Event> searchByHashtag(String hashtag) {
        return eventRepository.findByHashtags(hashtag).stream()
                .filter(this::isApproved)
                .collect(Collectors.toList());
    }

    public Event createEvent(Event event, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        event.setCreatedBy(creator);
        event.setApprovalStatus("PENDING");
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event details) {
        Event event = getEventById(id);
        event.setTitle(details.getTitle());
        event.setDescription(details.getDescription());
        event.setScheduledDate(details.getScheduledDate());
        event.setEventType(details.getEventType());
        event.setGuestCount(details.getGuestCount());
        event.setVenue(details.getVenue());
        event.setSpeaker(details.getSpeaker());
        event.setHashtags(details.getHashtags());
        return eventRepository.save(event);
    }

    public Event approveEvent(Long id) {
        Event event = getEventById(id);
        event.setApprovalStatus("APPROVED");
        return eventRepository.save(event);
    }

    public Event rejectEvent(Long id) {
        Event event = getEventById(id);
        event.setApprovalStatus("REJECTED");
        return eventRepository.save(event);
    }

    private void autoCompletePastEvents() {
        List<Event> pastEvents = eventRepository.findByScheduledDateBeforeAndCompletedFalse(LocalDateTime.now());
        if (!pastEvents.isEmpty()) {
            pastEvents.forEach(event -> {
                event.setCompleted(true);
                event.setCompletedAt(LocalDateTime.now());
            });
            eventRepository.saveAll(pastEvents);
        }
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete. Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    public List<Event> getEventsByCreator(String username) {
        return eventRepository.findByCreatedByUsername(username);
    }

    public Event markEventAsCompleted(Long id) {
        Event event = getEventById(id);
        event.setCompleted(true);
        event.setCompletedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    public boolean isApproved(Event event) {
        return event != null && (event.getApprovalStatus() == null || "APPROVED".equals(event.getApprovalStatus()));
    }
}
