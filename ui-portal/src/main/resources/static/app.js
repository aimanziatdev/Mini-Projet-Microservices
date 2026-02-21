const gatewayInput = document.getElementById("gatewayUrl");
const pingBtn = document.getElementById("pingBtn");
const pingStatus = document.getElementById("pingStatus");
const lastAction = document.getElementById("lastAction");
const toastHost = document.getElementById("toastHost");
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

const kpiPatients = document.getElementById("kpiPatients");
const kpiAppointments = document.getElementById("kpiAppointments");
const kpiRecords = document.getElementById("kpiRecords");
const kpiDiagnoses = document.getElementById("kpiDiagnoses");
const kpiUpcoming = document.getElementById("kpiUpcoming");
const kpiNoAppointments = document.getElementById("kpiNoAppointments");
const statusBars = document.getElementById("statusBars");

const state = {
  patients: [],
  appointments: [],
  records: [],
};

function apiBase() {
  const value = (gatewayInput.value || "").trim();
  if (!value) return "http://localhost:8080";
  return value.replace(/\/$/, "");
}

function setStatus(message, ok = true) {
  if (lastAction) {
    lastAction.textContent = message;
  }
  if (pingStatus) {
    pingStatus.textContent = ok ? "OK" : "Erreur";
    pingStatus.style.color = ok ? "#7bdff2" : "#ff7a59";
  }
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
    const err = new Error(text || res.statusText || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

function isNotFoundError(err) {
  return err && (
    err.status === 404 ||
    /not found/i.test(String(err.message)) ||
    /aucun/i.test(String(err.message))
  );
}

function normalizeDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

function formatDateShort(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function statusLabel(status) {
  const map = {
    Scheduled: "Planifie",
    InProgress: "En cours",
    Done: "Termine",
    Cancelled: "Annule",
  };
  return map[status] || (status || "Inconnu");
}

function updateAnalyse() {
  const patientCount = state.patients.length;
  const appointmentCount = state.appointments.length;
  const recordCount = state.records.length;
  const diagnosisCount = state.records.reduce((sum, record) => sum + (record.diagnoses || []).length, 0);

  const now = new Date();
  const plus7 = new Date();
  plus7.setDate(plus7.getDate() + 7);

  const upcomingCount = state.appointments.filter((a) => {
    const dt = new Date(a.appointmentDateTime);
    return !Number.isNaN(dt.getTime()) && dt >= now && dt <= plus7;
  }).length;

  const patientsWithAppointment = new Set(state.appointments.map((a) => String(a.patientId)));
  const noAppointmentCount = state.patients.filter((p) => !patientsWithAppointment.has(String(p.id))).length;

  if (kpiPatients) kpiPatients.textContent = String(patientCount);
  if (kpiAppointments) kpiAppointments.textContent = String(appointmentCount);
  if (kpiRecords) kpiRecords.textContent = String(recordCount);
  if (kpiDiagnoses) kpiDiagnoses.textContent = String(diagnosisCount);
  if (kpiUpcoming) kpiUpcoming.textContent = String(upcomingCount);
  if (kpiNoAppointments) kpiNoAppointments.textContent = String(noAppointmentCount);

  const statusCounts = { Scheduled: 0, InProgress: 0, Done: 0, Cancelled: 0 };
  state.appointments.forEach((a) => {
    if (Object.prototype.hasOwnProperty.call(statusCounts, a.status)) {
      statusCounts[a.status] += 1;
    }
  });

  if (statusBars) {
    statusBars.innerHTML = "";
    const total = Math.max(appointmentCount, 1);
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percent = Math.round((count / total) * 100);
      const line = document.createElement("div");
      line.className = "status-bar-row";
      line.innerHTML = `
        <span class="status-name">${statusLabel(status)}</span>
        <div class="status-bar-track"><div class="status-bar-fill" style="width:${percent}%"></div></div>
        <span class="status-value">${count} (${percent}%)</span>
      `;
      statusBars.appendChild(line);
    });
  }
}

pingBtn.addEventListener("click", async () => {
  try {
    await fetchJson(`${apiBase()}/patients`);
    setStatus("Passerelle API operationnelle.", true);
    toast("Passerelle", "Connexion validee via /patients.", true);
  } catch (err) {
    setStatus("Passerelle API inaccessible.", false);
    toast("Passerelle", "Inaccessible. Verifiez l'URL http://localhost:8080.", false);
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
      toast("Verification", `${choice} accessible.`, true);
    } catch (err) {
      serviceCheckStatus.textContent = "Erreur";
      serviceCheckStatus.style.color = "#ff7a59";
      if (isNotFoundError(err)) {
        toast("Verification", "Aucune donnee test disponible pour ce service.", false);
      } else {
        toast("Verification", err.message || "Erreur service", false);
      }
    }
  });
}

