package com.example.medicalrecordservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    private LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(name = "medical_record_diagnoses", joinColumns = @JoinColumn(name = "record_id"))
    private List<DiagnosisEntry> diagnoses = new ArrayList<>();

    public MedicalRecord() {
    }

    public MedicalRecord(Long patientId, LocalDateTime createdAt) {
        this.patientId = patientId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<DiagnosisEntry> getDiagnoses() {
        return diagnoses;
    }

    public void setDiagnoses(List<DiagnosisEntry> diagnoses) {
        this.diagnoses = diagnoses;
    }
}
