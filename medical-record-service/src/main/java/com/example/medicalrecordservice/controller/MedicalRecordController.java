package com.example.medicalrecordservice.controller;

import com.example.medicalrecordservice.model.MedicalRecord;
import com.example.medicalrecordservice.service.MedicalRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/records")
public class MedicalRecordController {
    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Long> body) {
        Long patientId = body.get("patientId");
        if (patientId == null) {
            return ResponseEntity.badRequest().body("patientId is required");
        }
        if (!service.patientExists(patientId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Patient not found or patient service unavailable");
        }
        MedicalRecord created = service.createRecord(patientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{recordId}/diagnoses")
    public ResponseEntity<?> addDiagnosis(@PathVariable Long recordId, @RequestBody Map<String, String> body) {
        String description = body.get("description");
        if (description == null || description.isBlank()) {
            return ResponseEntity.badRequest().body("description is required");
        }
        MedicalRecord updated = service.addDiagnosis(recordId, description);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getByPatient(@PathVariable Long patientId) {
        return service.getByPatient(patientId);
    }
}
