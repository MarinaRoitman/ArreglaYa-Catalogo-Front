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

// Eliminar prestador por ID
export async function deletePrestador(id) {
  const res = await fetch(`${API_URL}prestadores/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error deletePrestador:", errorText);
    throw new Error(errorText || "Error al eliminar prestador");
  }

  return res.text(); // El backend suele devolver texto vacío o mensaje
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


/**
 * Sube o actualiza la foto de un prestador.
 * @param {string|number} prestadorId - El ID del prestador.
 * @param {File} file - El archivo de la imagen a subir.
 */
export const uploadPrestadorFoto = async (prestadorId, file) => {
  const token = localStorage.getItem("token");
  if (!prestadorId || !file) {
    throw new Error("Faltan el ID del prestador o el archivo.");
  }

  // FormData es la forma estándar de enviar archivos.
  const formData = new FormData();
  formData.append("foto", file); // "foto" es el nombre que espera el backend.

  try {
    const response = await fetch(`${API_URL}prestadores/${prestadorId}/foto`, {
      method: 'PATCH',
      headers: {
        // NO se pone 'Content-Type', el navegador lo hace solo con FormData.
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "No se pudo subir la imagen.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploadPrestadorFoto:", error.message);
    throw error;
  }
};