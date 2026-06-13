package com.example.project.controller;

import com.example.project.model.BrowserConfig;
import com.example.project.service.BrowserConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/browsers")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class BrowserConfigController {

    @Autowired
    private BrowserConfigService service;

    @GetMapping
    public List<BrowserConfig> getConfigs() {
        return service.getAllConfigs();
    }

    @PostMapping
    public BrowserConfig createConfig(@RequestBody BrowserConfig config) {
        return service.saveConfig(config);
    }

    @PutMapping("/{id}")
    public BrowserConfig updateConfig(@PathVariable Long id, @RequestBody BrowserConfig details) {
        return service.updateConfig(id, details);
    }

    @DeleteMapping("/{id}")
    public void removeConfig(@PathVariable Long id) {
        service.deleteConfig(id);
    }
}
