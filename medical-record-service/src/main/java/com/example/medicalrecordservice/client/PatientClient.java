package com.example.medicalrecordservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "api-gateway")
public interface PatientClient {
    @GetMapping("/patients/{id}")
    PatientDto getPatient(@PathVariable("id") Long id);
}
