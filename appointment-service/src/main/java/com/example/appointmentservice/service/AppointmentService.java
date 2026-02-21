package com.example.appointmentservice.service;

import com.example.appointmentservice.client.PatientClient;
import com.example.appointmentservice.model.Appointment;
import com.example.appointmentservice.repository.AppointmentRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository repository;
    private final PatientClient patientClient;

    public AppointmentService(AppointmentRepository repository, PatientClient patientClient) {
        this.repository = repository;
        this.patientClient = patientClient;
    }

    @CircuitBreaker(name = "patientService", fallbackMethod = "patientCheckFallback")
    @Retry(name = "patientService")
    public boolean patientExists(Long patientId) {
        return patientClient.getPatient(patientId) != null;
    }

    public boolean patientCheckFallback(Long patientId, Throwable ex) {
        return false;
    }

    public Appointment create(Appointment appointment) {
        return repository.save(appointment);
    }

    public Appointment getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Appointment> getByPatient(Long patientId) {
        return repository.findByPatientId(patientId);
    }

    public Appointment update(Long id, Appointment updated) {
        Appointment existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        existing.setPatientId(updated.getPatientId());
        existing.setAppointmentDateTime(updated.getAppointmentDateTime());
        existing.setReason(updated.getReason());
        existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
