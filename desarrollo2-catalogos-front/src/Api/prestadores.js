import { API_URL } from "./api";

// Helper para armar headers con token
function getAuthHeaders(extra = {}) {
const token = localStorage.getItem("token");
return {
"Content-Type": "application/json",
Accept: "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...extra,
};
}

//  Listar todos los prestadores
export async function getPrestadores() {
const res = await fetch(`${API_URL}prestadores/`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error("Error al listar prestadores");
return res.json();
}

// Traer un prestador por ID
export async function getPrestadorById(id) {
const res = await fetch(`${API_URL}prestadores/${id}`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error("Error al traer prestador");
return res.json();
}

// Actualizar prestador (PATCH)
export async function updatePrestador(id, data) {
  const res = await fetch(`${API_URL}prestadores/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error updatePrestador:", errorText); // 👈 te muestra el detalle real
    throw new Error(errorText || "Error al actualizar prestador");
  }
  return res.json();
}

// Asociar zona a prestador
export async function addZonaToPrestador(id, id_zona) {
const res = await fetch(`${API_URL}prestadores/${id}/zonas`, {
method: "POST",
headers: getAuthHeaders(),
body: JSON.stringify({ id_zona }),
});
if (!res.ok) throw new Error("Error al asociar zona");
return res.json();
}

// Eliminar zona de prestador
export async function removeZonaFromPrestador(id, id_zona) {
const res = await fetch(`${API_URL}prestadores/${id}/zonas`, {
method: "DELETE",
headers: getAuthHeaders(),
body: JSON.stringify({ id_zona }),
});
if (!res.ok) throw new Error("Error al eliminar zona");
return res.json();
}

// Asociar habilidad a prestador
export async function addHabilidadToPrestador(id, id_habilidad) {
const res = await fetch(`${API_URL}prestadores/${id}/habilidades`, {
method: "POST",
headers: getAuthHeaders(),
body: JSON.stringify({ id_habilidad }),
});
if (!res.ok) throw new Error("Error al asociar habilidad");
return res.json();
}

// Eliminar habilidad de prestador
export async function removeHabilidadFromPrestador(id, id_habilidad) {
const res = await fetch(`${API_URL}prestadores/${id}/habilidades`, {
method: "DELETE",
headers: getAuthHeaders(),
body: JSON.stringify({ id_habilidad }),
});
if (!res.ok) throw new Error("Error al eliminar habilidad");
return res.json();
}

// Listar prestadores por id_habilidad
export async function getPrestadoresByHabilidad(id_habilidad) {
const res = await fetch(`${API_URL}prestadores/habilidad/${id_habilidad}`, {
method: "GET",
headers: getAuthHeaders(),
});
if (!res.ok) throw new Error("Error al listar prestadores por habilidad");
return res.json();
}

export async function cambiarContrasena(id, nuevaContrasena) {
  const res = await fetch(`${API_URL}prestadores/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      contrasena: nuevaContrasena, // <-- El único campo que necesita el backend
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'No se pudo cambiar la contraseña.');
  }

  return res.json();
}