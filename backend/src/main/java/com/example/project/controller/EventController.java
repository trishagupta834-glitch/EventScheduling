package com.example.project.controller;

import com.example.project.model.*;
import com.example.project.service.EventService;
import com.example.project.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    // Accessible by both User and Admin to populate the calendar
    @GetMapping
    public List<Event> getAllEvents(Authentication authentication) {
        if (isManager(authentication)) {
            return eventService.getAllEvents();
        }
        if (isAdmin(authentication)) {
            return eventService.getEventsByCreator(authentication.getName());
        }
        return eventService.getApprovedEvents();
    }

    // Accessible by User and Admin - Fetch only events scheduled in the future
    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents(Authentication authentication) {
        if (isManager(authentication)) {
            return eventService.getUpcomingEvents();
        }
        if (isAdmin(authentication)) {
            LocalDateTime now = LocalDateTime.now();
            return eventService.getEventsByCreator(authentication.getName()).stream()
                    .filter(event -> event.getScheduledDate() != null && event.getScheduledDate().isAfter(now))
                    .toList();
        }
        return eventService.getApprovedUpcomingEvents();
    }

    // Accessible by Admin - Fetch all events (past and future) created by the logged-in admin
    @GetMapping("/managed")
    public List<Event> getEventsByAdmin(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in.");
        }
        return eventService.getEventsByCreator(authentication.getName());
    }

    // Accessible by User and Admin - Fetch details for a specific event (e.g., when clicking the 'i' symbol)
    @GetMapping("/{id}")
    public Event getEventById(@PathVariable("id") Long id, Authentication authentication) {
        Event event = eventService.getEventById(id);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imperial ritual not found.");
        }
        if (!isAdminOrManager(authentication) && !eventService.isApproved(event)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imperial ritual not found.");
        }
        return event;
    }

    // Accessible by User and Admin - Search for events by a specific hashtag
    @GetMapping("/search")
    public List<Event> searchByHashtag(@RequestParam("hashtag") String hashtag) {
        return eventService.searchByHashtag(hashtag);
    }

    // Accessible by User only - Register for an event clicked on the calendar
    @PostMapping("/register/{eventId}")
    public Registration registerForEvent(@PathVariable("eventId") Long eventId, Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to register.");
        }
        Event event = eventService.getEventById(eventId);
        if (!eventService.isApproved(event)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This event is not approved for registration.");
        }
        return registrationService.registerUserForEvent(authentication.getName(), eventId);
    }

    @GetMapping("/registrations/me")
    public List<Registration> getMyRegistrations(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to view registrations.");
        }
        return registrationService.getRegistrationsForUser(authentication.getName());
    }

    @PostMapping("/{eventId}/unregister")
    public void unregisterForEvent(@PathVariable("eventId") Long eventId, Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required to unregister.");
        }
        registrationService.unregisterUserForEvent(authentication.getName(), eventId);
    }

    // Accessible by Admin only - Set new events via the calendar
    @PostMapping
    public Event createEvent(@RequestBody Event event, Authentication authentication) {
        validateAdmin(authentication);

        if (event == null || event.getStart() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ritual commencement time must be specified.");
        }

        // Validation: Prevent scheduling overlapping rituals at the exact same commencement time
        List<Event> allEvents = eventService.getAllEvents();
        boolean hasConflict = allEvents != null && allEvents.stream()
                .anyMatch(existing -> existing.getStart() != null && event.getStart().isEqual(existing.getStart()));

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An imperial ritual is already scheduled for this commencement time.");
        }

        return eventService.createEvent(event, authentication.getName());
    }

    // Accessible by Admin only - Modify event details
    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable("id") Long id, @RequestBody Event details, Authentication authentication) {
        validateAdmin(authentication);
        return eventService.updateEvent(id, details);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable("id") Long id, Authentication authentication) {
        validateAdmin(authentication);
        eventService.deleteEvent(id);
    }

    // Accessible by Admin only - Mark an event as completed
    @PutMapping("/{id}/complete")
    public Event markEventAsCompleted(@PathVariable("id") Long id, Authentication authentication) {
        validateAdmin(authentication);
        return eventService.markEventAsCompleted(id);
    }

    @PutMapping("/{id}/approve")
    public Event approveEvent(@PathVariable("id") Long id, Authentication authentication) {
        validateManager(authentication);
        return eventService.approveEvent(id);
    }

    @PutMapping("/{id}/reject")
    public Event rejectEvent(@PathVariable("id") Long id, Authentication authentication) {
        validateManager(authentication);
        return eventService.rejectEvent(id);
    }

    private void validateAdmin(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Imperial credentials required.");
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: High Priest clearance required.");
        }
    }

    // Accessible by Admin and Manager
    @GetMapping("/{id}/registrations")
    public List<Registration> getRegistrants(@PathVariable("id") Long id, Authentication authentication) {
        validateAdminOrManager(authentication);
        return registrationService.getRegistrationsForEvent(id);
    }

    private void validateManager(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Imperial credentials required.");
        }
        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
        if (!isManager) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Manager clearance required.");
        }
    }

    @PutMapping("/registrations/{registrationId}/approve")
    public Registration approveRegistration(@PathVariable("registrationId") Long registrationId, Authentication authentication) {
        validateAdminOrManager(authentication);
        return registrationService.approveRegistration(registrationId);
    }

    @PutMapping("/registrations/{registrationId}/reject")
    public Registration rejectRegistration(@PathVariable("registrationId") Long registrationId, Authentication authentication) {
        validateAdminOrManager(authentication);
        return registrationService.rejectRegistration(registrationId);
    }

    private void validateAdminOrManager(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Imperial credentials required.");
        }
        boolean isAdminOrManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        if (!isAdminOrManager) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Manager clearance required.");
        }
    }

    private boolean isAdminOrManager(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isManager(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
    }
}
