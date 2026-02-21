package com.example.medicalrecordservice.service;

import com.example.medicalrecordservice.client.PatientClient;
import com.example.medicalrecordservice.model.DiagnosisEntry;
import com.example.medicalrecordservice.model.MedicalRecord;
import com.example.medicalrecordservice.repository.MedicalRecordRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicalRecordService {
    private final MedicalRecordRepository repository;
    private final PatientClient patientClient;

    public MedicalRecordService(MedicalRecordRepository repository, PatientClient patientClient) {
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

    public MedicalRecord createRecord(Long patientId) {
        MedicalRecord record = new MedicalRecord(patientId, LocalDateTime.now());
        return repository.save(record);
    }

    public MedicalRecord getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public MedicalRecord addDiagnosis(Long recordId, String description) {
        MedicalRecord record = repository.findById(recordId).orElse(null);
        if (record == null) {
            return null;
        }
        record.getDiagnoses().add(new DiagnosisEntry(LocalDateTime.now(), description));
        return repository.save(record);
    }

    public List<MedicalRecord> getByPatient(Long patientId) {
        return repository.findByPatientId(patientId);
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
