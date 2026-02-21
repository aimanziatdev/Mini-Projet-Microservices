const landingPing = document.getElementById("landingPing");
const landingStatus = document.getElementById("landingStatus");
const toastHost = document.getElementById("toastHost");
const gatewayUrl = "http://localhost:8080";

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

async function checkGateway() {
  try {
    const res = await fetch(`${gatewayUrl}/patients`);
    if (!res.ok) throw new Error("Erreur passerelle");
    landingStatus.textContent = "OK";
    landingStatus.style.color = "#7bdff2";
    toast("Passerelle", "Connexion validee via /patients", true);
  } catch (err) {
    landingStatus.textContent = "Erreur";
    landingStatus.style.color = "#ff7a59";
    toast("Passerelle", "Inaccessible. Demarrez l'API Gateway.", false);
  }
}

landingPing.addEventListener("click", checkGateway);
