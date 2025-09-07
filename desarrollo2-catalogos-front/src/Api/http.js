import { API_URL } from "./api.js";

export async function request(path, { method = "GET", body, headers } = {}) {
const token = localStorage.getItem("token"); 
const res = await fetch(`${API_URL }${path}`, {
method,
headers: {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
},
body: body ? JSON.stringify(body) : undefined, // ❗ GET/DELETE sin body
});

const text = await res.text();
let data;
try { data = text ? JSON.parse(text) : null; } catch { data = text; }

if (!res.ok) {
const err = new Error(data?.message || res.statusText);
err.status = res.status;
err.data = data;
throw err;
}
return data;
}
