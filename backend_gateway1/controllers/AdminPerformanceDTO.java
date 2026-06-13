package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminPerformanceDTO {
    private Long adminId;
    private String adminName;
    private long approvedCount;
    private long rejectedCount;
    private double performancePercentage;
}