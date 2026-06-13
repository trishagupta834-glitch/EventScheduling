package com.example.project.service;

import com.example.project.model.BrowserConfig;
import com.example.project.repository.BrowserConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BrowserConfigService {

    @Autowired
    private BrowserConfigRepository repository;

    public List<BrowserConfig> getAllConfigs() {
        return repository.findAll();
    }

    public BrowserConfig getConfigById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("BrowserConfig not found with id: " + id));
    }

    public BrowserConfig saveConfig(BrowserConfig config) {
        return repository.save(config);
    }

    public BrowserConfig updateConfig(Long id, BrowserConfig details) {
        BrowserConfig config = getConfigById(id);
        config.setProjectName(details.getProjectName());
        config.setQueryValue(details.getQueryValue());
        config.setEnvironment(details.getEnvironment());
        return repository.save(config);
    }

    public void deleteConfig(Long id) {
        repository.deleteById(id);
    }
}