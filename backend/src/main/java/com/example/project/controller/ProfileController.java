package com.example.project.controller;

import com.example.project.model.User;
import com.example.project.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/me")
    public User getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return profileService.getProfile(username);
    }

    @PutMapping("/me")
    public User updateMyProfile(@RequestBody Map<String, String> updates) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return profileService.updateProfile(username, updates);
    }

    @GetMapping("/analytics")
    public Map<String, Object> getMyAnalytics() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return profileService.getAnalytics(username);
    }
}
