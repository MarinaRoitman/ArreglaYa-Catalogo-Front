import { request } from "./http";

export async function login({ email, password }) {
const data = await request("/auth/login", {
method: "POST",
body: { email, password },
});

const { access_token } = data;
if (!access_token) throw new Error("No se recibió access_token.");

// Limpio lo viejo y guardo el nuevo token
localStorage.removeItem("token");
localStorage.removeItem("prestador_id");
localStorage.setItem("token", access_token);

try {
const [, payload] = access_token.split(".");
const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
const cand = parsed?.prestador_id ?? parsed?.user_id ?? parsed?.id ?? parsed?.sub;
if (cand != null) localStorage.setItem("prestador_id", String(cand));
} catch (_) {
}
return data;
}

export function logout() {
localStorage.removeItem("token");
localStorage.removeItem("prestador_id");
}
