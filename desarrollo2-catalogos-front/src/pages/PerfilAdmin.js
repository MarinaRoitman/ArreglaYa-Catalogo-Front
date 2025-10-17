import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AppShell, Paper, Group, Text, TextInput, Button, Stack, Divider,
  LoadingOverlay, Alert, Modal, Avatar, FileButton
} from "@mantine/core";
import { IconAlertCircle, IconTrash, IconDeviceFloppy, IconKey } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import * as CloudinaryAPI from "../Api/cloudinary";
import {
getAdminById,
updateAdmin,
changeAdminPassword,
deleteAdmin,
listAdmins,
} from "../Api/admins";

/* ================ Utils ================ */
function parseJwt(token) {
try {
const [, payload] = token.split(".");
return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
} catch {
return null;
}
}

function resolveAdminIdSync() {
const keys = ["id", "id_admin", "admin_id"];
for (const k of keys) {
const v = localStorage.getItem(k);
if (v && String(v).trim()) return String(v).trim();
}
const token = localStorage.getItem("token");
const data = token ? parseJwt(token) : null;
const candidate = data?.id ?? data?.id_admin ?? data?.admin_id;
return candidate != null ? String(candidate) : null;
}

function normalizeAdmin(raw = {}) {
const nombre =
raw.nombre ??
raw.first_name ??
raw.name ??
(raw.nombreCompleto ? String(raw.nombreCompleto).split(" ")[0] : "") ??
"";

const apellido =
raw.apellido ??
raw.last_name ??
raw.surname ??
(raw.nombreCompleto ? String(raw.nombreCompleto).split(" ").slice(1).join(" ") : "") ??
"";

const email = raw.email ?? raw.correo ?? raw.mail ?? "";

const foto =
raw.foto ??
raw.foto_url ??
raw.fotoUrl ??
raw.avatar ??
raw.imagen ??
raw.image ??
"";

const id = raw.id ?? raw.id_admin ?? raw.admin_id ?? null;
const activo = raw.activo ?? true;

return { id, nombre, apellido, email, foto, activo };
}

function shallowEqualProfile(a, b) {
return (
(a?.nombre ?? "") === (b?.nombre ?? "") &&
(a?.apellido ?? "") === (b?.apellido ?? "") &&
(a?.email ?? "") === (b?.email ?? "")
);
}

/* ===== Validaciones ===== */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_LETTER_RE = /[A-Za-z]/;
const PWD_NUMBER_RE = /[0-9]/;

function validateProfile(values) {
const errors = {};
const nombre = (values.nombre || "").trim();
const apellido = (values.apellido || "").trim();
const email = (values.email || "").trim();

if (!nombre) errors.nombre = "El nombre es obligatorio.";
else if (nombre.length > 50) errors.nombre = "Máximo 50 caracteres.";
else if (nombre.length < 1) errors.nombre = "Debe tener al menos 1 carácter.";

if (!apellido) errors.apellido = "El apellido es obligatorio.";
else if (apellido.length > 50) errors.apellido = "Máximo 50 caracteres.";
else if (apellido.length < 1) errors.apellido = "Debe tener al menos 1 carácter.";

if (!email) errors.email = "El email es obligatorio.";
else if (email.length > 100) errors.email = "Máximo 100 caracteres.";
else if (!EMAIL_RE.test(email)) errors.email = "Formato de email inválido.";

return errors;
}

function validatePassword(values) {
const errors = {};
const newPwd = values.newPwd || "";
const newPwd2 = values.newPwd2 || "";

if (!newPwd) errors.newPwd = "La contraseña es obligatoria.";
else {
if (newPwd.length < 8) errors.newPwd = "Mínimo 8 caracteres.";
else if (!PWD_LETTER_RE.test(newPwd) || !PWD_NUMBER_RE.test(newPwd)) {
    errors.newPwd = "Debe incluir letras y números.";
}
}

if (!newPwd2) errors.newPwd2 = "Repetí la contraseña.";
else if (newPwd2 !== newPwd) errors.newPwd2 = "Las contraseñas no coinciden.";

return errors;
}
/* ====================================== */

