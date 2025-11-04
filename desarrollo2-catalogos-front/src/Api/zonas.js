import { API_URL } from "./api";

// función que obtiene el token actual
function getAuthHeaders() {
const token = localStorage.getItem("token");
return {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
};
}

// ===================
// GET todas las zonas
// ===================
export async function fetchZonas() {
const res = await fetch(`${API_URL}zonas/`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error(`Error GET zonas: ${res.status}`);
return res.json();
}

// ===================
// POST crear zona
// ===================
export async function createZona(nombre) {
const res = await fetch(`${API_URL}zonas/`, {
method: "POST",
headers: getAuthHeaders(),
body: JSON.stringify({ nombre }),
});
if (!res.ok) throw new Error(`Error POST zona: ${res.status}`);
return res.json();
}

// ===================
// GET zona por id
// ===================
export async function fetchZonaById(id) {
const res = await fetch(`${API_URL}zonas/${id}`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error(`Error GET zona ${id}: ${res.status}`);
return res.json();
}

// ===================
// PATCH actualizar zona
// ===================
export async function updateZona(id, data) {
const res = await fetch(`${API_URL}zonas/${id}`, {
method: "PATCH",
headers: getAuthHeaders(),
body: JSON.stringify(data), 
});
if (!res.ok) throw new Error(`Error PATCH zona ${id}: ${res.status}`);
return res.json();
}

// ===================
// DELETE eliminar zona
// ===================
export async function deleteZona(id) {
const res = await fetch(`${API_URL}zonas/${id}`, {
method: "DELETE",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error(`Error DELETE zona: ${res.status}`);
return res.json();
}
