import { request } from "./http";

export function getPrestadorById(id) {
return request(`/prestadores/${id}`);
}

export function updatePrestador(id, payload) {
return request(`/prestadores/${id}`, {
method: "PATCH",
body: payload,
});
}

export function deletePrestador(id) {
return request(`/prestadores/${id}`, {
method: "DELETE",
});
}
