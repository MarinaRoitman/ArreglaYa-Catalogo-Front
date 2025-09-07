export async function fetchZonas() {
try {
const response = await fetch("https://api.desarrollo2-catalogos.online/zonas/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
});

if (!response.ok) {
    throw new Error("Error al obtener zonas");
}

const data = await response.json();
return data.map((zona) => ({
    value: zona.id.toString(),
    label: zona.nombre,
}));
} catch (error) {
console.error("Error fetching zonas:", error);
return [];
}
}
