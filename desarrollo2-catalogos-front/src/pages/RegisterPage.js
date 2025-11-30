import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Text, Button, Group, Stack, ThemeIcon} from "@mantine/core";
import { IconCheck, IconAlertCircle, IconEye, IconEyeOff } from "@tabler/icons-react";
import { API_URL } from "../Api/api";
import { getPrestadores } from "../Api/prestadores"; 

import "../../src/Form.css";
import { PasswordInput } from "@mantine/core";


const MAX = {
  nombre: 40,
  apellido: 40,
  email: 40,
  telefono: 10,
  dni: 10,
  estado: 30,
  ciudad: 30,
  calle: 30,
  numero: 4,
  piso: 3,
  departamento: 2,
  password: 50,
};

const PROVINCIAS = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];


export default function RegisterPage() {
  const navigate = useNavigate();

  const [emailExiste, setEmailExiste] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    dni: "",
    estado: "",
    ciudad: "",
    calle: "",
    numero: "",
    piso: "",
    departamento: "",
    password: "",
    repitaContrasena: "",
  });

  // Modal de feedback
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Contador para habilitar botón "Ir a Login"
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (modalOpen && isSuccess) {
      setCountdown(5); // segundos
    } else {
      setCountdown(0);
    }
  }, [modalOpen, isSuccess]);

  useEffect(() => {
    if (!modalOpen || !isSuccess || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [modalOpen, isSuccess, countdown]);

  // Helpers
  const onlyDigits = (v) => v.replace(/[^\d]/g, "");
  const onlyLettersSpaces = (v) => v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
  const onlyLetters = (v) => v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const clamp = (v, len) => (typeof v === "string" ? v.slice(0, len) : v);

const handleChange = (e) => {
  const { name, value } = e.target;
  let v = value ?? "";

  if (name === "dni" || name === "telefono") {
    v = onlyDigits(v);
    v = clamp(v, MAX[name]);

  } else if (name === "estado") {
    v = clamp(v, MAX.estado);

  } else if (name === "ciudad") {
    v = onlyLettersSpaces(v);
    v = clamp(v, MAX.ciudad);

  } else if (name === "numero") {
    v = onlyDigits(v);
    v = clamp(v, MAX.numero);

  } else if (name === "piso") {
    v = onlyDigits(v);
    v = clamp(v, MAX.piso);

  } else if (name === "departamento") {
    v = onlyLetters(v);
    v = clamp(v, MAX.departamento);

  } else if (name === "calle") {
    v = clamp(v, MAX.calle);

  } else if (name === "nombre" || name === "apellido") {
    v = onlyLetters(v);
    v = clamp(v, MAX[name]);

  } else if (name === "email") {
    v = clamp(v, MAX.email);

    (async () => {
      try {
        const prestadores = await getPrestadores();

        const existe = prestadores.some(
          (p) => p.email?.toLowerCase() === v.trim().toLowerCase()
        );

        if (existe) {
          setEmailExiste(true);
          setModalMsg("El email ya está registrado.");
          setIsSuccess(false);
          setModalOpen(true);

        } else {
          setEmailExiste(false);
        }
      } catch (err) {
        console.warn("Error validando email:", err);
        setEmailExiste(false);
      }
    })();
  } 
  
  else if (name === "password" || name === "repitaContrasena") {
    v = clamp(v, MAX.password);
  }

  setFormData((prev) => ({ ...prev, [name]: v }));
};


  const fail = (msg) => {
    setModalMsg(msg);
    setIsSuccess(false);
    setModalOpen(true);
    return false;
  };

  const validateBeforeSubmit = () => {
    if (!formData.nombre.trim()) return fail("El nombre es obligatorio.");
    if (!formData.apellido.trim()) return fail("El apellido es obligatorio.");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!emailOk) return fail("Ingresá un e-mail válido.");
    if (emailExiste) return fail("El email ya está registrado.");

    if (!formData.telefono.trim()) return fail("El teléfono es obligatorio.");
    if (!/^\d+$/.test(formData.telefono)) return fail("El teléfono debe tener solo números.");
    if (!formData.dni.trim()) return fail("El DNI es obligatorio.");
    if (!/^\d+$/.test(formData.dni)) return fail("El DNI debe tener solo números.");

    if (!formData.estado.trim()) return fail("La provincia es obligatoria.");

    if (!formData.ciudad.trim()) return fail("La ciudad es obligatoria.");
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(formData.ciudad)) return fail("Ciudad: solo letras y espacios.");

    if (!formData.calle.trim()) return fail("La calle es obligatoria.");
    if (!formData.numero.trim()) return fail("El número es obligatorio.");
    if (!/^\d+$/.test(formData.numero)) return fail("Número: solo números.");

    if (formData.piso && !/^\d+$/.test(formData.piso)) return fail("Piso: solo números o dejalo vacío.");
    if (formData.departamento && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/.test(formData.departamento))
      return fail("Departamento: solo letras o dejalo vacío.");

    if (formData.password !== formData.repitaContrasena)
      return fail("Las contraseñas no coinciden.");
    if (formData.password.length < 8)
      return fail("La contraseña debe tener al menos 8 caracteres.");

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password))
      return fail("La contraseña debe incluir letras, números y caracteres especiales.");

    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateBeforeSubmit()) return;

  try {
    // Traer lista de prestadores para verificar email duplicado
    let prestadores = [];
    try {
      prestadores = await getPrestadores();
    } catch (err) {
      console.warn("No se pudo validar email contra prestadores:", err);
    }

    // Verificar duplicado
    const existeEmail = prestadores.some(
      (p) => p.email?.toLowerCase() === formData.email.trim().toLowerCase()
    );

    if (existeEmail) {
      return fail("El email ya está registrado.");
    }

    const response = await fetch(`${API_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        estado: formData.estado.trim(),
        ciudad: formData.ciudad.trim(),
        calle: formData.calle.trim(),
        numero: formData.numero.trim(),
        piso: (formData.piso ?? "").trim(),
        departamento: (formData.departamento ?? "").trim(),
      }),
    });

    if (!response.ok) {
      let msg = "Error al registrar usuario";
      try {
        const errorData = await response.json();
        msg = errorData.detail || msg;
      } catch {}
      throw new Error(msg);
    }

    setModalMsg("Registro exitoso. Ya podés iniciar sesión.");
    setIsSuccess(true);
    setModalOpen(true);

  } catch (error) {
    setModalMsg("Error en el registro: " + error.message);
    setIsSuccess(false);
    setModalOpen(true);
  }
};


  const handleClose = () => {
    setModalOpen(false);
    if (isSuccess) navigate("/login");
  };

  return (
    <>
      <div className="form-container">
        <div className="logo-container">
          <h2>Arregla Ya</h2>
          <p>Servicios a domicilio</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required maxLength={MAX.nombre} />
          <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required maxLength={MAX.apellido} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required maxLength={MAX.email} />
          <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required maxLength={MAX.telefono} inputMode="numeric" />
          <input type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} required maxLength={MAX.dni} inputMode="numeric" />

          {/* Dirección */}
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="custom-select"
          >
            <option value="">Seleccioná una provincia</option>
            {PROVINCIAS.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>

          <input type="text" name="ciudad" placeholder="Ciudad" value={formData.ciudad} onChange={handleChange} required maxLength={MAX.ciudad} />
          <input type="text" name="calle" placeholder="Calle" value={formData.calle} onChange={handleChange} required maxLength={MAX.calle} />
          <input type="text" name="numero" placeholder="Número/Altura" value={formData.numero} onChange={handleChange} required maxLength={MAX.numero} inputMode="numeric" />
          <input type="text" name="piso" placeholder="Piso (opcional)" value={formData.piso} onChange={handleChange} maxLength={MAX.piso} inputMode="numeric" />
          <input type="text" name="departamento" placeholder="Departamento (opcional)" value={formData.departamento} onChange={handleChange} maxLength={MAX.departamento} />


<div className="password-full">
          <PasswordInput
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            maxLength={MAX.password}
            visibilityToggleIcon={({ reveal }) =>
              reveal ? <IconEyeOff size={18} /> : <IconEye size={18} />
            }
            styles={{
              input: { borderRadius: "8px", height: "57px", marginBottom: "35px" },
              visibilityToggle: { right: "10px" },
            }}
          />

          <PasswordInput
            name="repitaContrasena"
            placeholder="Repita la contraseña"
            value={formData.repitaContrasena}
            onChange={handleChange}
            required
            maxLength={MAX.password}
            visibilityToggleIcon={({ reveal }) =>
              reveal ? <IconEyeOff size={18} /> : <IconEye size={18} />
            }
            styles={{
              input: { borderRadius: "8px", height: "57px" },
              visibilityToggle: { right: "10px" },
            }}
          />
          </div>

          <div className="btn-container">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
            <Link to="/login" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Modal */}
      <Modal
        opened={modalOpen}
        onClose={handleClose}
        centered
        radius="lg"
        size="sm"
        overlayProps={{ opacity: 0.4, blur: 3 }}
        withCloseButton={false}
        styles={{
          content: { padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon size={60} radius="xl" color={isSuccess ? "green" : "red"} variant="light">
            {isSuccess ? <IconCheck size={40} /> : <IconAlertCircle size={40} />}
          </ThemeIcon>
          <Text ta="center" fw={700} fz="lg">
            {modalMsg}
          </Text>

          {isSuccess && (
            <Text ta="center" fz="sm" c="dimmed">
              El botón se habilitará en {countdown > 0 ? countdown : 0} segundos.
            </Text>
          )}

          <Group justify="center" mt="sm">
            <Button
              onClick={handleClose}
              color="#93755E"
              radius="md"
              size="md"
              variant="filled"
              disabled={isSuccess && countdown > 0}
            >
              {isSuccess
                ? countdown > 0
                  ? `Ir a Login (${countdown})`
                  : "Ir a Login"
                : "Cerrar"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <style>{`
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-wrapper input {
          width: 100%;
          padding-right: 35px;
        }
        .eye-icon {
          position: absolute;
          right: 8px;
          top: 35%;
          transform: translateY(-50%);
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
