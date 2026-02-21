const gatewayInput = document.getElementById("gatewayUrl");
const pingBtn = document.getElementById("pingBtn");
const pingStatus = document.getElementById("pingStatus");
const lastAction = document.getElementById("lastAction");
const toastHost = document.getElementById("toastHost");
const sidebarGateway = document.getElementById("sidebarGateway");
const serviceCheck = document.getElementById("serviceCheck");
const serviceCheckBtn = document.getElementById("serviceCheckBtn");
const serviceCheckStatus = document.getElementById("serviceCheckStatus");
const navLinks = document.querySelectorAll(".nav-link");
const panels = document.querySelectorAll(".panel");

const patientsTable = document.querySelector("#patientsTable tbody");
const appointmentsTable = document.querySelector("#appointmentsTable tbody");
const recordsTable = document.querySelector("#recordsTable tbody");

const patientForm = document.getElementById("patientForm");
const patientId = document.getElementById("patientId");
const patientNom = document.getElementById("patientNom");
const patientPrenom = document.getElementById("patientPrenom");
const patientDob = document.getElementById("patientDob");
const patientContact = document.getElementById("patientContact");

const appointmentForm = document.getElementById("appointmentForm");
const appointmentId = document.getElementById("appointmentId");
const appointmentPatientId = document.getElementById("appointmentPatientId");
const appointmentDateTime = document.getElementById("appointmentDateTime");
const appointmentReason = document.getElementById("appointmentReason");
const appointmentStatus = document.getElementById("appointmentStatus");
const appointmentFilter = document.getElementById("appointmentFilter");

const recordForm = document.getElementById("recordForm");
const recordPatientId = document.getElementById("recordPatientId");
const recordFilter = document.getElementById("recordFilter");
const diagnosisForm = document.getElementById("diagnosisForm");
const diagnosisRecordId = document.getElementById("diagnosisRecordId");
const diagnosisText = document.getElementById("diagnosisText");

function apiBase() {
  const value = (gatewayInput.value || "").trim();
  if (!value) return "http://localhost:8080";
  return value.replace(/\/$/, "");
}

function setStatus(message, ok = true) {
  lastAction.textContent = message;
  pingStatus.textContent = ok ? "OK" : "Error";
  pingStatus.style.color = ok ? "#7bdff2" : "#ff7a59";
}

function toast(title, message, ok = true) {
  if (!toastHost) return;
  const el = document.createElement("div");
  el.className = `toast ${ok ? "ok" : "err"}`;
  el.innerHTML = `<div class="toast-title">${title}</div><div class="toast-msg">${message}</div>`;
  toastHost.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    setTimeout(() => el.remove(), 200);
  }, 3500);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function normalizeDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

pingBtn.addEventListener("click", async () => {
  try {
    await fetchJson(`${apiBase()}/patients`);
    setStatus("Gateway: OK", true);
    toast("Gateway", "Connected via /patients", true);
  } catch (err) {
    setStatus("Gateway unreachable", false);
    toast("Gateway", "Unreachable. Set API Gateway to http://localhost:8080", false);
  }
});

if (serviceCheckBtn) {
  serviceCheckBtn.addEventListener("click", async () => {
    const choice = serviceCheck ? serviceCheck.value : "patients";
    const endpoints = {
      patients: "/patients",
      appointments: "/appointments/patient/1",
      records: "/records/patient/1",
    };
    const endpoint = endpoints[choice] || "/patients";
    try {
      await fetchJson(`${apiBase()}${endpoint}`);
      serviceCheckStatus.textContent = "OK";
      serviceCheckStatus.style.color = "#7bdff2";
      toast("Service Check", `${choice} reachable`, true);
    } catch (err) {
      serviceCheckStatus.textContent = "Error";
      serviceCheckStatus.style.color = "#ff7a59";
      if (String(err.message).includes("Patient not found")) {
        toast("Service Check", "Create a patient first (ID 1) then retry.", false);
      } else {
        toast("Service Check", err.message || "Service error", false);
      }
    }
  });
}


