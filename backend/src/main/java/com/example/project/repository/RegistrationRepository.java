package com.example.project.repository;

import com.example.project.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByUserUsername(String username);
    long countByEventId(Long eventId);
    boolean existsByUserUsernameAndEventId(String username, Long eventId);
    void deleteByUserUsernameAndEventId(String username, Long eventId);
}
