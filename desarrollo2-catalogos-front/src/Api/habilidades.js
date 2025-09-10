import { API_URL } from "./api";

// 🔹 helper para headers con token
function getAuthHeaders() {
const token = localStorage.getItem("token");
return {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
};
}


// GET listar todas las habilidades

export async function listHabilidades() {
const res = await fetch(`${API_URL}habilidades/`, {
method: "GET",
headers: getAuthHeaders(),
});

if (!res.ok) throw new Error(`Error GET habilidades: ${res.status}`);
return res.json();
}


// POST crear una habilidad

export async function createHabilidad({ nombre, descripcion, id_rubro }) {
const res = await fetch(`${API_URL}habilidades/`, {
method: "POST",
headers: getAuthHeaders(),
body: JSON.stringify({ nombre, descripcion, id_rubro }),
});

if (!res.ok) throw new Error(`Error POST habilidad: ${res.status}`);
return res.json();
}


// PUT actualizar habilidad

export async function updateHabilidad(id, { nombre, descripcion, id_rubro }) {
const res = await fetch(`${API_URL}habilidades/${id}`, {
method: "PUT",
headers: getAuthHeaders(),
body: JSON.stringify({ nombre, descripcion, id_rubro }),
});

if (!res.ok) throw new Error(`Error PUT habilidad: ${res.status}`);
return res.json();
}


// DELETE eliminar habilidad

export async function deleteHabilidad(id) {
const res = await fetch(`${API_URL}habilidades/${id}`, {
method: "DELETE",
headers: getAuthHeaders(),
});

if (!res.ok) throw new Error(`Error DELETE habilidad: ${res.status}`);
return res.json();
}