export default function AdminPerfil() {
const navigate = useNavigate();

const [navOpened, setNavOpened] = useState(false);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [info, setInfo] = useState("");

const [me, setMe] = useState(null);
  const [originalForm, setOriginalForm] = useState(null); // Para comparar cambios
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "" });
  const [formErrors, setFormErrors] = useState({});

  // --- Estados de la foto idénticos a Perfil.js ---
  const [fotoUrl, setFotoUrl] = useState("");       // Foto actual guardada
  const [fotoFile, setFotoFile] = useState(null);     // Nuevo archivo a subir
  const [fotoPreview, setFotoPreview] = useState(""); // Vista previa en el avatar// La vista previa que se muestra

const [pwd, setPwd] = useState({ newPwd: "", newPwd2: "" });
const [pwdErrors, setPwdErrors] = useState({});   // << errores de password
const [pwdSaving, setPwdSaving] = useState(false);

const [confirmOpen, setConfirmOpen] = useState(false);

const idAdminSync = useMemo(() => resolveAdminIdSync(), []);

const discoverIdByEmail = useCallback(async () => {
const token = localStorage.getItem("token");
const data = token ? parseJwt(token) : null;
const emailFromToken = data?.sub || data?.email;
if (!emailFromToken) return null;

const all = await listAdmins();
const match = Array.isArray(all)
    ? all.find((a) => (a?.email || "").toLowerCase().trim() === emailFromToken.toLowerCase().trim())
    : null;

if (match?.id != null) {
    localStorage.setItem("id", String(match.id));
    return String(match.id);
}
return null;
}, []);

const loadMe = useCallback(async () => {
setInfo("");
try {
    setLoading(true);

    let targetId = idAdminSync;
    if (!targetId) {
    targetId = await discoverIdByEmail();
    }

    if (!targetId) {
    setError("No se pudo determinar tu usuario (id). Iniciá sesión nuevamente.");
    return;
    }

    const data = await getAdminById(targetId);
    const norm = normalizeAdmin(data);

    if (!norm.id) {
    setError("Admin no encontrado.");
    return;
    }

    setMe(norm);


setMe(norm);
      
      const initialForm = {
        nombre: norm.nombre,
        apellido: norm.apellido,
        email: norm.email,
      };
      setForm(initialForm);
      setOriginalForm(initialForm); 
    
      setFotoUrl(norm.foto);
      setFotoPreview(norm.foto);
      
      localStorage.setItem("userFoto", norm.foto);

    
} catch (e) {
    if (e?.code === "AUTH") {
    navigate("/login", { replace: true });
    return;
    }
    const msg = e?.message || "";
    if (/no encontrado/i.test(msg)) {
    setError("Admin no encontrado.");
    } else {
    setError(msg || "Error al cargar el perfil.");
    }
} finally {
    setLoading(false);
}
}, [idAdminSync, discoverIdByEmail, navigate]);

useEffect(() => {
loadMe();
}, [loadMe]);

useEffect(() => {
  if (!fotoFile) {
    return;
  }
  const objectUrl = URL.createObjectURL(fotoFile);
  setFotoPreview(objectUrl);

  return () => URL.revokeObjectURL(objectUrl);
}, [fotoFile]);

const isDirty = useMemo(() => {
if (!me) return false;
return !shallowEqualProfile(form, me);
}, [form, me]);

const profileValid = useMemo(() => {
const errs = validateProfile(form);
return Object.keys(errs).length === 0;
}, [form]);

const handleChange = (key) => (e) => {
setInfo("");
const value = e.target.value;
const next = { ...form, [key]: value };
setForm(next);
setFormErrors({}); // Iniciar sin errores visuales
};