// Patients
async function loadPatients() {
  patientsTable.innerHTML = "";
  const patients = await fetchJson(`${apiBase()}/patients`);
  patients.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nom}</td>
      <td>${p.prenom}</td>
      <td>${p.dateNaissance || ""}</td>
      <td>${p.contact || ""}</td>
      <td>
        <button class="ghost" data-edit="${p.id}">Edit</button>
        <button class="ghost" data-del="${p.id}">Delete</button>
      </td>
    `;
    patientsTable.appendChild(row);
  });
}

patientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    nom: patientNom.value.trim(),
    prenom: patientPrenom.value.trim(),
    dateNaissance: patientDob.value,
    contact: patientContact.value.trim(),
  };
  try {
    if (patientId.value) {
      await fetchJson(`${apiBase()}/patients/${patientId.value}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatus("Patient updated", true);
      toast("Patients", "Patient updated.", true);
    } else {
      await fetchJson(`${apiBase()}/patients`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus("Patient created", true);
      toast("Patients", "Patient created.", true);
    }
    patientForm.reset();
    patientId.value = "";
    await loadPatients();
  } catch (err) {
    setStatus(`Patient error: ${err.message}`, false);
    toast("Patients", err.message || "Action failed.", false);
  }
});

document.getElementById("patientClear").addEventListener("click", () => {
  patientForm.reset();
  patientId.value = "";
});

document.getElementById("refreshPatients").addEventListener("click", loadPatients);

patientsTable.addEventListener("click", async (e) => {
  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");
  if (editId) {
    const p = await fetchJson(`${apiBase()}/patients/${editId}`);
    patientId.value = p.id;
    patientNom.value = p.nom || "";
    patientPrenom.value = p.prenom || "";
    patientDob.value = p.dateNaissance || "";
    patientContact.value = p.contact || "";
  }
  if (delId) {
    await fetchJson(`${apiBase()}/patients/${delId}`, { method: "DELETE" });
    toast("Patients", "Patient deleted.", true);
    await loadPatients();
  }
});

// Appointments
async function loadAppointments(patientIdValue) {
  appointmentsTable.innerHTML = "";
  const endpoint = patientIdValue
    ? `${apiBase()}/appointments/patient/${patientIdValue}`
    : `${apiBase()}/appointments/patient/1`;
  const appointments = await fetchJson(endpoint);
  appointments.forEach((a) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${a.id}</td>
      <td>${a.patientId}</td>
      <td>${a.appointmentDateTime || ""}</td>
      <td>${a.reason || ""}</td>
      <td>${a.status || ""}</td>
      <td>
        <button class="ghost" data-edit="${a.id}">Edit</button>
        <button class="ghost" data-del="${a.id}">Delete</button>
      </td>
    `;
    appointmentsTable.appendChild(row);
  });
}

appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    patientId: Number(appointmentPatientId.value),
    appointmentDateTime: normalizeDateTime(appointmentDateTime.value),
    reason: appointmentReason.value.trim(),
    status: appointmentStatus.value.trim(),
  };
  try {
    if (appointmentId.value) {
      await fetchJson(`${apiBase()}/appointments/${appointmentId.value}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatus("Appointment updated", true);
      toast("Appointments", "Appointment updated.", true);
    } else {
      await fetchJson(`${apiBase()}/appointments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus("Appointment created", true);
      toast("Appointments", "Appointment created.", true);
    }
    appointmentForm.reset();
    appointmentId.value = "";
    await loadAppointments(appointmentFilter.value || payload.patientId);
  } catch (err) {
    const msg = err.message || "Action failed.";
    setStatus(`Appointment error: ${msg}`, false);
    if (msg.includes("Patient not found")) {
      toast("Appointments", "Add the patient first, then create the appointment.", false);
    } else {
      toast("Appointments", msg, false);
    }
  }
});

document.getElementById("appointmentClear").addEventListener("click", () => {
  appointmentForm.reset();
  appointmentId.value = "";
});

document.getElementById("refreshAppointments").addEventListener("click", () => {
  loadAppointments(appointmentFilter.value);
});

document.getElementById("appointmentFilterBtn").addEventListener("click", () => {
  loadAppointments(appointmentFilter.value);
});

appointmentsTable.addEventListener("click", async (e) => {
  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");
  if (editId) {
    const a = await fetchJson(`${apiBase()}/appointments/${editId}`);
    appointmentId.value = a.id;
    appointmentPatientId.value = a.patientId;
    appointmentDateTime.value = a.appointmentDateTime ? a.appointmentDateTime.slice(0, 16) : "";
    appointmentReason.value = a.reason || "";
    appointmentStatus.value = a.status || "";
  }
  if (delId) {
    await fetchJson(`${apiBase()}/appointments/${delId}`, { method: "DELETE" });
    toast("Appointments", "Appointment deleted.", true);
    await loadAppointments(appointmentFilter.value);
  }
});

// Records
async function loadRecords(patientIdValue) {
  recordsTable.innerHTML = "";
  const endpoint = patientIdValue
    ? `${apiBase()}/records/patient/${patientIdValue}`
    : `${apiBase()}/records/patient/1`;
  const records = await fetchJson(endpoint);
  records.forEach((r) => {
    const diagnoses = (r.diagnoses || [])
      .map((d) => `${d.dateTime ? d.dateTime.split("T")[0] : ""}: ${d.description}`)
      .join(" | ");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.id}</td>
      <td>${r.patientId}</td>
      <td>${r.createdAt || ""}</td>
      <td>${diagnoses}</td>
      <td>
        <button class="ghost" data-del="${r.id}">Delete</button>
      </td>
    `;
    recordsTable.appendChild(row);
  });
}

recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = { patientId: Number(recordPatientId.value) };
  try {
    await fetchJson(`${apiBase()}/records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStatus("Record created", true);
    toast("Records", "Record created.", true);
    recordForm.reset();
    await loadRecords(recordFilter.value || payload.patientId);
  } catch (err) {
    setStatus(`Record error: ${err.message}`, false);
    toast("Records", err.message || "Action failed.", false);
  }
});

document.getElementById("refreshRecords").addEventListener("click", () => {
  loadRecords(recordFilter.value);
});

document.getElementById("recordFilterBtn").addEventListener("click", () => {
  loadRecords(recordFilter.value);
});

diagnosisForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = { description: diagnosisText.value.trim() };
  try {
    await fetchJson(`${apiBase()}/records/${diagnosisRecordId.value}/diagnoses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStatus("Diagnosis added", true);
    toast("Records", "Diagnosis added.", true);
    diagnosisForm.reset();
    await loadRecords(recordFilter.value);
  } catch (err) {
    setStatus(`Diagnosis error: ${err.message}`, false);
    toast("Records", err.message || "Action failed.", false);
  }
});

recordsTable.addEventListener("click", async (e) => {
  const delId = e.target.getAttribute("data-del");
  if (delId) {
    await fetchJson(`${apiBase()}/records/${delId}`, { method: "DELETE" });
    toast("Records", "Record deleted.", true);
    await loadRecords(recordFilter.value);
  }
});

if (sidebarGateway) {
  sidebarGateway.textContent = apiBase();
}

// Initial load for dashboard page
loadPatients();
loadAppointments();
loadRecords();

function showPanelFromHash(hash) {
  if (!hash) return;
  panels.forEach((panel) => {
    if (`#${panel.id}` === hash) {
      panel.classList.remove("hidden-panel");
    } else {
      panel.classList.add("hidden-panel");
    }
  });
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

if (navLinks.length) {
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const hash = link.getAttribute("href");
      if (hash) {
        history.replaceState(null, "", hash);
        showPanelFromHash(hash);
      }
    });
  });

  showPanelFromHash(window.location.hash || navLinks[0].getAttribute("href"));
}
