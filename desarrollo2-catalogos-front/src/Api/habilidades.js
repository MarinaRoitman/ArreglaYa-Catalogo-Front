import { request } from "./http";

export const habilidadesApi = {
list:   ()           => request("/habilidades/"),                              
create: (payload)    => request("/habilidades/", { method: "POST", body: payload }),
update: (id, body)   => request(`/habilidades/${id}`, { method: "PUT",  body }),
patch:  (id, body)   => request(`/habilidades/${id}`, { method: "PATCH", body }),
remove: (id)         => request(`/habilidades/${id}`, { method: "DELETE" }),   // sin body
};
