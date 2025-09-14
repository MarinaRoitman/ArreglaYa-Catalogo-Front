import { API_URL } from "./api"; // Usamos la variable de entorno de tu proyecto

// Helper para armar los encabezados con el token de autenticación
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Obtiene todos los pedidos para un prestador.
 * Endpoint: GET /pedidos/?id_prestador=1
 */
export async function getPedidos() {
  // Leemos el ID del prestador que guardamos al iniciar sesión
  const prestadorId = localStorage.getItem("prestador_id");

  // Si por alguna razón no hay un ID, no hacemos la petición para evitar errores
  if (!prestadorId) {
    console.error("No se encontró el ID del prestador para pedir los trabajos.");
    return []; // Devolvemos un array vacío
  }

  // Hacemos la llamada a la API usando el ID del usuario logueado
  const res = await fetch(`${API_URL}pedidos/?id_prestador=${prestadorId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener los pedidos");
  return res.json();
}

/**
 * Actualiza un pedido (para enviar presupuesto, cambiar estado, etc.).
 * Endpoint: PATCH /pedidos/{pedido_id}
 */
export async function updatePedido(pedidoId, data) {
  const res = await fetch(`${API_URL}pedidos/${pedidoId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al actualizar el pedido");
  }
  return res.json();
}

/**
 * Elimina un pedido.
 * Endpoint: DELETE /pedidos/{pedido_id}
 */
export async function deletePedido(pedidoId) {
  const res = await fetch(`${API_URL}pedidos/${pedidoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    // No se envía body, tal como funciona en Postman
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al cancelar el pedido");
  }

  // La respuesta de éxito de un DELETE puede tener o no cuerpo.
  // Este código maneja ambos casos de forma segura.
  const responseText = await res.text();
  try {
    // Intenta parsear como JSON si hay contenido
    return JSON.parse(responseText);
  } catch (e) {
    // Si no hay contenido o no es JSON, devuelve un objeto de éxito
    return { success: true, message: "Pedido cancelado correctamente." };
  }
}