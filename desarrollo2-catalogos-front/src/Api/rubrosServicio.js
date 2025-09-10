import { API_URL } from "./api";

// helper para armar headers con token
function getAuthHeaders(extra = {}) {
const token = localStorage.getItem("token");
return {
"Content-Type": "application/json",
Accept: "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...extra,
};
}

// Listar todas las habilidades
export async function getHabilidades() {
const res = await fetch(`${API_URL}habilidades/`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error("Error al listar habilidades");
return res.json();
}

// Crear una nueva habilidad
export async function createHabilidad(data) {
const res = await fetch(`${API_URL}habilidades/`, {
method: "POST",
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
if (!res.ok) throw new Error("Error al crear habilidad");
return res.json();
}

// Actualizar una habilidad por id
export async function updateHabilidad(id, data) {
const res = await fetch(`${API_URL}habilidades/${id}`, {
method: "PUT",
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
if (!res.ok) throw new Error("Error al actualizar habilidad");
return res.json();
}

// Eliminar una habilidad
export async function removeHabilidad(id) {
const res = await fetch(`${API_URL}habilidades/${id}`, {
method: "DELETE",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error("Error al eliminar habilidad");
return res.json();
}

// agrupamos exportaciones si preferís importarlo como objeto
export const habilidadesApi = {
list: getHabilidades,
create: createHabilidad,
update: updateHabilidad,
remove: removeHabilidad,
};