const handleSave = async () => {
    setError("");
    setInfo("");
  
    const hasFotoChange = fotoFile != null;
    // Comparamos contra el estado original, no contra 'me'
    const hasFormChanges = !shallowEqualProfile(form, originalForm);
  
    if (!hasFormChanges && !hasFotoChange) {
      setInfo("No hay cambios para guardar.");
      return;
    }
  
    const errs = validateProfile(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Revisá los campos del perfil.");
      return;
    }
  
    const targetId = me?.id;
    if (!targetId) {
      setError("ID de Admin no encontrado.");
      return;
    }
  
    try {
      setSaving(true);
  
      const payload = { ...form };
      payload.id = targetId; 
  
      if (hasFotoChange) {
      const newFotoUrl = await CloudinaryAPI.uploadImageToCloudinary(fotoFile);
      payload.foto = newFotoUrl;
      localStorage.setItem("userFoto", newFotoUrl);
    }
  
      if (hasFormChanges || hasFotoChange) {
        const updated = await updateAdmin(targetId, payload);
        const norm = normalizeAdmin(updated);
  
        setMe(norm); // Actualizamos el admin completo
        const updatedForm = { nombre: norm.nombre, apellido: norm.apellido, email: norm.email };
        setForm(updatedForm);
        setOriginalForm(updatedForm); // Reseteamos el estado original
  
        if (hasFotoChange) {
          setFotoUrl(norm.foto);
          setFotoFile(null); // Limpiamos el archivo para evitar re-subidas
        }
      }
  
      setInfo("Cambios guardados.");
      
    } catch (e) {
      setError(e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

const handleChangePassword = async () => {
setError("");
setInfo("");

// Validación de contraseña
const errs = validatePassword(pwd);
setPwdErrors(errs);
if (Object.keys(errs).length > 0) return;

const targetId = me?.id ?? idAdminSync;
if (!targetId) {
    setError("Admin no encontrado.");
    return;
}

try {
    setPwdSaving(true);
    await changeAdminPassword(targetId, pwd.newPwd);
    setPwd({ newPwd: "", newPwd2: "" });
    setPwdErrors({});
    setInfo("Contraseña actualizada.");
    setError("");
} catch (e) {
    if (e?.code === "AUTH") {
    navigate("/login", { replace: true });
    return;
    }
    const msg = e?.message || "";
    if (/no encontrado/i.test(msg)) {
    setError("Admin no encontrado.");
    } else {
    setError(msg || "No se pudo cambiar la contraseña.");
    }
} finally {
    setPwdSaving(false);
}
};

const handleDelete = async () => {
setError("");
setInfo("");

const targetId = me?.id ?? idAdminSync;
if (!targetId) {
    setError("Admin no encontrado.");
    setConfirmOpen(false);
    return;
}

try {
    await deleteAdmin(targetId);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("prestador_id");
    localStorage.removeItem("id_admin");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("id");
    sessionStorage.clear();
    navigate("/login", { replace: true });
} catch (e) {
    if (e?.code === "AUTH") {
    navigate("/login", { replace: true });
    return;
    }
    const msg = e?.message || "";
    if (/no encontrado/i.test(msg)) {
    setError("Admin no encontrado.");
    } else {
    setError(msg || "No se pudo eliminar la cuenta.");
    }
} finally {
    setConfirmOpen(false);
}
};

return (
<AppShell
    header={{ height: 56 }}
    navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !navOpened } }}
    padding="md"
>
    <AppShell.Header>
    <Header opened={navOpened} toggle={() => setNavOpened((o) => !o)} />
    </AppShell.Header>

    <AppShell.Navbar p="0">
    <Sidebar />
    </AppShell.Navbar>

    <AppShell.Main>
    <Paper p="lg" radius="md" withBorder pos="relative">
        <LoadingOverlay visible={loading || saving} zIndex={1000} />
        <Stack gap="md">
        <Text fw={600} size="lg">Mi Perfil (Admin)</Text>

        {(error || info) && (
            <Alert
            color={error ? "red" : "green"}
            icon={<IconAlertCircle size={16} />}
            variant="light"
            >
            {error || info}
            </Alert>
        )}

{/* --- SECCIÓN DE FOTO DE PERFIL --- */}
{/* --- SECCIÓN DE FOTO DE PERFIL --- */}
<Stack align="center" gap="md">
  <Avatar src={fotoPreview} size={120} radius="100%" />
  <Group>
    <FileButton onChange={setFotoFile} accept="image/png,image/jpeg">
      {(props) => <Button {...props}>Seleccionar foto</Button>}
    </FileButton>
<Button
      variant="default"
      onClick={() => {
        setFotoFile(null);
        setFotoPreview(fotoUrl); // Vuelve a la foto original guardada
      }}
      disabled={!fotoFile}
    >
      Cancelar
    </Button>
  </Group>
</Stack>

        <Divider />

        {/* DATOS BÁSICOS */}
        <Stack gap="sm">
            <Group grow>
            <TextInput
                label="Nombre"
                withAsterisk
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange("nombre")}
                maxLength={50}
                error={formErrors.nombre}
            />
            <TextInput
                label="Apellido"
                withAsterisk
                placeholder="Tu apellido"
                value={form.apellido}
                onChange={handleChange("apellido")}
                maxLength={50}
                error={formErrors.apellido}
            />
            </Group>
            <TextInput
            label="Email"
            withAsterisk
            placeholder="tucorreo@mail.com"
            value={form.email}
            onChange={handleChange("email")}
            maxLength={100}
            error={formErrors.email}
            />

            <Group justify="flex-end" mt="xs">
            <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
            disabled={(!isDirty && !fotoFile) || !profileValid}
            >
                Guardar cambios
            </Button>
            </Group>
        </Stack>

        <Divider />

        {/* CAMBIO DE CONTRASEÑA */}
        <Stack gap="sm" align="center">
            <Text fw={600}>Cambiar contraseña</Text>
            <Group grow>
            <TextInput
                type="password"
                label="Nueva contraseña"
                placeholder="Mín. 8, con letras y números"
                value={pwd.newPwd}
                onChange={(e) => {
                const next = { ...pwd, newPwd: e.target.value };
                setPwd(next);
                setPwdErrors(validatePassword(next));
                }}
                error={pwdErrors.newPwd}
            />
            <TextInput
                type="password"
                label="Repetir nueva contraseña"
                value={pwd.newPwd2}
                onChange={(e) => {
                const next = { ...pwd, newPwd2: e.target.value };
                setPwd(next);
                setPwdErrors(validatePassword(next));
                }}
                error={pwdErrors.newPwd2}
            />
            </Group>
            <Group justify="flex-end" mt="xs">
            <Button
                variant="light"
                leftSection={<IconKey size={16} />}
                loading={pwdSaving}
                onClick={handleChangePassword}
                disabled={Object.keys(pwdErrors).length > 0 || !pwd.newPwd || !pwd.newPwd2}
            >
                Cambiar contraseña
            </Button>
            </Group>
        </Stack>

        <Divider />

        {/* ELIMINAR CUENTA */}
        <Group mt="sm" justify="center">
            <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => setConfirmOpen(true)}
            >
            Eliminar Cuenta
            </Button>
        </Group>

        <Modal
            opened={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Confirmar eliminación"
            centered
        >
            <Stack>
            <Text>Esta acción es irreversible. ¿Querés eliminar tu cuenta de administrador?</Text>
            <Group justify="flex-end">
                <Button variant="default" onClick={() => setConfirmOpen(false)}>
                Cancelar
                </Button>
                <Button color="red" onClick={handleDelete}>
                Sí, eliminar
                </Button>
            </Group>
            </Stack>
        </Modal>
        </Stack>
    </Paper>
    </AppShell.Main>
</AppShell>
);
}
