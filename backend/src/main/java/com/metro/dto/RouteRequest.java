package com.metro.dto;

import lombok.Data;

@Data
public class RouteRequest {
    private String from;
    private String to;
    private Double weightDist = 0.7;
    private Double weightCrowd = 0.3;
}