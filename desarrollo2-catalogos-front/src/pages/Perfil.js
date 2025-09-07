import React, { useEffect, useMemo, useState } from "react";
import {
Box,
Text,
Group,
Grid,
TextInput,
Button,
Divider,
Rating,
Progress,
Avatar,
LoadingOverlay,
Alert,
} from "@mantine/core";
import { Modal } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import AppLayout from "../components/LayoutTrabajosPendientes";
import { fetchZonas } from "../Api/zonas";
import Select from "react-select";
import { getPrestadorById, updatePrestador } from "../Api/prestadores";

function ensurePrestadorIdFromTokenLocal() {
const existing = localStorage.getItem("prestador_id");
if (existing && !Number.isNaN(parseInt(existing, 10))) {
return parseInt(existing, 10);
}
const token = localStorage.getItem("token");
if (!token) return null;

try {
const [, payload] = token.split(".");
if (!payload) return null;
const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
const cand = json?.prestador_id ?? json?.user_id ?? json?.id ?? json?.sub;
const id = typeof cand === "string" ? parseInt(cand, 10) : Number(cand);
if (Number.isFinite(id)) {
    localStorage.setItem("prestador_id", String(id));
    return id;
}
} catch {}
return null;
}

export default function Perfil() {
const [zonas, setZonas] = useState([]);
const [zonaSeleccionada, setZonaSeleccionada] = useState(null);

const [form, setForm] = useState({
nombre: "",
apellido: "",
email: "",
direccion: "",
telefono: "",
id_zona: null,
});

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [successOpen, setSuccessOpen] = useState(false);

const reviews = useMemo(
() => [
    { name: "Ana", text: "Muy buen trabajo, excelente atención.", rating: 5 },
    { name: "Lucía", text: "Cumplió con lo pactado, muy recomendable.", rating: 3.5 },
    { name: "Carlos", text: "Profesional y puntual.", rating: 5 },
],
[]
);

// Carga zonas + datos del prestador logueado
useEffect(() => {
const load = async () => {
    setLoading(true);
    setError("");
    try {
    const zones = await fetchZonas(); // Debe devolver [{value,label}, ...]
    setZonas(zones);

    // 1) Intentar leer prestador_id guardado
    // 2) Si falta, derivarlo del token (sin mostrarlo en UI)
    let prestadorId = localStorage.getItem("prestador_id");
    prestadorId = prestadorId ? parseInt(prestadorId, 10) : null;
    if (!prestadorId) prestadorId = ensurePrestadorIdFromTokenLocal();
    if (!prestadorId) throw new Error("Falta prestador_id. Iniciá sesión de nuevo.");

    const data = await getPrestadorById(prestadorId);

    setForm({
        nombre: data?.nombre || "",
        apellido: data?.apellido || "",
        email: data?.email || "",
        direccion: data?.direccion || "",
        telefono: data?.telefono || "",
        id_zona: data?.id_zona ?? null,
    });

    setZonaSeleccionada(
        data?.id_zona ? zones.find((z) => z.value === data.id_zona) || null : null
    );
    } catch (e) {
    setError(e.message || "Error cargando el perfil.");
    } finally {
    setLoading(false);
    }
};
load();
}, []);

const handleChange = (key) => (e) => {
const val = e?.target ? e.target.value : e;
setForm((prev) => ({ ...prev, [key]: val }));
};

const handleSubmit = async () => {
setSaving(true);
setError("");
try {
    let prestadorId = localStorage.getItem("prestador_id");
    prestadorId = prestadorId ? parseInt(prestadorId, 10) : null;
    if (!prestadorId) prestadorId = ensurePrestadorIdFromTokenLocal();
    if (!prestadorId) throw new Error("No se detectó sesión. Iniciá nuevamente.");

    const payload = {
    nombre: form.nombre?.trim(),
    apellido: form.apellido?.trim(),
    direccion: form.direccion?.trim(),
    email: form.email?.trim(),
    telefono: form.telefono?.trim(),
    id_zona: zonaSeleccionada ? zonaSeleccionada.value : null,
    };

    const updated = await updatePrestador(prestadorId, payload);

    // Si el back devuelve el objeto actualizado, refrescamos
    setForm((prev) => ({ ...prev, ...updated }));
    if (updated?.id_zona != null) {
    const found = zonas.find((z) => z.value === updated.id_zona) || null;
    setZonaSeleccionada(found);
    }

    setSuccessOpen(true);
} catch (e) {
    setError(e.message || "Error al actualizar el perfil.");
} finally {
    setSaving(false);
}
};

return (
<AppLayout>
    <Box
    p="lg"
    bg="white"
    style={{
        position: "relative",
        borderRadius: 16,
        boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
    }}
    >
    <LoadingOverlay visible={loading || saving} zIndex={1000} />
    <Text fw={700} fz="xl" mb="lg" ta="center">
        Mi Perfil
    </Text>

    {error && (
        <Alert color="red" mb="lg" title="Error">
        {error}
        </Alert>
    )}

    <Grid gutter="xl" align="stretch">
        {/* Columna izquierda */}
        <Grid.Col span={{ base: 12, md: 7 }}>
        <Box
            p="lg"
            bg="white"
            style={{
            borderRadius: 16,
            boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
            }}
        >
            <Text fw={600} fz="lg" mb="md" ta="center">
            Editar Perfil
            </Text>

            <Group grow mb="md">
            <TextInput
                label="Nombre"
                value={form.nombre}
                onChange={handleChange("nombre")}
            />
            <TextInput
                label="Apellido"
                value={form.apellido}
                onChange={handleChange("apellido")}
            />
            </Group>

            <Group grow mb="md">
            <TextInput
                label="Mail"
                value={form.email}
                onChange={handleChange("email")}
            />
            <TextInput label="DNI" placeholder="No modificable" disabled />
            </Group>

            <Group grow mb="md" style={{ alignItems: "flex-end" }}>
            <Box style={{ flex: 1 }}>
                <label
                style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 6,
                }}
                >
                Zona
                </label>
                <Select
                isMulti={false}
                options={zonas}
                placeholder="Seleccioná zona"
                value={zonaSeleccionada}
                onChange={(opt) => {
                    setZonaSeleccionada(opt);
                    setForm((prev) => ({ ...prev, id_zona: opt ? opt.value : null }));
                }}
                styles={{
                    control: (base) => ({ ...base, fontSize: 13, minHeight: 38 }),
                    option: (base) => ({ ...base, fontSize: 13, padding: "6px 10px" }),
                    singleValue: (base) => ({ ...base, fontSize: 12 }),
                    placeholder: (base) => ({ ...base, fontSize: 12 }),
                }}
                />
            </Box>
            <TextInput
                label="Dirección"
                value={form.direccion}
                onChange={handleChange("direccion")}
            />
            </Group>

            <Group grow mb="md">
            <TextInput
                label="Teléfono"
                value={form.telefono}
                onChange={handleChange("telefono")}
            />
            </Group>

            <Group justify="center" mt="md">
            <Button color="#93755E" onClick={handleSubmit} disabled={saving}>
                Actualizar
            </Button>
            </Group>

            <Divider my="sm" label="Tus Habilidades" labelPosition="center" />
            <TextInput placeholder="Buscar habilidad" mb="sm" />
            <Box mih={100} mb="md" style={{ border: "1px solid #ddd", borderRadius: 8 }} />
        </Box>
        </Grid.Col>


        <Grid.Col span={{ base: 12, md: 5 }}>
        <Box
            p="lg"
            bg="white"
            style={{
            borderRadius: 16,
            boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
            }}
        >
            <Text fw={600} fz="lg" mb="md" ta="center">
            Calificación
            </Text>
            <Group justify="center" mb="sm">
            <Text fz="xl" fw={700}>
                5.0
            </Text>
            <Rating value={5} readOnly />
            </Group>
            <Text ta="center" mb="md">
            (3 Reviews)
            </Text>
            <Box mb="lg">
            {[5, 4, 3, 2, 1].map((s) => (
                <Group key={s} spacing="xs" mb={4}>
                <Text w={20}>{s}</Text>
                <Progress value={s * 15} w="100%" color="#93755E" />
                </Group>
            ))}
            </Box>
            <Divider my="sm" />
            <Box style={{ maxHeight: 300, overflowY: "auto" }}>
            {reviews.map((r, i) => (
                <Box key={i} mb="md">
                <Group>
                    <Avatar radius="xl" color="#93755E">
                    {r.name[0]}
                    </Avatar>
                    <Text fw={600}>{r.name}</Text>
                    <Rating value={r.rating} readOnly size="sm" />
                </Group>
                <Text fz="sm" c="dimmed" mt={4}>
                    {r.text}
                </Text>
                </Box>
            ))}
            </Box>
        </Box>
        </Grid.Col>
    </Grid>

    <Modal
        opened={successOpen}
        onClose={() => setSuccessOpen(false)}
        centered
        withCloseButton
        title={
            <Group gap="xs">
            <IconCircleCheck size={20} />
            <Text fw={600}>¡Datos actualizados!</Text>
            </Group>
        }>
        <Group justify="center" mb="md">
            <Text c="#black" >Tus cambios se guardaron correctamente.</Text>
        </Group>
        
        <Group justify="end" mt="md">
            <Button color="#93755E" onClick={() => setSuccessOpen(false)}>
            Aceptar
            </Button>
        </Group>
        </Modal>
    </Box>
</AppLayout>
);
}
