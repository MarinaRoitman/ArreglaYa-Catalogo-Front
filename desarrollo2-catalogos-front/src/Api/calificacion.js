import { API_URL } from "./api";

// helper para auth
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


// GET listar todas las calificaciones

export async function listCalificaciones() {
  const res = await fetch(`${API_URL}calificaciones/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error GET calificaciones: ${res.status}`);
  return res.json();
}


// GET calificación por id

export async function listCalificacionesByPrestador(id) {
  const res = await fetch(`${API_URL}calificaciones/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error GET calificación ${id}: ${res.status}`);
  return res.json();
}


