import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Text, Button, Group, Stack, ThemeIcon } from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { API_URL } from "../Api/api";
import "../../src/Form.css";
import bcrypt from 'bcryptjs';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    dni: "",
    password: "",
    repitaContrasena: "",
  });

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni" || name === "telefono") {
      const isNumeric = value === '' || /^[0-9\b]+$/.test(value);
      if (!isNumeric) {
        return; 
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- INICIO DE CORRECCIONES ---

    // 1. Validar que las contraseñas coincidan
    if (formData.password !== formData.repitaContrasena) {
      setModalMsg("Las contraseñas no coinciden");
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    // 2. Validar longitud mínima de la contraseña
    if (formData.password.length < 8) {
      setModalMsg("La contraseña debe tener al menos 8 caracteres");
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    // 3. Validar complejidad de la contraseña (letras, números y símbolos)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setModalMsg("La contraseña debe incluir letras, números y caracteres especiales");
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    try {
        const salt = bcrypt.genSaltSync(10); 
        const hashedPassword = bcrypt.hashSync(formData.password, salt);

        const response = await fetch(`${API_URL}auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          password: hashedPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al registrar usuario");
      }

      setModalMsg("Registro exitoso. Ahora podés iniciar sesión.");
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
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          maxLength="50" 
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
          maxLength="50"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          maxLength="100"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
          maxLength="15"
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
          required
          maxLength="100"
        />
        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={formData.dni}
          onChange={handleChange}
          required
          maxLength="8"
        />
        <input
          className="full-width"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          maxLength="50"
        />
        <input
          className="full-width"
          type="password"
          name="repitaContrasena"
          placeholder="Repita la Contraseña"
          value={formData.repitaContrasena}
          onChange={handleChange}
          required
          maxLength="50"
        />

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

      {/* Modal elegante */}
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
          <ThemeIcon
            size={60}
            radius="xl"
            color={isSuccess ? "green" : "red"}
            variant="light"
          >
            {isSuccess ? (
              <IconCheck size={40} />
            ) : (
              <IconAlertCircle size={40} />
            )}
          </ThemeIcon>

          <Text ta="center" fw={700} fz="lg">
            {modalMsg}
          </Text>

          <Group justify="center" mt="sm">
            <Button
              onClick={handleClose}
              color={isSuccess ? "#93755E" : "#93755E"}
              radius="md"
              size="md"
              variant="filled"
            >
              {isSuccess ? "Ir a Login" : "Cerrar"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
