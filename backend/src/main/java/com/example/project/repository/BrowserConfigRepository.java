package com.example.project.repository;

import com.example.project.model.BrowserConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrowserConfigRepository extends JpaRepository<BrowserConfig, Long> {
}