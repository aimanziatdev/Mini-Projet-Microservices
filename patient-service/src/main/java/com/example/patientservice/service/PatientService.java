package com.example.patientservice.service;

import com.example.patientservice.model.Patient;
import com.example.patientservice.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {
    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public Patient create(Patient patient) {
        return repository.save(patient);
    }

    public Patient getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Patient> getAll() {
        return repository.findAll();
    }

    public Patient update(Long id, Patient updated) {
        Patient existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setDateNaissance(updated.getDateNaissance());
        existing.setContact(updated.getContact());
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
