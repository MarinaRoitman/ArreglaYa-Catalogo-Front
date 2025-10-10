// src/Api/Admins.js
import { API_URL } from "./api";

function getAuthHeaders(extra = {}) {
const token = localStorage.getItem("token");
return {
"Content-Type": "application/json",
Accept: "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...extra,
};
}

async function parseError(res) {
const text = await res.text();
try {
const json = JSON.parse(text);
return json?.detail || json?.message || text || "Error desconocido";
} catch {
return text || "Error desconocido";
}
}

/**
 * Wrapper de fetch que añade headers y maneja 401/403.
 * - Si recibimos 401/403 => limpiamos storage y lanzamos error con code='AUTH'.
 *   La página decidirá si redirige.
 */
async function apiFetch(path, options = {}) {
const res = await fetch(`${API_URL}${path}`, {
...options,
headers: getAuthHeaders(options.headers || {}),
});

if (res.status === 401 || res.status === 403) {
// limpiar sesión mínima; no navegamos acá, lo hará el caller
localStorage.removeItem("token");
// podés limpiar otros si querés
const msg = await parseError(res);
const err = new Error(msg || "No autorizado.");
err.code = "AUTH";
throw err;
}

if (!res.ok) {
throw new Error(await parseError(res));
}
// algunos endpoints DELETE devuelven vacío
const ct = res.headers.get("content-type") || "";
return ct.includes("application/json") ? res.json() : res.text();
}

/* ======= Endpoints Admins ======= */

export async function listAdmins() {
return apiFetch("admins/", { method: "GET" });
}

export async function createAdmin(data) {
return apiFetch("admins/", {
method: "POST",
body: JSON.stringify(data),
});
}

export async function getAdminById(id) {
return apiFetch(`admins/${id}`, { method: "GET" });
}

export async function updateAdmin(id, data) {
return apiFetch(`admins/${id}`, {
method: "PATCH",
body: JSON.stringify(data),
});
}

export async function deleteAdmin(id) {
return apiFetch(`admins/${id}`, { method: "DELETE" });
}

export async function changeAdminPassword(id, password) {
return apiFetch(`admins/${id}`, {
method: "PATCH",
body: JSON.stringify({ password }),
});
}
