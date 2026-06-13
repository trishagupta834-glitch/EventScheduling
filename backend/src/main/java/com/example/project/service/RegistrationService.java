package com.example.project.service;

import com.example.project.model.Event;
import com.example.project.model.Registration;
import com.example.project.model.User;
import com.example.project.repository.EventRepository;
import com.example.project.repository.RegistrationRepository;
import com.example.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Registration registerUserForEvent(String username, Long eventId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        Registration existingRegistration = registrationRepository.findByUserUsername(username).stream()
                .filter(item -> item.getEvent() != null && eventId.equals(item.getEvent().getId()))
                .findFirst()
                .orElse(null);

        if (existingRegistration != null) {
            if ("REJECTED".equals(existingRegistration.getStatus())) {
                existingRegistration.setStatus("PENDING");
                return registrationRepository.save(existingRegistration);
            }
            throw new RuntimeException("User is already registered for this event");
        }

        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setStatus("PENDING");
        return registrationRepository.save(registration);
    }

    public List<Registration> getRegistrationsForEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public List<Registration> getRegistrationsForUser(String username) {
        return registrationRepository.findByUserUsername(username);
    }

    @Transactional
    public Registration approveRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found with id: " + registrationId));

        if (isApproved(registration)) {
            registration.setStatus("APPROVED");
            return registration;
        }

        Event event = registration.getEvent();
        Integer guestCount = event.getGuestCount();
        if (guestCount != null) {
            if (guestCount <= 0) {
                throw new RuntimeException("No seats available for this event");
            }
            event.setGuestCount(guestCount - 1);
        }

        registration.setStatus("APPROVED");
        return registrationRepository.save(registration);
    }

    @Transactional
    public Registration rejectRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found with id: " + registrationId));

        if (isApproved(registration)) {
            Event event = registration.getEvent();
            Integer guestCount = event.getGuestCount();
            if (guestCount != null) {
                event.setGuestCount(guestCount + 1);
            }
        }

        registration.setStatus("REJECTED");
        return registrationRepository.save(registration);
    }

    @Transactional
    public void unregisterUserForEvent(String username, Long eventId) {
        if (!registrationRepository.existsByUserUsernameAndEventId(username, eventId)) {
            throw new RuntimeException("User is not registered for this event");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        Integer guestCount = event.getGuestCount();
        Registration registration = registrationRepository.findByUserUsername(username).stream()
                .filter(item -> item.getEvent() != null && eventId.equals(item.getEvent().getId()))
                .findFirst()
                .orElse(null);

        if (guestCount != null && registration != null && isApproved(registration)) {
            event.setGuestCount(guestCount + 1);
        }
        registrationRepository.deleteByUserUsernameAndEventId(username, eventId);
    }

    private boolean isApproved(Registration registration) {
        return registration != null && "APPROVED".equals(registration.getStatus());
    }
}
