    import { API_URL } from "./api";

    // helper para auth
    function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    }

    // POST: Crear evento
    export async function crearEvento() {
    const res = await fetch(`${API_URL}eventos/`, {
    method: "POST",
    headers: getAuthHeaders(),   
    body: "",                    
    });

    if (!res.ok) {
    const errorText = await res.text();
    console.error("Error crearEvento:", errorText);
    throw new Error(errorText || "Error al crear el evento");
    }

    // Si devuelve JSON lo parseamos, si no, devolvemos texto
    try {
    return await res.json();
    } catch {
    return await res.text();
    }
    }
