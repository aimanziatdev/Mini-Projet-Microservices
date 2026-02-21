package com.example.apigateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GatewayController {
    
    @GetMapping("/")
    public GatewayInfo home() {
        return new GatewayInfo(
            "Hospital Management System - API Gateway",
            "Available endpoints: /patients/**, /appointments/**, /records/**"
        );
    }
    
    @GetMapping("/health")
    public String health() {
        return "API Gateway is running!";
    }
    
    public static class GatewayInfo {
        public String message;
        public String endpoints;
        
        public GatewayInfo(String message, String endpoints) {
            this.message = message;
            this.endpoints = endpoints;
        }
    }
}