async function loadPatients() {
  patientsTable.innerHTML = "";
  let patients = [];
  try {
    patients = await fetchJson(`${apiBase()}/patients`);
  } catch (err) {
    state.patients = [];
    updateAnalyse();
    throw err;
  }

  state.patients = Array.isArray(patients) ? patients : [];
  state.patients.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nom || ""}</td>
      <td>${p.prenom || ""}</td>
      <td>${p.dateNaissance || ""}</td>
      <td>${p.contact || ""}</td>
      <td>
        <button class="ghost" data-edit="${p.id}">Modifier</button>
        <button class="ghost" data-del="${p.id}">Supprimer</button>
      </td>
    `;
    patientsTable.appendChild(row);
  });
  updateAnalyse();
  return state.patients;
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
      setStatus("Patient mis a jour.", true);
      toast("Patients", "Patient mis a jour.", true);
    } else {
      await fetchJson(`${apiBase()}/patients`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus("Patient cree.", true);
      toast("Patients", "Patient cree.", true);
    }
    patientForm.reset();
    patientId.value = "";
    await loadPatients();
    await loadAppointments(appointmentFilter.value, true);
    await loadRecords(recordFilter.value, true);
  } catch (err) {
    setStatus(`Erreur patient: ${err.message}`, false);
    toast("Patients", err.message || "Action echouee.", false);
  }
});

document.getElementById("patientClear").addEventListener("click", () => {
  patientForm.reset();
  patientId.value = "";
});

document.getElementById("refreshPatients").addEventListener("click", async () => {
  try {
    await loadPatients();
  } catch (err) {
    toast("Patients", err.message || "Impossible de charger les patients.", false);
  }
});

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
    toast("Patients", "Patient supprime.", true);
    await loadPatients();
    await loadAppointments(appointmentFilter.value, true);
    await loadRecords(recordFilter.value, true);
  }
});

async function loadAppointments(patientIdValue, silent = false) {
  appointmentsTable.innerHTML = "";
  let appointments = [];

  if (patientIdValue) {
    const endpoint = `${apiBase()}/appointments/patient/${patientIdValue}`;
    try {
      appointments = await fetchJson(endpoint);
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      appointments = [];
    }
  } else {
    const patientIds = state.patients.map((p) => p.id);
    const results = await Promise.all(patientIds.map(async (id) => {
      try {
        return await fetchJson(`${apiBase()}/appointments/patient/${id}`);
      } catch (err) {
        if (isNotFoundError(err)) return [];
        throw err;
      }
    }));
    appointments = results.flat();
  }

  state.appointments = Array.isArray(appointments) ? appointments : [];
  state.appointments.forEach((a) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${a.id}</td>
      <td>${a.patientId}</td>
      <td>${formatDateShort(a.appointmentDateTime)}</td>
      <td>${a.reason || ""}</td>
      <td>${statusLabel(a.status)}</td>
      <td>
        <button class="ghost" data-edit="${a.id}">Modifier</button>
        <button class="ghost" data-del="${a.id}">Supprimer</button>
      </td>
    `;
    appointmentsTable.appendChild(row);
  });
  updateAnalyse();
  if (!silent) {
    setStatus("Rendez-vous charges.", true);
  }
  return state.appointments;
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
      setStatus("Rendez-vous mis a jour.", true);
      toast("Rendez-vous", "Rendez-vous mis a jour.", true);
    } else {
      await fetchJson(`${apiBase()}/appointments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus("Rendez-vous cree.", true);
      toast("Rendez-vous", "Rendez-vous cree.", true);
    }
    appointmentForm.reset();
    appointmentId.value = "";
    await loadAppointments(appointmentFilter.value || payload.patientId, true);
  } catch (err) {
    const msg = err.message || "Action echouee.";
    setStatus(`Erreur rendez-vous: ${msg}`, false);
    if (/Patient not found/i.test(msg)) {
      toast("Rendez-vous", "Ajoutez d'abord le patient, puis creez le rendez-vous.", false);
    } else {
      toast("Rendez-vous", msg, false);
    }
  }
});

document.getElementById("appointmentClear").addEventListener("click", () => {
  appointmentForm.reset();
  appointmentId.value = "";
});

document.getElementById("refreshAppointments").addEventListener("click", async () => {
  try {
    await loadAppointments(appointmentFilter.value, true);
  } catch (err) {
    toast("Rendez-vous", err.message || "Impossible de charger les rendez-vous.", false);
  }
});

document.getElementById("appointmentFilterBtn").addEventListener("click", async () => {
  try {
    await loadAppointments(appointmentFilter.value, true);
  } catch (err) {
    toast("Rendez-vous", err.message || "Impossible de filtrer les rendez-vous.", false);
  }
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
    toast("Rendez-vous", "Rendez-vous supprime.", true);
    await loadAppointments(appointmentFilter.value, true);
  }
});

async function loadRecords(patientIdValue, silent = false) {
  recordsTable.innerHTML = "";
  let records = [];

  if (patientIdValue) {
    const endpoint = `${apiBase()}/records/patient/${patientIdValue}`;
    try {
      records = await fetchJson(endpoint);
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
      records = [];
    }
  } else {
    const patientIds = state.patients.map((p) => p.id);
    const results = await Promise.all(patientIds.map(async (id) => {
      try {
        return await fetchJson(`${apiBase()}/records/patient/${id}`);
      } catch (err) {
        if (isNotFoundError(err)) return [];
        throw err;
      }
    }));
    records = results.flat();
  }

  state.records = Array.isArray(records) ? records : [];
  state.records.forEach((r) => {
    const diagnoses = (r.diagnoses || [])
      .map((d) => `${formatDateShort(d.dateTime)}: ${d.description}`)
      .join(" | ");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.id}</td>
      <td>${r.patientId}</td>
      <td>${formatDateShort(r.createdAt)}</td>
      <td>${diagnoses}</td>
      <td>
        <button class="ghost" data-del="${r.id}">Supprimer</button>
      </td>
    `;
    recordsTable.appendChild(row);
  });
  updateAnalyse();
  if (!silent) {
    setStatus("Dossiers medicaux charges.", true);
  }
  return state.records;
}

recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = { patientId: Number(recordPatientId.value) };
  try {
    await fetchJson(`${apiBase()}/records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStatus("Dossier medical cree.", true);
    toast("Dossiers", "Dossier medical cree.", true);
    recordForm.reset();
    await loadRecords(recordFilter.value || payload.patientId, true);
  } catch (err) {
    setStatus(`Erreur dossier: ${err.message}`, false);
    toast("Dossiers", err.message || "Action echouee.", false);
  }
});

document.getElementById("refreshRecords").addEventListener("click", async () => {
  try {
    await loadRecords(recordFilter.value, true);
  } catch (err) {
    toast("Dossiers", err.message || "Impossible de charger les dossiers.", false);
  }
});

document.getElementById("recordFilterBtn").addEventListener("click", async () => {
  try {
    await loadRecords(recordFilter.value, true);
  } catch (err) {
    toast("Dossiers", err.message || "Impossible de filtrer les dossiers.", false);
  }
});

diagnosisForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = { description: diagnosisText.value.trim() };
  try {
    await fetchJson(`${apiBase()}/records/${diagnosisRecordId.value}/diagnoses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStatus("Diagnostic ajoute.", true);
    toast("Dossiers", "Diagnostic ajoute.", true);
    diagnosisForm.reset();
    await loadRecords(recordFilter.value, true);
  } catch (err) {
    setStatus(`Erreur diagnostic: ${err.message}`, false);
    toast("Dossiers", err.message || "Action echouee.", false);
  }
});

recordsTable.addEventListener("click", async (e) => {
  const delId = e.target.getAttribute("data-del");
  if (delId) {
    await fetchJson(`${apiBase()}/records/${delId}`, { method: "DELETE" });
    toast("Dossiers", "Dossier supprime.", true);
    await loadRecords(recordFilter.value, true);
  }
});

const refreshAnalyseBtn = document.getElementById("refreshAnalyse");
if (refreshAnalyseBtn) {
  refreshAnalyseBtn.addEventListener("click", async () => {
    try {
      await loadPatients();
      await loadAppointments(appointmentFilter.value, true);
      await loadRecords(recordFilter.value, true);
      setStatus("Analyse actualisee.", true);
      toast("Analyse", "Indicateurs recalcules.", true);
    } catch (err) {
      toast("Analyse", err.message || "Erreur d'actualisation.", false);
    }
  });
}

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

async function initDashboard() {
  try {
    await loadPatients();
    await loadAppointments(appointmentFilter.value, true);
    await loadRecords(recordFilter.value, true);
    setStatus("Tableau de bord charge.", true);
  } catch (err) {
    setStatus("Erreur lors du chargement initial.", false);
    toast("Chargement", err.message || "Impossible de charger les donnees.", false);
  }
}

initDashboard();
