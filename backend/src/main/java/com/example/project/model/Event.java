package com.example.project.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String eventType;

    private Integer guestCount;

    private String venue;

    private String speaker;

    private Boolean completed = false;

    private String approvalStatus = "PENDING";

    private LocalDateTime completedAt;

    private LocalDateTime scheduledDate;

    @ElementCollection
    private List<String> hashtags;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    @JsonIgnoreProperties({ "createdEvents", "registrations", "password", "status" })
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public LocalDateTime getStart() {
        return scheduledDate;
    }

    public void setStart(LocalDateTime start) {
        this.scheduledDate = start;
    }

    @JsonProperty("creator")
    public String getCreator() {
        return createdBy != null ? createdBy.getUsername() : null;
    }
}
