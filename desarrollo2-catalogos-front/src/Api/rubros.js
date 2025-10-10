import { API_URL } from "./api";

// 🔹 helper para headers con token
function getAuthHeaders(extra = {}) {
const token = localStorage.getItem("token");
return {
"Content-Type": "application/json",
Accept: "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...extra,
};
}

/**
 * GET /rubros/  -> lista todos los rubros
 */
export async function listRubros() {
const res = await fetch(`${API_URL}rubros/`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error(`Error GET rubros: ${res.status}`);
return res.json();
}

/**
 * GET /rubros/:id  -> trae un rubro por id
 */
export async function getRubroById(id) {
const res = await fetch(`${API_URL}rubros/${id}`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error(`Error GET rubro ${id}: ${res.status}`);
return res.json();
}

/**
 * POST /rubros/  -> crea un rubro
 * body: { nombre }
 */
export async function createRubro({ nombre }) {
const res = await fetch(`${API_URL}rubros/`, {
method: "POST",
headers: getAuthHeaders(),
body: JSON.stringify({ nombre }),
});
if (!res.ok) throw new Error(`Error POST rubro: ${res.status}`);
return res.json();
}

/**
 * PATCH /rubros/:id  -> actualiza parcialmente un rubro
 * body: { nombre }
 * (Si tu API exige PUT completo, cambiá method a "PUT")
 */
export async function updateRubro(id, { nombre }) {
const res = await fetch(`${API_URL}rubros/${id}`, {
method: "PATCH",
headers: getAuthHeaders(),
body: JSON.stringify({ nombre }),
});
if (!res.ok) throw new Error(`Error PATCH rubro ${id}: ${res.status}`);
return res.json();
}

/**
 * DELETE /rubros/:id  -> elimina un rubro
 * (No mandamos body en DELETE; algunos backends lo ignoran)
 */
export async function deleteRubro(id) {
  const res = await fetch(`${API_URL}rubros/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    // Intentá leer mensaje del backend
    let msg = `Error al eliminar rubro (${res.status})`;
    try {
      const txt = await res.text();
      if (txt) msg = txt;
    } catch {}
    throw new Error(msg);
  }

  // Muchos DELETE devuelven 204 (sin body)
  return true;
}
