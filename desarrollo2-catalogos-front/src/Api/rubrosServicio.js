import { request } from "./http";

export const rubrosApi = {
list:   ()           => request("/rubros/"),                                   // GET
create: (payload)    => request("/rubros", { method: "POST", body: payload }),
update: (id, body)   => request(`/rubros/${id}`, { method: "PATCH", body }),   // o PUT 
remove: (id)         => request(`/rubros/${id}`, { method: "DELETE" }),        // sin body
};
