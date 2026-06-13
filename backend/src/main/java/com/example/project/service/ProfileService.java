package com.example.project.service;

import com.example.project.model.*;
import com.example.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public User getProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public User updateProfile(String username, Map<String, String> updates) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        String name = updates.get("name");
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }

        String phoneNumber = updates.get("phoneNumber");
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber.trim());
        }

        String roleStr = updates.get("role");
        if (roleStr != null && !roleStr.isBlank()) {
            try {
                Role role = Role.valueOf(roleStr);
                user.setRole(role);
                user.setStatus(String.valueOf(role.getDatabaseValue()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid role strings
            }
        }

        return userRepository.save(user);
    }

    public Map<String, Object> getAnalytics(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Map<String, Object> response = new HashMap<>();

        if (user.getRole() == Role.ROLE_USER) {
            List<Registration> regs = registrationRepository.findByUserUsername(username);
            response.put("totalAttended", regs.size());
            response.put("registrationTrend", toSeries(
                    regs.stream()
                            .map(r -> r.getEvent().getScheduledDate().toLocalDate())
                            .collect(Collectors.toList())
            ));

        } else if (user.getRole() == Role.ROLE_ADMIN) {
            List<Event> createdEvents = eventRepository.findByCreatedByUsername(username);
            response.put("totalCreated", createdEvents.size());
            response.put("createdEventTrend", toSeries(
                    createdEvents.stream()
                            .map(e -> e.getCreatedAt().toLocalDate())
                            .collect(Collectors.toList())
            ));
        } else if (user.getRole() == Role.ROLE_MANAGER) {
            List<User> allUsers = userRepository.findAll();
            List<Event> allEvents = eventRepository.findAll();
            response.put("totalSystemUsers", allUsers.size());
            response.put("totalSystemEvents", allEvents.size());
            response.put("totalSystemRegistrations", registrationRepository.count());
            response.put("systemEventTrend", toSeries(
                    allEvents.stream()
                            .map(e -> e.getCreatedAt().toLocalDate())
                            .collect(Collectors.toList())
            ));
            response.put("systemUserTrend", toSeries(
                    allUsers.stream()
                            .map(User::getCreatedAt)
                            .filter(Objects::nonNull)
                            .map(java.time.LocalDateTime::toLocalDate)
                            .collect(Collectors.toList())
            ));
        }
        response.put("role", user.getRole().name());
        response.put("username", user.getUsername());
        return response;
    }

    private List<Map<String, Object>> toSeries(List<LocalDate> dates) {
        Map<LocalDate, Long> grouped = dates.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        date -> date,
                        TreeMap::new,
                        Collectors.counting()
                ));

        return grouped.entrySet().stream().map(entry -> {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey().toString());
            point.put("count", entry.getValue());
            return point;
        }).collect(Collectors.toList());
    }
}
