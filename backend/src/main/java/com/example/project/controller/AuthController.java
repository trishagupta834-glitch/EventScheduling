package com.example.project.controller;

import com.example.project.model.User;
import com.example.project.model.Role;
import com.example.project.repository.UserRepository;
import com.example.project.config.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signup")
    public User signUp(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(user.getUsername());
        }
        if (user.getPhoneNumber() == null) {
            user.setPhoneNumber("");
        }
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_USER);
        }
        user.setStatus(String.valueOf(user.getRole().getDatabaseValue()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @PostMapping("/signin")
    public Map<String, String> signIn(@RequestBody User loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        String token = jwtUtils.generateToken(authentication.getName());
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return Map.of("token", token, "username", user.getUsername(), "role", user.getRole().name());
    }
}
