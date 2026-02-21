package com.example.medicalrecordservice.model;

import jakarta.persistence.Embeddable;
import java.time.LocalDateTime;

@Embeddable
public class DiagnosisEntry {
    private LocalDateTime dateTime;
    private String description;

    public DiagnosisEntry() {
    }

    public DiagnosisEntry(LocalDateTime dateTime, String description) {
        this.dateTime = dateTime;
        this.description = description;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
