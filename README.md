# Hospital Microservices (Mini Project)

This project implements a simplified hospital management system using Spring Boot and Spring Cloud.

Services:
- Config Server
- Eureka Discovery Service
- API Gateway
- Patient Service
- Appointment Service
- Medical Record Service

## Prerequisites
- Java 17
- Maven 3.8+

## How to run (order)
1) Config Server
2) Eureka Discovery Service
3) API Gateway
4) Patient Service
5) Appointment Service
6) Medical Record Service

You can run each service using:
```
mvn spring-boot:run
```

## Default URLs
- Config Server: http://localhost:8888
- Eureka: http://localhost:8761
- API Gateway: http://localhost:8080

## API (via Gateway)
- Patients
  - POST /patients
  - GET /patients/{id}
  - GET /patients
- Appointments
  - POST /appointments
  - GET /appointments/patient/{patientId}
- Medical Records
  - POST /records
  - POST /records/{recordId}/diagnoses
  - GET /records/patient/{patientId}

## Notes
- Each service uses H2 for simplicity.
- Resilience4j circuit breaker is enabled for Patient checks in Appointment and Medical Record services.
