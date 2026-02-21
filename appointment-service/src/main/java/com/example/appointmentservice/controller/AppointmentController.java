package com.example.appointmentservice.controller;

import com.example.appointmentservice.model.Appointment;
import com.example.appointmentservice.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Appointment appointment) {
        if (!service.patientExists(appointment.getPatientId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Patient not found or patient service unavailable");
        }
        Appointment saved = service.create(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable("id") Long id) {
        Appointment appointment = service.getById(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getByPatient(@PathVariable("patientId") Long patientId) {
        return service.getByPatient(patientId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @RequestBody Appointment appointment) {
        if (!service.patientExists(appointment.getPatientId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Patient not found or patient service unavailable");
        }
        Appointment updated = service.update(id, appointment);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        boolean deleted = service.delete(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
