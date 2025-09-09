import { API_URL } from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getUsuarioById(id) {
  const res = await fetch(`${API_URL}usuarios/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Error GET usuario ${id}: ${res.status}`);
  return res.json();
}
